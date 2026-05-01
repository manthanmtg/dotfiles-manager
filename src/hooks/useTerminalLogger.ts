"use client";

import { useCallback, useState } from "react";
import type { TerminalLine } from "@/types";

export function useTerminalLogger(maxLines = 100) {
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);

  const addLine = useCallback(
    (type: TerminalLine["type"], text: string) => {
      setTerminalLines((prev) => {
        const newLine = { type, text, timestamp: Date.now() };
        const next = [...prev, newLine];
        if (next.length > maxLines) {
          return next.slice(next.length - maxLines);
        }
        return next;
      });
    },
    [maxLines]
  );

  const clearTerminal = useCallback(() => {
    setTerminalLines([]);
  }, []);

  return {
    terminalLines,
    addLine,
    clearTerminal,
  };
}
