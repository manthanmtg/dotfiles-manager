"use client";

import { motion } from "framer-motion";
import { PackageOpen } from "lucide-react";
import { memo } from "react";

interface EmptyStateProps {
  search: string;
}

function EmptyStateInner({ search }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, y: 0 }}
      role="status"
      aria-live="polite"
      aria-atomic="true"
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
          aria-hidden="true"
        />
      </motion.div>
      <p className="relative text-zinc-100 font-medium text-sm mb-1">No dotfiles found</p>
      <p className="relative text-zinc-500 text-xs max-w-sm mx-auto">
        {search
          ? "Try adjusting your search query or switching categories."
          : "Dotfiles will appear here once loaded."}
      </p>
    </motion.div>
  );
}

export const EmptyState = memo(EmptyStateInner);
