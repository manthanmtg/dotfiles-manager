"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DotfileEntry,
  PlatformData,
  InstallResult,
  SeedResult,
} from "@/lib/schemas";
import { z } from "zod/v4";
import { useTerminalLogger } from "@/hooks/useTerminalLogger";

export function useDotfiles() {
  const [dotfiles, setDotfiles] = useState<DotfileEntry[]>([]);
  const [platform, setPlatform] = useState<PlatformData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(false);
  const { terminalLines, addLine, clearTerminal } = useTerminalLogger();

  const fetchShell = useCallback(async () => {
    const res = await fetch("/api/shell");
    const json = await res.json();
    if (json.success) {
      const data = PlatformData.parse(json.data);
      setPlatform(data);
      return data;
    }
    throw new Error(json.error || "Failed to detect shell");
  }, []);

  const seedDefaults = useCallback(async () => {
    const res = await fetch("/api/seed", { method: "POST" });
    const json = await res.json();
    if (json.success) {
      return SeedResult.parse(json.data);
    }
    throw new Error(json.error || "Failed to seed dotfiles");
  }, []);

  const fetchDotfiles = useCallback(async () => {
    const res = await fetch("/api/dotfiles");
    const json = await res.json();
    if (json.success) {
      const data = z.array(DotfileEntry).parse(json.data);
      setDotfiles(data);
      return data;
    }
    throw new Error(json.error || "Failed to fetch dotfiles");
  }, []);

  const initialize = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      addLine("info", "Initializing dotfiles-manager...");
      const platformData = await fetchShell();
      addLine(
        "success",
        `Detected shell: ${platformData.shell.shell} (${platformData.platform})`
      );
      addLine(
        "info",
        `Config file: ${platformData.shell.configPath}`
      );

      if (!seeded) {
        addLine("info", "Seeding default dotfiles...");
        const seedResult = await seedDefaults();
        const parts = [`${seedResult.seeded} new`, `${seedResult.updated} updated`, `${seedResult.skipped} unchanged`];
        addLine("success", `Sync complete: ${parts.join(", ")}`);
        setSeeded(true);
      }

      addLine("info", "Loading dotfiles...");
      const files = await fetchDotfiles();
      addLine("success", `Loaded ${files.length} dotfiles`);
      addLine("success", "Ready.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      addLine("error", msg);
    } finally {
      setLoading(false);
    }
  }, [addLine, fetchShell, fetchDotfiles, seedDefaults, seeded]);

  useEffect(() => {
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const install = useCallback(
    async (
      filename: string,
      variables?: Record<string, string>
    ): Promise<InstallResult | null> => {
      try {
        addLine("command", `Installing ${filename}...`);
        addLine("info", "Checking installation state...");

        const res = await fetch("/api/install", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename, variables }),
        });

        const json = await res.json();

        if (!json.success) {
          addLine("error", json.error || "Installation failed");
          return null;
        }

        const data = InstallResult.parse(json.data);

        addLine("info", `Locating ${data.configPath}...`);
        addLine("info", `Injecting source command for ${filename}...`);
        addLine("success", data.message);

        setDotfiles((prev) =>
          prev.map((dotfile) =>
            dotfile.filename === filename
              ? { ...dotfile, installed: true }
              : dotfile
          )
        );
        return data;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Install failed";
        addLine("error", msg);
        return null;
      }
    },
    [addLine]
  );

  const uninstall = useCallback(
    async (filename: string): Promise<InstallResult | null> => {
      try {
        addLine("command", `Uninstalling ${filename}...`);
        addLine("info", "Locating source entry...");

        const res = await fetch("/api/uninstall", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename }),
        });

        const json = await res.json();

        if (!json.success) {
          addLine("error", json.error || "Uninstallation failed");
          return null;
        }

        const data = InstallResult.parse(json.data);

        addLine("info", `Removing source line from ${data.configPath}...`);
        addLine("success", data.message);

        setDotfiles((prev) =>
          prev.map((dotfile) =>
            dotfile.filename === filename
              ? { ...dotfile, installed: false }
              : dotfile
          )
        );
        return data;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Uninstall failed";
        addLine("error", msg);
        return null;
      }
    },
    [addLine]
  );

  const refresh = useCallback(async () => {
    await seedDefaults();
    return fetchDotfiles();
  }, [seedDefaults, fetchDotfiles]);

  return {
    dotfiles,
    platform,
    loading,
    error,
    terminalLines,
    install,
    uninstall,
    refresh,
    addLine,
    clearTerminal,
  };
}
