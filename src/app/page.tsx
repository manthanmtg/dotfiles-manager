"use client";

import { useState, useEffect } from "react";
import { useDotfiles } from "@/hooks/useDotfiles";
import { useDotfileActions } from "@/hooks/useDotfileActions";
import { useDotfileView } from "@/hooks/useDotfileView";
import { useDotfileStats } from "@/hooks/useDotfileStats";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { DotfilesList } from "@/components/DotfilesList";
import { TerminalConsole } from "@/components/TerminalConsole";
import { VariableModal } from "@/components/VariableModal";
import { CodePreview } from "@/components/CodePreview";
import { LoadingScreen } from "@/components/LoadingScreen";
import { PlatformGuard } from "@/components/PlatformGuard";
import type { DotfileCategory, DotfileVariable } from "@/types";

const EMPTY_VARIABLES: DotfileVariable[] = [];

export default function Home() {
  const {
    dotfiles,
    platform,
    loading,
    error,
    install,
    uninstall,
    refresh,
  } = useDotfiles();

  const [activeCategory, setActiveCategory] = useState<
    DotfileCategory | "all"
  >("all");
  const [search, setSearch] = useState("");
  const { filtered, grouped } = useDotfileView({
    dotfiles,
    activeCategory,
    search,
  });

  const {
    installingFile,
    variableModal,
    previewModal,
    handleInstall,
    handleVariableSubmit,
    handleUninstall,
    handlePreview,
    closeVariableModal,
    closePreviewModal,
  } = useDotfileActions({
    dotfiles,
    install,
    uninstall,
  });

  const { installedCount, categoryCounts } = useDotfileStats({ dotfiles });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        e.target instanceof HTMLElement &&
        !["INPUT", "TEXTAREA"].includes(e.target.tagName)
      ) {
        e.preventDefault();
        document.getElementById("dotfile-search")?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (loading) return <LoadingScreen />;
  if (platform && !platform.supported) return <PlatformGuard />;

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      <Sidebar
        platform={platform}
        totalCount={dotfiles.length}
        installedCount={installedCount}
        categoryCounts={categoryCounts}
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

      <TerminalConsole />

        <VariableModal
        open={!!variableModal}
        dotfileName={variableModal?.filename || ""}
        variables={variableModal?.variables || EMPTY_VARIABLES}
        onClose={closeVariableModal}
        onSubmit={handleVariableSubmit}
        loading={installingFile === variableModal?.filename}
      />

      <CodePreview
        open={!!previewModal}
        title={previewModal?.name || ""}
        filename={previewModal?.filename || ""}
        content={previewModal?.content || ""}
        onClose={closePreviewModal}
      />
    </div>
  );
}
