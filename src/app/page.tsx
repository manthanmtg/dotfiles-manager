"use client";

import { useState, useMemo, useCallback } from "react";
import { useDotfiles } from "@/hooks/useDotfiles";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { DotfileCard } from "@/components/DotfileCard";
import { DotfilesList } from "@/components/DotfilesList";
import { TerminalConsole } from "@/components/TerminalConsole";
import { VariableModal } from "@/components/VariableModal";
import { CodePreview } from "@/components/CodePreview";
import { LoadingScreen } from "@/components/LoadingScreen";
import { PlatformGuard } from "@/components/PlatformGuard";
import type { DotfileCategory, DotfileEntry } from "@/types";

export default function Home() {
  const {
    dotfiles,
    platform,
    loading,
    error,
    terminalLines,
    install,
    uninstall,
    refresh,
    clearTerminal,
  } = useDotfiles();

  const [activeCategory, setActiveCategory] = useState<
    DotfileCategory | "all"
  >("all");
  const [search, setSearch] = useState("");
  const [installingFile, setInstallingFile] = useState<string | null>(null);
  const [variableModal, setVariableModal] = useState<DotfileEntry | null>(null);
  const [previewModal, setPreviewModal] = useState<DotfileEntry | null>(null);

  const dotfileByFilename = useMemo(() => {
    const map = new Map<string, DotfileEntry>();
    for (const dotfile of dotfiles) {
      map.set(dotfile.filename, dotfile);
    }
    return map;
  }, [dotfiles]);

  const filtered = useMemo(() => {
    let result = dotfiles;
    if (activeCategory !== "all") {
      result = result.filter((d) => d.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.filename.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [dotfiles, activeCategory, search]);

  const grouped = useMemo(() => {
    const groups: Partial<Record<DotfileCategory, DotfileEntry[]>> = {};
    for (const d of filtered) {
      if (!groups[d.category]) groups[d.category] = [];
      groups[d.category]!.push(d);
    }
    return groups;
  }, [filtered]);

  const installedCount = useMemo(
    () => dotfiles.filter((d) => d.installed).length,
    [dotfiles]
  );

  const handleInstall = useCallback(
    async (filename: string) => {
      const dotfile = dotfileByFilename.get(filename);
      if (!dotfile) return;

      if (dotfile.variables.length > 0) {
        setVariableModal(dotfile);
        return;
      }
      setInstallingFile(dotfile.filename);
      await install(filename);
      setInstallingFile(null);
    },
    [dotfileByFilename, install]
  );

  const handleVariableSubmit = useCallback(
    async (values: Record<string, string>) => {
      if (!variableModal) return;
      setInstallingFile(variableModal.filename);
      await install(variableModal.filename, values);
      setInstallingFile(null);
      setVariableModal(null);
    },
    [variableModal, install]
  );

  const handleUninstall = useCallback(
    async (filename: string) => {
      setInstallingFile(filename);
      await uninstall(filename);
      setInstallingFile(null);
    },
    [uninstall]
  );

  const handlePreview = useCallback((filename: string) => {
    setPreviewModal(dotfileByFilename.get(filename) || null);
  }, [dotfileByFilename]);

  if (loading) return <LoadingScreen />;
  if (platform && !platform.supported) return <PlatformGuard />;

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      <Sidebar
        platform={platform}
        dotfiles={dotfiles}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <main className="flex-1 flex flex-col min-w-0 h-full">
        <Header
          search={search}
          onSearchChange={setSearch}
          onRefresh={refresh}
          totalCount={dotfiles.length}
          installedCount={installedCount}
        />

        <div className="flex-1 overflow-y-auto bg-grid pb-48">
          <div className="p-6">
            <DotfilesList
              filtered={filtered}
              activeCategory={activeCategory}
              grouped={grouped}
              installingFile={installingFile}
              search={search}
              error={error}
              onInstall={handleInstall}
              onUninstall={handleUninstall}
              onPreview={handlePreview}
            />
          </div>
        </div>
      </main>

      <TerminalConsole lines={terminalLines} onClear={clearTerminal} />

      <VariableModal
        open={!!variableModal}
        dotfileName={variableModal?.filename || ""}
        variables={variableModal?.variables || []}
        onClose={() => setVariableModal(null)}
        onSubmit={handleVariableSubmit}
        loading={installingFile === variableModal?.filename}
      />

      <CodePreview
        open={!!previewModal}
        title={previewModal?.name || ""}
        filename={previewModal?.filename || ""}
        content={previewModal?.content || ""}
        onClose={() => setPreviewModal(null)}
      />
    </div>
  );
}
