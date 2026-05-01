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
  const { installedCount, categoryCounts } = useMemo(() => {
    const counts: Record<DotfileCategory, number> = {
      aliases: 0,
      scripts: 0,
      prompts: 0,
      security: 0,
      environment: 0,
      functions: 0,
    };
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
