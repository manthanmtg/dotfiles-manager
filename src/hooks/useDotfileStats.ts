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
  const categoryCounts = useMemo(() => {
    const counts: Record<DotfileCategory, number> = {
      aliases: 0,
      scripts: 0,
      prompts: 0,
      security: 0,
      environment: 0,
      functions: 0,
    };

    for (const d of dotfiles) {
      if (d.category in counts) {
        counts[d.category] += 1;
      }
    }

    return counts;
  }, [dotfiles]);

  const installedCount = useMemo(() => {
    return dotfiles.filter((d) => d.installed).length;
  }, [dotfiles]);

  return useMemo(
    () => ({ installedCount, categoryCounts }),
    [installedCount, categoryCounts]
  );
}
