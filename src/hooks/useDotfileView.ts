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

export function useDotfileView({
  dotfiles,
  activeCategory,
  search,
}: DotfileViewFilters): DotfileViewResult {
  const query = useMemo(() => search.trim().toLowerCase(), [search]);

  // Pre-calculate searchable text index using a Map to avoid re-mapping dotfiles into new objects
  const searchableIndex = useMemo(() => {
    const map = new Map<string, string>();
    for (const dotfile of dotfiles) {
      map.set(
        dotfile.filename,
        [
          dotfile.name,
          dotfile.description,
          dotfile.filename,
          ...dotfile.tags,
        ]
          .join(" ")
          .toLowerCase()
      );
    }
    return map;
  }, [dotfiles]);

  return useMemo(() => {
    const filtered: DotfileEntry[] = [];
    const grouped: Partial<Record<DotfileCategory, DotfileEntry[]>> = {};

    for (const dotfile of dotfiles) {
      if (activeCategory !== "all" && dotfile.category !== activeCategory) {
        continue;
      }

      const searchableText = searchableIndex.get(dotfile.filename);
      if (query && searchableText && !searchableText.includes(query)) {
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
  }, [activeCategory, dotfiles, query, searchableIndex]);
}
