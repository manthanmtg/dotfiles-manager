"use client";

import { motion } from "framer-motion";
import { memo } from "react";
import { DynamicIcon } from "./Icons";
import { CATEGORY_META, type ThemeColor } from "@/types";
import type { DotfileCategory } from "@/types";

interface CategoryButtonProps {
  category: DotfileCategory;
  isActive: boolean;
  count: number;
  onClick: () => void;
}

const CATEGORY_BORDER_COLORS: Record<ThemeColor, string> = {
  cyan: "border-cyan-500/50",
  emerald: "border-emerald-500/50",
  purple: "border-purple-500/50",
  rose: "border-rose-500/50",
  amber: "border-amber-500/50",
  sky: "border-sky-500/50",
};

const CATEGORY_BG_COLORS: Record<ThemeColor, string> = {
  cyan: "bg-cyan-500/10",
  emerald: "bg-emerald-500/10",
  purple: "bg-purple-500/10",
  rose: "bg-rose-500/10",
  amber: "bg-amber-500/10",
  sky: "bg-sky-500/10",
};

const CATEGORY_TEXT_COLORS: Record<ThemeColor, string> = {
  cyan: "text-cyan-400",
  emerald: "text-emerald-400",
  purple: "text-purple-400",
  rose: "text-rose-400",
  amber: "text-amber-400",
  sky: "text-sky-400",
};

const CATEGORY_LEFT_BORDERS: Record<ThemeColor, string> = {
  cyan: "border-l-cyan-400",
  emerald: "border-l-emerald-400",
  purple: "border-l-purple-400",
  rose: "border-l-rose-400",
  amber: "border-l-amber-400",
  sky: "border-l-sky-400",
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";

function CategoryButtonInner({
  category,
  isActive,
  count,
  onClick,
}: CategoryButtonProps) {
  const meta = CATEGORY_META[category];

  return (
    <motion.button
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all border ${
        isActive
          ? `${CATEGORY_BG_COLORS[meta.color]} ${CATEGORY_BORDER_COLORS[meta.color]} ${CATEGORY_TEXT_COLORS[meta.color]} border-l-2 ${CATEGORY_LEFT_BORDERS[meta.color]} ${focusRing}`
          : `border-transparent text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200 ${focusRing}`
      }`}
    >
      <DynamicIcon
        name={meta.icon}
        size={16}
        className={isActive ? CATEGORY_TEXT_COLORS[meta.color] : ""}
        aria-hidden="true"
      />
      <span>{meta.label}</span>
      <span className="ml-auto text-xs font-mono text-zinc-500">{count}</span>
    </motion.button>
  );
}

export const CategoryButton = memo(CategoryButtonInner);

