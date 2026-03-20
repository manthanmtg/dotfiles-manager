"use client";

import { motion } from "framer-motion";
import { Terminal, Cpu, Layers } from "lucide-react";
import { DynamicIcon } from "./Icons";
import { CATEGORY_META } from "@/types";
import type { DotfileCategory, DotfileEntry, PlatformData } from "@/types";

interface SidebarProps {
  platform: PlatformData | null;
  dotfiles: DotfileEntry[];
  activeCategory: DotfileCategory | "all";
  onCategoryChange: (cat: DotfileCategory | "all") => void;
}

const CATEGORY_BORDER_COLORS: Record<string, string> = {
  cyan: "border-cyan-500/50",
  emerald: "border-emerald-500/50",
  purple: "border-purple-500/50",
  rose: "border-rose-500/50",
  amber: "border-amber-500/50",
  sky: "border-sky-500/50",
};

const CATEGORY_BG_COLORS: Record<string, string> = {
  cyan: "bg-cyan-500/10",
  emerald: "bg-emerald-500/10",
  purple: "bg-purple-500/10",
  rose: "bg-rose-500/10",
  amber: "bg-amber-500/10",
  sky: "bg-sky-500/10",
};

const CATEGORY_TEXT_COLORS: Record<string, string> = {
  cyan: "text-cyan-400",
  emerald: "text-emerald-400",
  purple: "text-purple-400",
  rose: "text-rose-400",
  amber: "text-amber-400",
  sky: "text-sky-400",
};

export function Sidebar({
  platform,
  dotfiles,
  activeCategory,
  onCategoryChange,
}: SidebarProps) {
  const installedCount = dotfiles.filter((d) => d.installed).length;

  return (
    <aside className="w-72 shrink-0 border-r border-zinc-800/60 bg-zinc-950/50 backdrop-blur-xl flex flex-col h-full">
      <div className="p-5 border-b border-zinc-800/60">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Terminal size={20} className="text-white" />
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
              <Cpu size={12} className="text-emerald-400" />
              <span>
                {platform.platform} / {platform.shell.shell}
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <Layers size={12} className="text-cyan-400" />
              <span>
                {dotfiles.length} configs · {installedCount} active
              </span>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <button
          onClick={() => onCategoryChange("all")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
            activeCategory === "all"
              ? "bg-zinc-800/80 text-zinc-100"
              : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200"
          }`}
        >
          <Layers size={16} />
          <span>All Configs</span>
          <span className="ml-auto text-xs font-mono text-zinc-500">
            {dotfiles.length}
          </span>
        </button>

        <div className="pt-2 pb-1 px-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
            Categories
          </span>
        </div>

        {(Object.keys(CATEGORY_META) as DotfileCategory[]).map((cat) => {
          const meta = CATEGORY_META[cat];
          const count = dotfiles.filter((d) => d.category === cat).length;
          if (count === 0) return null;

          return (
            <motion.button
              key={cat}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onCategoryChange(cat)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all border ${
                activeCategory === cat
                  ? `${CATEGORY_BG_COLORS[meta.color]} ${CATEGORY_BORDER_COLORS[meta.color]} ${CATEGORY_TEXT_COLORS[meta.color]}`
                  : "border-transparent text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200"
              }`}
            >
              <DynamicIcon
                name={meta.icon}
                size={16}
                className={
                  activeCategory === cat
                    ? CATEGORY_TEXT_COLORS[meta.color]
                    : ""
                }
              />
              <span>{meta.label}</span>
              <span className="ml-auto text-xs font-mono text-zinc-500">
                {count}
              </span>
            </motion.button>
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
}
