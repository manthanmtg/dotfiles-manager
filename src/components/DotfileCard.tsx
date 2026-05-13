"use client";

import { memo, useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Trash2,
  Eye,
  Loader2,
  Tag,
} from "lucide-react";
import { DynamicIcon } from "./Icons";
import { ActiveBadge } from "./ActiveBadge";
import { CATEGORY_META } from "@/types";
import type { DotfileEntry } from "@/types";

interface DotfileCardProps {
  filename: string;
  dotfile: DotfileEntry;
  onInstall: (filename: string) => void;
  onUninstall: (filename: string) => void;
  onPreview: (filename: string) => void;
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

const HOVER_STATES: Record<string, string> = {
  cyan: "border-cyan-400/45 shadow-cyan-500/25",
  emerald: "border-emerald-400/45 shadow-emerald-500/25",
  purple: "border-purple-400/45 shadow-purple-500/25",
  rose: "border-rose-400/45 shadow-rose-500/25",
  amber: "border-amber-400/45 shadow-amber-500/25",
  sky: "border-sky-400/45 shadow-sky-500/25",
};

const TAG_HOVER_COLORS: Record<string, string> = {
  cyan: "group-hover:text-cyan-400/70 group-hover:bg-cyan-500/5",
  emerald: "group-hover:text-emerald-400/70 group-hover:bg-emerald-500/5",
  purple: "group-hover:text-purple-400/70 group-hover:bg-purple-500/5",
  rose: "group-hover:text-rose-400/70 group-hover:bg-rose-500/5",
  amber: "group-hover:text-amber-400/70 group-hover:bg-amber-500/5",
  sky: "group-hover:text-sky-400/70 group-hover:bg-sky-500/5",
};

function DotfileCardInner({
  filename,
  dotfile,
  onInstall,
  onUninstall,
  onPreview,
  installing,
}: DotfileCardProps) {
  const [hovered, setHovered] = useState(false);
  const catMeta = CATEGORY_META[dotfile.category];
  const color = catMeta.color;

  const lineCount = dotfile.lineCount;
  const installed = dotfile.installed;
  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={`group relative rounded-xl border border-zinc-800/60 bg-zinc-900/50 backdrop-blur-sm overflow-hidden transition-all duration-300 shadow-lg ${GLOW_COLORS[color]} ${
        dotfile.installed ? `bg-gradient-to-br ${INSTALLED_GRADIENT[color]}` : ""
      } ${hovered ? HOVER_STATES[color] : ""}`}
    >
      <article className="h-full flex flex-col">
        {installed && <ActiveBadge />}

        <div className="p-5 flex-1">
          <div className="flex items-start gap-3 mb-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${ICON_BG_COLORS[color]}`}
            >
              <DynamicIcon
                name={dotfile.icon || catMeta.icon}
                size={20}
                aria-hidden="true"
              />
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
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800/80 text-[10px] font-mono text-zinc-500 transition-colors duration-300 ${TAG_HOVER_COLORS[color]}`}
              >
                <Tag size={8} aria-hidden="true" />
                {tag}
              </span>
            ))}
            <span className="text-[10px] font-mono text-zinc-600">
              {lineCount} lines
            </span>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => onPreview(filename)}
              aria-label={`Preview content of ${dotfile.name}`}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/80 text-zinc-400 text-xs font-medium hover:bg-zinc-700/80 hover:text-zinc-200 transition-all ${focusRing}`}
            >
              <Eye size={13} aria-hidden="true" />
              Preview
            </motion.button>

            {installed ? (
              <motion.button
                onClick={() => onUninstall(filename)}
                aria-label={`Uninstall ${dotfile.name}`}
                disabled={installing}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium hover:bg-rose-500/20 transition-all disabled:opacity-50 ${focusRing}`}
              >
                {installing ? (
                  <Loader2 size={13} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Trash2 size={13} aria-hidden="true" />
                )}
                <span aria-live="polite">
                  {installing ? "Uninstalling..." : "Uninstall"}
                </span>
              </motion.button>
            ) : (
              <motion.button
                onClick={() => onInstall(filename)}
                aria-label={`Install ${dotfile.name}`}
                disabled={installing}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/90 to-emerald-500/90 text-white text-xs font-medium hover:from-cyan-400 hover:to-emerald-400 transition-all shadow-lg shadow-cyan-500/10 disabled:opacity-50 ${focusRing}`}
              >
                {installing ? (
                  <Loader2 size={13} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Download size={13} aria-hidden="true" />
                )}
                <span aria-live="polite">
                  {installing ? "Installing..." : "Install"}
                </span>
              </motion.button>
            )}
          </div>
        </div>
      </article>

      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        className="absolute inset-0 pointer-events-none rounded-xl border border-zinc-700/30"
      />
    </motion.div>
  );
}

const DotfileCard = memo(DotfileCardInner);
DotfileCard.displayName = "DotfileCard";
export { DotfileCard };
