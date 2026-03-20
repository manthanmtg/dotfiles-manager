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

export function CategorySection({ category, children }: CategorySectionProps) {
  const meta = CATEGORY_META[category];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-8"
    >
      <div
        className={`flex items-center gap-3 mb-4 pb-2 border-b ${ACCENT_COLORS[meta.color]}`}
      >
        <DynamicIcon
          name={meta.icon}
          size={18}
          className={ACCENT_COLORS[meta.color].split(" ")[0]}
        />
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">
            {meta.label}
          </h3>
          <p className="text-[11px] text-zinc-500">{meta.description}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {children}
      </div>
    </motion.section>
  );
}
