"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { TerminalLine } from "@/types";

interface TerminalConsoleProps {
  lines: TerminalLine[];
  onClear: () => void;
}

const LINE_COLORS: Record<TerminalLine["type"], string> = {
  info: "text-zinc-400",
  success: "text-emerald-400",
  error: "text-rose-400",
  warning: "text-amber-400",
  command: "text-cyan-400",
};

const LINE_PREFIX: Record<TerminalLine["type"], string> = {
  info: "[INFO]",
  success: "[OK]",
  error: "[ERR]",
  warning: "[WARN]",
  command: "❯",
};

export function TerminalConsole({ lines, onClear }: TerminalConsoleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const previousLineCount = useRef(lines.length);
  const clearAnnouncementRef = useRef<HTMLParagraphElement>(null);
  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";

  useEffect(() => {
    if (scrollRef.current && !collapsed) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, collapsed]);

  useEffect(() => {
    if (previousLineCount.current > 0 && lines.length === 0) {
      if (clearAnnouncementRef.current) {
        clearAnnouncementRef.current.textContent = "Terminal log cleared.";
      }
    } else if (clearAnnouncementRef.current) {
      clearAnnouncementRef.current.textContent = "";
    }
    previousLineCount.current = lines.length;
  }, [lines.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/50">
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand terminal log" : "Collapse terminal log"}
          aria-expanded={collapsed ? "false" : "true"}
          aria-controls="dotfiles-terminal-log"
          className={`flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors ${focusRing}`}
        >
          <Terminal size={14} className="text-emerald-400" />
          <span className="font-mono text-xs">dotfiles-manager</span>
          <span className="text-zinc-600 font-mono text-xs">
            — {lines.length} entries
          </span>
          {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <button
          onClick={onClear}
          aria-label="Clear terminal log"
          className={`text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded hover:bg-zinc-800 ${focusRing}`}
          title="Clear terminal"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 160 }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              id="dotfiles-terminal-log"
              role="log"
              aria-live="polite"
              aria-label="Terminal log"
              ref={scrollRef}
              className="h-40 overflow-y-auto px-4 py-2 font-mono text-xs space-y-0.5 scrollbar-thin"
            >
              <AnimatePresence mode="popLayout">
                {lines.map((line, i) => (
                  <motion.div
                    key={`${line.timestamp}-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`flex gap-2 ${LINE_COLORS[line.type]}`}
                  >
                    <span className="opacity-60 shrink-0 w-12 text-right">
                      {LINE_PREFIX[line.type]}
                    </span>
                    <span>{line.text}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            {lines.length === 0 && (
                <div className="text-zinc-600 italic">
                  Waiting for activity...
                </div>
              )}
              <p
                ref={clearAnnouncementRef}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
