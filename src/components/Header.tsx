"use client";

import { motion } from "framer-motion";
import { Search, RefreshCw } from "lucide-react";

interface HeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  totalCount: number;
  installedCount: number;
}

export function Header({
  search,
  onSearchChange,
  onRefresh,
  totalCount,
  installedCount,
}: HeaderProps) {
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
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search dotfiles..."
              className="pl-9 pr-4 py-2 w-64 bg-zinc-800/50 border border-zinc-700/40 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/30 transition-all font-mono"
            />
          </div>

          <motion.button
            whileHover={{ rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onRefresh}
            className="p-2 rounded-lg bg-zinc-800/50 border border-zinc-700/40 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </motion.button>
        </div>
      </div>
    </header>
  );
}
