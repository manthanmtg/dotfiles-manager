import { useMemo } from "react";
import type { DotfileCategory, DotfileEntry } from "@/types";

type DotfileStatsParams = {
  dotfiles: DotfileEntry[];
};

type DotfileStats = {
  installedCount: number;
  categoryCounts: Record<DotfileCategory, number>;
};

export function useDotfileStats({ dotfiles }: DotfileStatsParams): DotfileStats {
  const categoryKey = dotfiles
    .map((d) => `${d.filename}:${d.category}`)
    .sort()
    .join(",");

  const categoryCounts = useMemo(() => {
    const counts: Record<DotfileCategory, number> = {
      aliases: 0,
      scripts: 0,
      prompts: 0,
      security: 0,
      environment: 0,
      functions: 0,
    };

    if (!categoryKey) return counts;

    for (const part of categoryKey.split(",")) {
      const [, category] = part.split(":");
      if (category && category in counts) {
        counts[category as DotfileCategory] += 1;
      }
    }

    return counts;
  }, [categoryKey]);

  const installedCount = useMemo(() => {
    return dotfiles.filter((d) => d.installed).length;
  }, [dotfiles]);

  return useMemo(
    () => ({ installedCount, categoryCounts }),
    [installedCount, categoryCounts]
  );
}
