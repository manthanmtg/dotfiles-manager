"use client";

import { useCallback, useState } from "react";
import type { TerminalLine } from "@/types";

export function useTerminalLogger() {
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);

  const addLine = useCallback(
    (type: TerminalLine["type"], text: string) => {
      setTerminalLines((prev) => [
        ...prev,
        { type, text, timestamp: Date.now() },
      ]);
    },
    []
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
