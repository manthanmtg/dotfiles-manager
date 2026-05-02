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

  // Pre-calculate searchable text once when dotfiles change to optimize filtering during search
  const enrichedDotfiles = useMemo(() => {
    return dotfiles.map((dotfile) => ({
      ...dotfile,
      _searchable: [
        dotfile.name,
        dotfile.description,
        dotfile.filename,
        ...dotfile.tags,
      ]
        .join(" ")
        .toLowerCase(),
    }));
  }, [dotfiles]);

  return useMemo(() => {
    const filtered: DotfileEntry[] = [];
    const grouped: Partial<Record<DotfileCategory, DotfileEntry[]>> = {};

    for (const dotfile of enrichedDotfiles) {
      if (activeCategory !== "all" && dotfile.category !== activeCategory) {
        continue;
      }

      if (query && !dotfile._searchable.includes(query)) {
        continue;
      }

      // Remove the internal _searchable property before adding to results
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _searchable, ...entry } = dotfile;
      filtered.push(entry as DotfileEntry);

      if (activeCategory === "all") {
        if (!grouped[dotfile.category]) {
          grouped[dotfile.category] = [];
        }
        grouped[dotfile.category]!.push(entry as DotfileEntry);
      }
    }

    return { filtered, grouped };
  }, [activeCategory, enrichedDotfiles, query]);
}
