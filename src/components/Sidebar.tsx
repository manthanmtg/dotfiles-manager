"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Terminal, Cpu, Layers } from "lucide-react";
import { CategoryButton } from "./CategoryButton";
import { CATEGORY_META } from "@/types";
import type { DotfileCategory, PlatformData } from "@/types";

interface SidebarProps {
  platform: PlatformData | null;
  totalCount: number;
  installedCount: number;
  categoryCounts: Record<DotfileCategory, number>;
  activeCategory: DotfileCategory | "all";
  onCategoryChange: (cat: DotfileCategory | "all") => void;
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";

export const Sidebar = memo(function Sidebar({
  platform,
  totalCount,
  installedCount,
  categoryCounts,
  activeCategory,
  onCategoryChange,
}: SidebarProps) {
  return (
    <aside className="w-72 shrink-0 border-r border-zinc-800/60 bg-zinc-950/50 backdrop-blur-xl flex flex-col h-full">
      <div className="p-5 border-b border-zinc-800/60">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 relative overflow-hidden">
            <motion.div
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
                repeatDelay: 1,
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
            />
            <Terminal size={20} className="text-white relative z-10" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-zinc-100 tracking-tight">
              Dotfiles Manager
            </h1>
            <p className="text-xs text-zinc-500">Shell configuration hub</p>
          </div>
        </div>

        {platform && (
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex items-center gap-2 text-zinc-400">
              <Cpu size={12} className="text-emerald-400" aria-hidden="true" />
              <span>
                {platform.platform} / {platform.shell.shell}
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <Layers size={12} className="text-cyan-400" aria-hidden="true" />
              <span>
                {totalCount} configs · {installedCount} active
              </span>
            </div>
          </div>
        )}
      </div>

      <nav
        className="flex-1 p-3 space-y-1 overflow-y-auto"
        aria-label="Dotfile categories"
      >
        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onCategoryChange("all")}
          aria-current={activeCategory === "all" ? "page" : undefined}
          aria-label={`All Configs, ${totalCount} items`}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${focusRing} ${
            activeCategory === "all"
              ? "bg-zinc-800/80 text-zinc-100 border-l-2 border-l-cyan-400 shadow-[inset_4px_0_10px_-4px_rgba(34,211,238,0.1)]"
              : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200"
          }`}
        >
              <Layers size={16} aria-hidden="true" />
          <span>All Configs</span>
          <span className="ml-auto text-xs font-mono text-zinc-500">
            {totalCount}
          </span>
        </motion.button>

        <div className="pt-2 pb-1 px-3">
          <span 
            role="heading" 
            aria-level={2}
            className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600"
          >
            Categories
          </span>
        </div>

        {(Object.keys(CATEGORY_META) as DotfileCategory[]).map((cat) => {
          const count = categoryCounts[cat] || 0;
          if (count === 0) return null;

          return (
            <CategoryButton
              key={cat}
              category={cat}
              isActive={activeCategory === cat}
              count={count}
              onClick={() => onCategoryChange(cat)}
            />
          );
        })}
      </nav>


      <div className="p-4 border-t border-zinc-800/60">
        <div className="text-[10px] font-mono text-zinc-600 text-center">
          ~/.dotfiles-manager
        </div>
      </div>
    </aside>
  );
});

Sidebar.displayName = "Sidebar";
