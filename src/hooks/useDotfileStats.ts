import { useMemo } from "react";
import type { DotfileCategory, DotfileEntry } from "@/types";
import { CATEGORY_META } from "@/types";

type DotfileStatsParams = {
  dotfiles: DotfileEntry[];
};

type DotfileStats = {
  installedCount: number;
  categoryCounts: Record<DotfileCategory, number>;
};

export function useDotfileStats({ dotfiles }: DotfileStatsParams): DotfileStats {
  const { installedCount, categoryCounts } = useMemo(() => {
    const counts: Record<DotfileCategory, number> = Object.fromEntries(
      (Object.keys(CATEGORY_META) as DotfileCategory[]).map((cat) => [cat, 0])
    ) as Record<DotfileCategory, number>;
    let installedCount = 0;

    for (const dotfile of dotfiles) {
      if (dotfile.installed) {
        installedCount += 1;
      }
      counts[dotfile.category] += 1;
    }

    return { installedCount, categoryCounts: counts };
  }, [dotfiles]);

  return { installedCount, categoryCounts };
}
