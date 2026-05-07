import { useMemo } from "react";
import type { DotfileCategory, DotfileEntry } from "@/types";

type DotfileViewFilters = {
  dotfiles: DotfileEntry[];
  activeCategory: DotfileCategory | "all";
  search: string;
};

type DotfileViewResult = {
  filtered: DotfileEntry[];
  grouped: Partial<Record<DotfileCategory, DotfileEntry[]>>;
};

// Global cache for searchable text to avoid re-computing it when dotfile objects are updated
// but their search-relevant metadata (name, description, tags) remains the same.
const SEARCHABLE_CACHE = new WeakMap<DotfileEntry, string>();

function getSearchableText(dotfile: DotfileEntry): string {
  let text = SEARCHABLE_CACHE.get(dotfile);
  if (!text) {
    text = [
      dotfile.name,
      dotfile.description,
      dotfile.filename,
      ...dotfile.tags,
    ]
      .join(" ")
      .toLowerCase();
    SEARCHABLE_CACHE.set(dotfile, text);
  }
  return text;
}

export function useDotfileView({
  dotfiles,
  activeCategory,
  search,
}: DotfileViewFilters): DotfileViewResult {
  const query = useMemo(() => search.trim().toLowerCase(), [search]);

  return useMemo(() => {
    const filtered: DotfileEntry[] = [];
    const grouped: Partial<Record<DotfileCategory, DotfileEntry[]>> = {};

    for (const dotfile of dotfiles) {
      if (activeCategory !== "all" && dotfile.category !== activeCategory) {
        continue;
      }

      const searchableText = getSearchableText(dotfile);
      if (query && !searchableText.includes(query)) {
        continue;
      }

      filtered.push(dotfile);

      if (activeCategory === "all") {
        if (!grouped[dotfile.category]) {
          grouped[dotfile.category] = [];
        }
        grouped[dotfile.category]!.push(dotfile);
      }
    }

    return { filtered, grouped };
  }, [activeCategory, dotfiles, query]);
}
