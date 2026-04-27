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
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-900/50 px-8 py-16 text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-zinc-900/20 to-emerald-500/10" />
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ repeat: Infinity, repeatType: "reverse", duration: 2.2 }}
            className="relative inline-flex items-center justify-center p-3 rounded-full bg-zinc-900/80 border border-cyan-500/20 mb-4"
          >
            <PackageOpen
              size={40}
              className="text-cyan-400"
            />
          </motion.div>
          <p className="relative text-zinc-100 font-medium text-sm mb-1">No dotfiles found</p>
          <p className="relative text-zinc-500 text-xs max-w-sm">
            {search
              ? "Try adjusting your search query or switching categories."
              : "Dotfiles will appear here once loaded."}
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
