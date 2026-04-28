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

  const filtered = useMemo(() => {
    const categoryFiltered =
      activeCategory === "all"
        ? dotfiles
        : dotfiles.filter((dotfile) => dotfile.category === activeCategory);

    if (!query) {
      return categoryFiltered;
    }

    return categoryFiltered.filter((dotfile) => {
      if (dotfile.name.toLowerCase().includes(query)) return true;
      if (dotfile.description.toLowerCase().includes(query)) return true;
      if (dotfile.filename.toLowerCase().includes(query)) return true;

      return dotfile.tags.some((tag) => tag.toLowerCase().includes(query));
    });
  }, [activeCategory, dotfiles, query]);

  const grouped = useMemo(() => {
    if (activeCategory !== "all") {
      return {};
    }

    const groups: Partial<Record<DotfileCategory, DotfileEntry[]>> = {};

    for (const dotfile of filtered) {
      if (!groups[dotfile.category]) {
        groups[dotfile.category] = [];
      }
      groups[dotfile.category]!.push(dotfile);
    }

    return groups;
  }, [filtered, activeCategory]);

  return { filtered, grouped };
}
