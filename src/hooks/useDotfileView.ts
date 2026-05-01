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

  const { filtered, grouped } = useMemo(() => {
    const filtered: DotfileEntry[] = [];
    const grouped: Partial<Record<DotfileCategory, DotfileEntry[]>> = {};

    for (const dotfile of dotfiles) {
      if (activeCategory !== "all" && dotfile.category !== activeCategory) {
        continue;
      }

      if (query) {
        const searchableText = [
          dotfile.name,
          dotfile.description,
          dotfile.filename,
          ...dotfile.tags,
        ]
          .join(" ")
          .toLowerCase();
        if (!searchableText.includes(query)) {
          continue;
        }
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

  return { filtered, grouped };
}
