"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PackageOpen } from "lucide-react";
import { DotfileCard } from "@/components/DotfileCard";
import { CategorySection } from "@/components/CategorySection";
import { CATEGORY_META } from "@/types";
import type { DotfileCategory, DotfileEntry } from "@/types";

interface DotfilesListProps {
  filtered: DotfileEntry[];
  activeCategory: DotfileCategory | "all";
  grouped: Partial<Record<DotfileCategory, DotfileEntry[]>>;
  installingFile: string | null;
  error: string | null;
  search: string;
  onInstall: (filename: string) => void;
  onUninstall: (filename: string) => void;
  onPreview: (filename: string) => void;
}

export function DotfilesList({
  filtered,
  activeCategory,
  grouped,
  installingFile,
  error,
  search,
  onInstall,
  onUninstall,
  onPreview,
}: DotfilesListProps) {
  return (
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
          <p className="text-zinc-400 text-sm mb-1">No dotfiles found</p>
          <p className="text-zinc-600 text-xs">
            {search ? "Try adjusting your search query" : "Dotfiles will appear here once loaded"}
          </p>
        </motion.div>
      ) : activeCategory !== "all" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((d) => (
              <DotfileCard
                key={d.filename}
                filename={d.filename}
                dotfile={d}
                onInstall={onInstall}
                onUninstall={onUninstall}
                onPreview={onPreview}
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
                    filename={d.filename}
                    dotfile={d}
                    onInstall={onInstall}
                    onUninstall={onUninstall}
                    onPreview={onPreview}
                    installing={installingFile === d.filename}
                  />
                ))}
              </AnimatePresence>
            </CategorySection>
          );
        })
      )}
    </div>
  );
}
