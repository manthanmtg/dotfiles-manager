"use client";

import { memo } from "react";
import { DotfilesGrid } from "@/components/DotfilesGrid";
import { CategorySection } from "@/components/CategorySection";
import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { CATEGORY_META } from "@/types";
import type { DotfileCategory, DotfileEntry } from "@/types";

interface DotfilesListProps {
  filtered: DotfileEntry[];
  activeCategory: DotfileCategory | "all";
  grouped: Partial<Record<DotfileCategory, DotfileEntry[]>>;
  installingFile: string | null;
  error: string | null;
  search: string;
  onInstall: (filename: string) => void;
  onUninstall: (filename: string) => void;
  onPreview: (filename: string) => void;
}

const CATEGORY_OPTIONS = Object.keys(CATEGORY_META) as DotfileCategory[];

function DotfilesListInner({
  filtered,
  activeCategory,
  grouped,
  installingFile,
  error,
  search,
  onInstall,
  onUninstall,
  onPreview,
}: DotfilesListProps) {
  return (
    <section aria-label="Dotfiles list" className="p-6">
      {error && <ErrorMessage error={error} />}

      {filtered.length === 0 ? (
        <EmptyState search={search} />
      ) : activeCategory !== "all" ? (
        <DotfilesGrid
          dotfiles={filtered}
          installingFile={installingFile}
          onInstall={onInstall}
          onUninstall={onUninstall}
          onPreview={onPreview}
        />
      ) : (
        CATEGORY_OPTIONS.map((cat) => {
          const items = grouped[cat];
          if (!items || items.length === 0) return null;
          return (
            <CategorySection key={cat} category={cat}>
              <DotfilesGrid
                dotfiles={items}
                installingFile={installingFile}
                onInstall={onInstall}
                onUninstall={onUninstall}
                onPreview={onPreview}
              />
            </CategorySection>
          );
        })
      )}
    </section>
  );
}

export const DotfilesList = memo(DotfilesListInner);
