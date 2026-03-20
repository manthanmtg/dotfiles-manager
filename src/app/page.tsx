"use client";

import { useState, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDotfiles } from "@/hooks/useDotfiles";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { DotfileCard } from "@/components/DotfileCard";
import { CategorySection } from "@/components/CategorySection";
import { TerminalConsole } from "@/components/TerminalConsole";
import { VariableModal } from "@/components/VariableModal";
import { CodePreview } from "@/components/CodePreview";
import { LoadingScreen } from "@/components/LoadingScreen";
import { PlatformGuard } from "@/components/PlatformGuard";
import { CATEGORY_META } from "@/types";
import type { DotfileCategory, DotfileEntry } from "@/types";
import { PackageOpen } from "lucide-react";

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

  const handleInstall = useCallback(
    async (dotfile: DotfileEntry) => {
      if (dotfile.variables.length > 0) {
        setVariableModal(dotfile);
        return;
      }
      setInstallingFile(dotfile.filename);
      await install(dotfile.filename);
      setInstallingFile(null);
    },
    [install]
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

  if (loading) return <LoadingScreen />;
  if (platform && !platform.supported) return <PlatformGuard />;

  const installedCount = dotfiles.filter((d) => d.installed).length;

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
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <PackageOpen size={48} className="text-zinc-700 mb-4" />
                <p className="text-zinc-400 text-sm mb-1">
                  No dotfiles found
                </p>
                <p className="text-zinc-600 text-xs">
                  {search
                    ? "Try adjusting your search query"
                    : "Dotfiles will appear here once loaded"}
                </p>
              </motion.div>
            ) : activeCategory !== "all" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {filtered.map((d) => (
                    <DotfileCard
                      key={d.filename}
                      dotfile={d}
                      onInstall={() => handleInstall(d)}
                      onUninstall={() => handleUninstall(d.filename)}
                      onPreview={() => setPreviewModal(d)}
                      installing={installingFile === d.filename}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              (Object.keys(CATEGORY_META) as DotfileCategory[]).map((cat) => {
                const items = grouped[cat];
                if (!items || items.length === 0) return null;
                return (
                  <CategorySection key={cat} category={cat}>
                    <AnimatePresence mode="popLayout">
                      {items.map((d) => (
                        <DotfileCard
                          key={d.filename}
                          dotfile={d}
                          onInstall={() => handleInstall(d)}
                          onUninstall={() => handleUninstall(d.filename)}
                          onPreview={() => setPreviewModal(d)}
                          installing={installingFile === d.filename}
                        />
                      ))}
                    </AnimatePresence>
                  </CategorySection>
                );
              })
            )}
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
