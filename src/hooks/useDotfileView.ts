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

type SearchableDotfile = {
  dotfile: DotfileEntry;
  searchableName: string;
  searchableDescription: string;
  searchableFilename: string;
  searchableTags: string[];
};

export function useDotfileView({
  dotfiles,
  activeCategory,
  search,
}: DotfileViewFilters): DotfileViewResult {
  const query = search.trim().toLowerCase();

  const searchableDotfiles = useMemo<SearchableDotfile[]>(() => {
    return dotfiles.map((dotfile) => ({
      dotfile,
      searchableName: dotfile.name.toLowerCase(),
      searchableDescription: dotfile.description.toLowerCase(),
      searchableFilename: dotfile.filename.toLowerCase(),
      searchableTags: dotfile.tags.map((tag) => tag.toLowerCase()),
    }));
  }, [dotfiles]);

  const filtered = useMemo(() => {
    if (!query) {
      return searchableDotfiles
        .filter((entry) =>
          activeCategory === "all" ? true : entry.dotfile.category === activeCategory
        )
        .map((entry) => entry.dotfile);
    }

    return searchableDotfiles
      .filter((entry) => {
        if (activeCategory !== "all" && entry.dotfile.category !== activeCategory) {
          return false;
        }

        return (
          entry.searchableName.includes(query) ||
          entry.searchableDescription.includes(query) ||
          entry.searchableFilename.includes(query) ||
          entry.searchableTags.some((tag) => tag.includes(query))
        );
      })
      .map((entry) => entry.dotfile);
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
