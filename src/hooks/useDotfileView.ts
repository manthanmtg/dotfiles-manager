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
  const searchableDotfiles = useMemo(
    () =>
      dotfiles.map((dotfile) => ({
        dotfile,
        searchableText: [
          dotfile.name,
          dotfile.description,
          dotfile.filename,
          ...dotfile.tags,
        ]
          .join(" ")
          .toLowerCase(),
      })),
    [dotfiles]
  );

  const query = useMemo(() => search.trim().toLowerCase(), [search]);

  const filtered = useMemo(() => {
    const categoryFiltered =
      activeCategory === "all"
        ? searchableDotfiles
        : searchableDotfiles.filter(
            (item) => item.dotfile.category === activeCategory
          );

    if (!query) {
      return categoryFiltered.map((item) => item.dotfile);
    }

    return categoryFiltered
      .filter((item) => item.searchableText.includes(query))
      .map((item) => item.dotfile);
  }, [activeCategory, query, searchableDotfiles]);

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
