"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DotfileEntry,
  PlatformData,
  InstallResult,
  SeedResult,
} from "@/lib/schemas";
import { z } from "zod/v4";
import { useTerminalActions } from "@/context/TerminalContext";
import { fetchApi } from "@/lib/api";

export function useDotfiles() {
  const [dotfiles, setDotfiles] = useState<DotfileEntry[]>([]);
  const [platform, setPlatform] = useState<PlatformData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(false);
  const { addLine } = useTerminalActions();

  const fetchShell = useCallback(async () => {
    const data = await fetchApi("/api/shell", PlatformData);
    setPlatform(data);
    return data;
  }, []);

  const seedDefaults = useCallback(async () => {
    return fetchApi("/api/seed", SeedResult, { method: "POST" });
  }, []);

  const fetchDotfiles = useCallback(async () => {
    const data = await fetchApi("/api/dotfiles", z.array(DotfileEntry));
    setDotfiles(data);
    return data;
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
      addLine("info", `Config file: ${platformData.shell.configPath}`);

      if (!seeded) {
        addLine("info", "Seeding default dotfiles...");
        const seedResult = await seedDefaults();
        const parts = [
          `${seedResult.seeded} new`,
          `${seedResult.updated} updated`,
          `${seedResult.skipped} unchanged`,
        ];
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
        setError(null);
        addLine("command", `Installing ${filename}...`);
        addLine("info", "Checking installation state...");

        const data = await fetchApi("/api/install", InstallResult, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename, variables }),
        });

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
        setError(msg);
        addLine("error", msg);
        return null;
      }
    },
    [addLine]
  );

  const uninstall = useCallback(
    async (filename: string): Promise<InstallResult | null> => {
      try {
        setError(null);
        addLine("command", `Uninstalling ${filename}...`);
        addLine("info", "Locating source entry...");

        const data = await fetchApi("/api/uninstall", InstallResult, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename }),
        });

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
        setError(msg);
        addLine("error", msg);
        return null;
      }
    },
    [addLine]
  );

  const refresh = useCallback(async () => {
    try {
      setError(null);
      addLine("info", "Refreshing dotfiles...");
      await seedDefaults();
      const files = await fetchDotfiles();
      addLine("success", `Refresh complete: ${files.length} dotfiles loaded.`);
      return files;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Refresh failed";
      setError(msg);
      addLine("error", msg);
      return null;
    }
  }, [seedDefaults, fetchDotfiles, addLine]);

  return {
    dotfiles,
    platform,
    loading,
    error,
    install,
    uninstall,
    refresh,
  };
}
