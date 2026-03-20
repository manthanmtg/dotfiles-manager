"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Trash2,
  Eye,
  CheckCircle2,
  Loader2,
  Tag,
} from "lucide-react";
import { DynamicIcon } from "./Icons";
import { CATEGORY_META } from "@/types";
import type { DotfileEntry } from "@/types";

interface DotfileCardProps {
  dotfile: DotfileEntry;
  onInstall: () => void;
  onUninstall: () => void;
  onPreview: () => void;
  installing: boolean;
}

const GLOW_COLORS: Record<string, string> = {
  cyan: "shadow-cyan-500/10 hover:shadow-cyan-500/20",
  emerald: "shadow-emerald-500/10 hover:shadow-emerald-500/20",
  purple: "shadow-purple-500/10 hover:shadow-purple-500/20",
  rose: "shadow-rose-500/10 hover:shadow-rose-500/20",
  amber: "shadow-amber-500/10 hover:shadow-amber-500/20",
  sky: "shadow-sky-500/10 hover:shadow-sky-500/20",
};

const ICON_BG_COLORS: Record<string, string> = {
  cyan: "bg-cyan-500/10 text-cyan-400",
  emerald: "bg-emerald-500/10 text-emerald-400",
  purple: "bg-purple-500/10 text-purple-400",
  rose: "bg-rose-500/10 text-rose-400",
  amber: "bg-amber-500/10 text-amber-400",
  sky: "bg-sky-500/10 text-sky-400",
};

const INSTALLED_GRADIENT: Record<string, string> = {
  cyan: "from-cyan-500/5 to-transparent",
  emerald: "from-emerald-500/5 to-transparent",
  purple: "from-purple-500/5 to-transparent",
  rose: "from-rose-500/5 to-transparent",
  amber: "from-amber-500/5 to-transparent",
  sky: "from-sky-500/5 to-transparent",
};

export function DotfileCard({
  dotfile,
  onInstall,
  onUninstall,
  onPreview,
  installing,
}: DotfileCardProps) {
  const [hovered, setHovered] = useState(false);
  const catMeta = CATEGORY_META[dotfile.category];
  const color = catMeta.color;

  const lineCount = dotfile.content.split("\n").filter((l) => l.trim()).length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={`group relative rounded-xl border border-zinc-800/60 bg-zinc-900/50 backdrop-blur-sm overflow-hidden transition-shadow duration-300 shadow-lg ${GLOW_COLORS[color]} ${
        dotfile.installed ? `bg-gradient-to-br ${INSTALLED_GRADIENT[color]}` : ""
      }`}
    >
      {dotfile.installed && (
        <div className="absolute top-3 right-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30"
          >
            <CheckCircle2 size={12} className="text-emerald-400" />
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
              Active
            </span>
          </motion.div>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${ICON_BG_COLORS[color]}`}
          >
            <DynamicIcon name={dotfile.icon || catMeta.icon} size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-zinc-100 truncate pr-16">
              {dotfile.name}
            </h3>
            <p className="text-xs text-zinc-500 font-mono truncate">
              {dotfile.filename}
            </p>
          </div>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed mb-3 line-clamp-2">
          {dotfile.description}
        </p>

        <div className="flex items-center gap-2 flex-wrap mb-4">
          {dotfile.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800/80 text-[10px] font-mono text-zinc-500"
            >
              <Tag size={8} />
              {tag}
            </span>
          ))}
          <span className="text-[10px] font-mono text-zinc-600">
            {lineCount} lines
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPreview}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/80 text-zinc-400 text-xs font-medium hover:bg-zinc-700/80 hover:text-zinc-200 transition-all"
          >
            <Eye size={13} />
            Preview
          </button>

          {dotfile.installed ? (
            <button
              onClick={onUninstall}
              disabled={installing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium hover:bg-rose-500/20 transition-all disabled:opacity-50"
            >
              {installing ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Trash2 size={13} />
              )}
              Uninstall
            </button>
          ) : (
            <motion.button
              onClick={onInstall}
              disabled={installing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/90 to-emerald-500/90 text-white text-xs font-medium hover:from-cyan-400 hover:to-emerald-400 transition-all shadow-lg shadow-cyan-500/10 disabled:opacity-50"
            >
              {installing ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Download size={13} />
              )}
              Install
            </motion.button>
          )}
        </div>
      </div>

      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        className="absolute inset-0 pointer-events-none rounded-xl border border-zinc-700/30"
      />
    </motion.div>
  );
}
