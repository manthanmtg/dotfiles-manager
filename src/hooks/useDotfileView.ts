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

  const searchableDotfiles = useMemo(() => {
    return dotfiles.map((dotfile) => ({
      dotfile,
      searchableName: dotfile.name.toLowerCase(),
      searchableDescription: dotfile.description.toLowerCase(),
      searchableFilename: dotfile.filename.toLowerCase(),
      searchableTags: dotfile.tags.map((tag) => tag.toLowerCase()),
    }));
  }, [dotfiles]);

  const filtered = useMemo(() => {
    let result = searchableDotfiles;

    if (activeCategory !== "all") {
      result = result.filter(
        ({ dotfile }) => dotfile.category === activeCategory
      );
    }

    if (!query) {
      return result.map(({ dotfile }) => dotfile);
    }

    return result.filter(
      ({ searchableName, searchableDescription, searchableFilename, searchableTags }) =>
        searchableName.includes(query) ||
        searchableDescription.includes(query) ||
        searchableFilename.includes(query) ||
        searchableTags.some((tag) => tag.includes(query))
    ).map(({ dotfile }) => dotfile);
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
