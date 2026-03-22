"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  DotfileEntry,
  PlatformData,
  ApiResponse,
  InstallResult,
  TerminalLine,
} from "@/types";

export function useDotfiles() {
  const [dotfiles, setDotfiles] = useState<DotfileEntry[]>([]);
  const [platform, setPlatform] = useState<PlatformData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [seeded, setSeeded] = useState(false);

  const addLine = useCallback(
    (type: TerminalLine["type"], text: string) => {
      setTerminalLines((prev) => [
        ...prev,
        { type, text, timestamp: Date.now() },
      ]);
    },
    []
  );

  const clearTerminal = useCallback(() => {
    setTerminalLines([]);
  }, []);

  const fetchShell = useCallback(async () => {
    const res = await fetch("/api/shell");
    const data: ApiResponse<PlatformData> = await res.json();
    if (data.success && data.data) {
      setPlatform(data.data);
      return data.data;
    }
    throw new Error(data.error || "Failed to detect shell");
  }, []);

  const seedDefaults = useCallback(async () => {
    const res = await fetch("/api/seed", { method: "POST" });
    const data: ApiResponse<{
      seeded: number;
      updated: number;
      skipped: number;
    }> = await res.json();
    if (data.success && data.data) {
      return data.data;
    }
    throw new Error(data.error || "Failed to seed dotfiles");
  }, []);

  const fetchDotfiles = useCallback(async () => {
    const res = await fetch("/api/dotfiles");
    const data: ApiResponse<DotfileEntry[]> = await res.json();
    if (data.success && data.data) {
      setDotfiles(data.data);
      return data.data;
    }
    throw new Error(data.error || "Failed to fetch dotfiles");
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

        const data: ApiResponse<InstallResult> = await res.json();

        if (!data.success) {
          addLine("error", data.error || "Installation failed");
          return null;
        }

        addLine("info", `Locating ${data.data!.configPath}...`);
        addLine("info", `Injecting source command for ${filename}...`);
        addLine("success", data.data!.message);

        await fetchDotfiles();
        return data.data!;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Install failed";
        addLine("error", msg);
        return null;
      }
    },
    [addLine, fetchDotfiles]
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

        const data: ApiResponse<InstallResult> = await res.json();

        if (!data.success) {
          addLine("error", data.error || "Uninstallation failed");
          return null;
        }

        addLine("info", `Removing source line from ${data.data!.configPath}...`);
        addLine("success", data.data!.message);

        await fetchDotfiles();
        return data.data!;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Uninstall failed";
        addLine("error", msg);
        return null;
      }
    },
    [addLine, fetchDotfiles]
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
