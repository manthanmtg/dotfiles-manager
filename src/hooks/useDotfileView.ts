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
  const query = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    let result = dotfiles;

    if (activeCategory !== "all") {
      result = result.filter((dotfile) => dotfile.category === activeCategory);
    }

    if (!query) {
      return result;
    }

    return result.filter(
      (dotfile) =>
        dotfile.name.toLowerCase().includes(query) ||
        dotfile.description.toLowerCase().includes(query) ||
        dotfile.filename.toLowerCase().includes(query) ||
        dotfile.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [dotfiles, activeCategory, query]);

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
