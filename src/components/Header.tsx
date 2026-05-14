"use client";

import { motion } from "framer-motion";
import { Search, RefreshCw } from "lucide-react";
import { memo } from "react";

interface HeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  totalCount: number;
  installedCount: number;
}

export const Header = memo(function Header({
  search,
  onSearchChange,
  onRefresh,
  totalCount,
  installedCount,
}: HeaderProps) {
  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 transition-all";

  return (
    <header className="shrink-0 border-b border-zinc-800/60 bg-zinc-950/30 backdrop-blur-xl px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 tracking-tight">
            Shell Configurations
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {totalCount} available · {installedCount} installed
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group" role="search">
            <label htmlFor="dotfile-search" className="sr-only">
              Search dotfiles
            </label>
            <Search
              size={15}
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              id="dotfile-search"
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search dotfiles..."
              className={`pl-9 pr-12 py-2 w-64 bg-zinc-800/50 border border-zinc-700/40 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none font-mono ${focusRing}`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-zinc-700/50 bg-zinc-900/50 text-[10px] font-mono text-zinc-500 pointer-events-none group-focus-within:opacity-0 transition-opacity">
              /
            </div>
          </div>

          <motion.button
            whileHover={{ rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onRefresh}
            aria-label="Refresh dotfile list"
            className={`p-2 rounded-lg bg-zinc-800/50 border border-zinc-700/40 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 transition-colors ${focusRing}`}
            title="Refresh"
          >
            <RefreshCw size={16} aria-hidden="true" />
          </motion.button>
        </div>
      </div>
    </header>
  );
});

Header.displayName = "Header";
