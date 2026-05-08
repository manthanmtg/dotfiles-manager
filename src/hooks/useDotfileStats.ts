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
  return useMemo(() => {
    const counts: Record<DotfileCategory, number> = {
      aliases: 0,
      scripts: 0,
      prompts: 0,
      security: 0,
      environment: 0,
      functions: 0,
    };
    let installed = 0;

    for (const d of dotfiles) {
      if (d.category in counts) {
        counts[d.category] += 1;
      }
      if (d.installed) {
        installed += 1;
      }
    }

    return {
      categoryCounts: counts,
      installedCount: installed,
    };
  }, [dotfiles]);
}
