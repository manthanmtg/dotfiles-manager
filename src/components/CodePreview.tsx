"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check } from "lucide-react";

interface CodePreviewProps {
  open: boolean;
  title: string;
  filename: string;
  content: string;
  onClose: () => void;
}

export function CodePreview({
  open,
  title,
  filename,
  content,
  onClose,
}: CodePreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-2xl mx-4 bg-zinc-900 border border-zinc-700/50 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-semibold text-zinc-100">
                  {title}
                </h3>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">
                  ~/.dotfiles-manager/{filename}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check size={16} className="text-emerald-400" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <pre className="p-5 text-sm font-mono text-zinc-300 leading-relaxed">
                {content.split("\n").map((line, i) => (
                  <div key={i} className="flex hover:bg-zinc-800/30 -mx-5 px-5">
                    <span className="text-zinc-600 select-none w-8 shrink-0 text-right mr-4">
                      {i + 1}
                    </span>
                    <span
                      className={
                        line.startsWith("#")
                          ? "text-zinc-500"
                          : line.startsWith("alias")
                            ? "text-cyan-400"
                            : line.startsWith("export")
                              ? "text-amber-400"
                              : ""
                      }
                    >
                      {line || " "}
                    </span>
                  </div>
                ))}
              </pre>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
