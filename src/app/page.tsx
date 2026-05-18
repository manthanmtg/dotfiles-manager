"use client";

import { useState } from "react";
import { useDotfiles } from "@/hooks/useDotfiles";
import { useDotfileActions } from "@/hooks/useDotfileActions";
import { useDotfileView } from "@/hooks/useDotfileView";
import { useDotfileStats } from "@/hooks/useDotfileStats";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
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

  useKeyboardShortcut("/", () => {
    document.getElementById("dotfile-search")?.focus();
  });

  if (loading) return <LoadingScreen />;
  if (platform && !platform.supported) return <PlatformGuard />;

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-cyan-500 focus:text-white focus:rounded-lg focus:font-medium focus:shadow-lg focus:shadow-cyan-500/50"
      >
        Skip to content
      </a>

      <Sidebar
        platform={platform}
        totalCount={dotfiles.length}
        installedCount={installedCount}
        categoryCounts={categoryCounts}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <main id="main-content" className="flex-1 flex flex-col min-w-0 h-full">
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
