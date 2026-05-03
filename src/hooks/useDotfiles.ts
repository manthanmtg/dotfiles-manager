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

export function useDotfiles() {
  const [dotfiles, setDotfiles] = useState<DotfileEntry[]>([]);
  const [platform, setPlatform] = useState<PlatformData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(false);
  const { addLine, clearTerminal } = useTerminalActions();

  const fetchApi = useCallback(
    async <T>(
      url: string,
      schema: z.ZodType<T>,
      options?: RequestInit & { timeout?: number }
    ): Promise<T> => {
      const { timeout = 10000, ...fetchOptions } = options || {};

      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);

      try {
        const res = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
        });

        clearTimeout(id);

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          throw new Error(
            `Server returned non-JSON response (${res.status}): ${text.slice(0, 100)}...`
          );
        }

        const json: unknown = await res.json();

        // We use a loose schema for the initial envelope check to avoid any
        const envelopeSchema = z.object({
          success: z.boolean(),
          data: z.unknown().optional(),
          error: z.string().optional(),
        });

        const envelope = envelopeSchema.parse(json);

        if (envelope.success && envelope.data !== undefined) {
          return schema.parse(envelope.data);
        }

        throw new Error(envelope.error || `API request failed: ${url}`);
      } catch (err) {
        clearTimeout(id);
        if (err instanceof Error && err.name === "AbortError") {
          throw new Error(`Request timed out after ${timeout}ms: ${url}`);
        }
        throw err;
      }
    },
    []
  );

  const fetchShell = useCallback(async () => {
    const data = await fetchApi("/api/shell", PlatformData);
    setPlatform(data);
    return data;
  }, [fetchApi]);

  const seedDefaults = useCallback(async () => {
    return fetchApi("/api/seed", SeedResult, { method: "POST" });
  }, [fetchApi]);

  const fetchDotfiles = useCallback(async () => {
    const data = await fetchApi("/api/dotfiles", z.array(DotfileEntry));
    setDotfiles(data);
    return data;
  }, [fetchApi]);

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
        addLine("error", msg);
        return null;
      }
    },
    [addLine, fetchApi]
  );

  const uninstall = useCallback(
    async (filename: string): Promise<InstallResult | null> => {
      try {
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
        addLine("error", msg);
        return null;
      }
    },
    [addLine, fetchApi]
  );

  const refresh = useCallback(async () => {
    await seedDefaults();
    return fetchDotfiles();
  }, [seedDefaults, fetchDotfiles]);

  const retry = useCallback(() => {
    initialize();
  }, [initialize]);

  return {
    dotfiles,
    platform,
    loading,
    error,
    install,
    uninstall,
    refresh,
    retry,
    addLine,
    clearTerminal,
  };
}
