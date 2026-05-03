"use client";

import React, { createContext, useContext, useCallback, useState, useMemo } from "react";
import type { TerminalLine } from "@/types";

interface TerminalState {
  lines: TerminalLine[];
}

interface TerminalActions {
  addLine: (type: TerminalLine["type"], text: string) => void;
  clearTerminal: () => void;
}

const TerminalStateContext = createContext<TerminalState | null>(null);
const TerminalActionsContext = createContext<TerminalActions | null>(null);

export function TerminalProvider({
  children,
  maxLines = 100,
}: {
  children: React.ReactNode;
  maxLines?: number;
}) {
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

  const stateValue = useMemo(() => ({ lines: terminalLines }), [terminalLines]);
  const actionsValue = useMemo(() => ({ addLine, clearTerminal }), [addLine, clearTerminal]);

  return (
    <TerminalStateContext.Provider value={stateValue}>
      <TerminalActionsContext.Provider value={actionsValue}>
        {children}
      </TerminalActionsContext.Provider>
    </TerminalStateContext.Provider>
  );
}

export function useTerminal() {
  const state = useContext(TerminalStateContext);
  const actions = useContext(TerminalActionsContext);

  if (!state || !actions) {
    throw new Error("useTerminal must be used within a TerminalProvider");
  }

  return { ...state, ...actions };
}

export function useTerminalActions() {
  const actions = useContext(TerminalActionsContext);
  if (!actions) {
    throw new Error("useTerminalActions must be used within a TerminalProvider");
  }
  return actions;
}
