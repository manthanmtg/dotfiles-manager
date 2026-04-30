"use client";

import { motion } from "framer-motion";
import { DynamicIcon } from "./Icons";
import { CATEGORY_META } from "@/types";
import type { DotfileCategory } from "@/types";

interface CategorySectionProps {
  category: DotfileCategory;
  children: React.ReactNode;
}

const ACCENT_COLORS: Record<string, string> = {
  cyan: "text-cyan-400 border-cyan-500/30",
  emerald: "text-emerald-400 border-emerald-500/30",
  purple: "text-purple-400 border-purple-500/30",
  rose: "text-rose-400 border-rose-500/30",
  amber: "text-amber-400 border-amber-500/30",
  sky: "text-sky-400 border-sky-500/30",
};

const SECTION_ICON_STYLES: Record<string, string> = {
  cyan:
    "bg-cyan-500/10 border-cyan-500/25 text-cyan-300 shadow-cyan-500/20",
  emerald:
    "bg-emerald-500/10 border-emerald-500/25 text-emerald-300 shadow-emerald-500/20",
  purple:
    "bg-purple-500/10 border-purple-500/25 text-purple-300 shadow-purple-500/20",
  rose: "bg-rose-500/10 border-rose-500/25 text-rose-300 shadow-rose-500/20",
  amber:
    "bg-amber-500/10 border-amber-500/25 text-amber-300 shadow-amber-500/20",
  sky: "bg-sky-500/10 border-sky-500/25 text-sky-300 shadow-sky-500/20",
};

const SECTION_DIVIDERS: Record<string, string> = {
  cyan: "from-cyan-400/70 via-cyan-300/30 to-transparent",
  emerald: "from-emerald-400/70 via-emerald-300/30 to-transparent",
  purple: "from-purple-400/70 via-purple-300/30 to-transparent",
  rose: "from-rose-400/70 via-rose-300/30 to-transparent",
  amber: "from-amber-400/70 via-amber-300/30 to-transparent",
  sky: "from-sky-400/70 via-sky-300/30 to-transparent",
};

export function CategorySection({ category, children }: CategorySectionProps) {
  const meta = CATEGORY_META[category];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-8"
    >
      <div
        className={`relative flex items-center gap-3 mb-4 pb-2 border-b ${ACCENT_COLORS[meta.color]}`}
      >
        <motion.div
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          className={`flex items-center justify-center w-8 h-8 rounded-lg border shadow-lg ${SECTION_ICON_STYLES[meta.color]}`}
        >
          <DynamicIcon
            name={meta.icon}
            size={18}
            className={ACCENT_COLORS[meta.color].split(" ")[0]}
            aria-hidden="true"
          />
        </motion.div>
        <motion.div
          initial={{ scaleX: 0.3, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.45 }}
          className={`absolute left-0 right-0 bottom-0 h-px bg-gradient-to-r ${SECTION_DIVIDERS[meta.color]} origin-left`}
        />
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">
            {meta.label}
          </h3>
          <p className="text-[11px] text-zinc-500">{meta.description}</p>
        </div>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {children}
      </ul>
    </motion.section>
  );
}
