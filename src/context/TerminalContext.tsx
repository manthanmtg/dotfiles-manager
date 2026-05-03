"use client";

import React, { createContext, useContext, useCallback, useState } from "react";
import type { TerminalLine } from "@/types";

interface TerminalContextType {
  lines: TerminalLine[];
  addLine: (type: TerminalLine["type"], text: string) => void;
  clearTerminal: () => void;
}

const TerminalContext = createContext<TerminalContextType | null>(null);

export function TerminalProvider({ children, maxLines = 100 }: { children: React.ReactNode; maxLines?: number }) {
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

  return (
    <TerminalContext.Provider value={{ lines: terminalLines, addLine, clearTerminal }}>
      {children}
    </TerminalContext.Provider>
  );
}

export function useTerminal() {
  const context = useContext(TerminalContext);
  if (!context) {
    throw new Error("useTerminal must be used within a TerminalProvider");
  }
  return context;
}
