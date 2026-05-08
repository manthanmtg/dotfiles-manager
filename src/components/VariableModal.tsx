"use client";

import { memo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Eye, EyeOff } from "lucide-react";
import type { DotfileVariable } from "@/types";
import { useTrapFocus } from "@/hooks/useTrapFocus";

interface VariableModalProps {
  open: boolean;
  dotfileName: string;
  variables: DotfileVariable[];
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => void;
  loading: boolean;
}

export const VariableModal = memo(function VariableModal({
  open,
  dotfileName,
  variables,
  onClose,
  onSubmit,
  loading,
}: VariableModalProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const v of variables) {
      initial[v.name] = v.default || "";
    }
    return initial;
  });
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>(
    {}
  );
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  // Extract focus management to useTrapFocus
  useTrapFocus(
    dialogRef,
    open,
    onClose,
    variables.length > 0 ? firstInputRef : closeButtonRef
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          role="presentation"
        onClick={onClose}
      >
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-lg mx-4 bg-zinc-900 border border-zinc-700/50 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="variable-modal-title"
            aria-describedby="variable-modal-description"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <div>
                <h3
                  id="variable-modal-title"
                  className="text-base font-semibold text-zinc-100"
                >
                  Configure Variables
                </h3>
                <p
                  id="variable-modal-description"
                  className="text-xs text-zinc-500 font-mono mt-0.5"
                >
                  {dotfileName}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close variable modal"
                ref={closeButtonRef}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {variables.map((v, i) => {
                const inputId = `variable-${v.name}`;
                const descriptionId = `${inputId}-description`;

                return (
                  <div key={v.name}>
                    <label
                      htmlFor={inputId}
                      className="block text-sm font-medium text-zinc-300 mb-1.5"
                    >
                      {v.label}
                      {v.required && <span className="text-rose-400 ml-1">*</span>}
                    </label>
                    {v.description && (
                      <p id={descriptionId} className="text-xs text-zinc-500 mb-2">
                        {v.description}
                      </p>
                    )}
                    <div className="relative">
                      <input
                        ref={i === 0 ? firstInputRef : undefined}
                        id={inputId}
                        type={
                          v.sensitive && !showSensitive[v.name]
                            ? "password"
                            : "text"
                        }
                        value={values[v.name] || ""}
                        onChange={(e) =>
                          setValues((prev) => ({
                            ...prev,
                            [v.name]: e.target.value,
                          }))
                        }
                        placeholder={v.default || `Enter ${v.label.toLowerCase()}`}
                        required={v.required}
                        aria-required={v.required}
                        aria-describedby={
                          v.description ? descriptionId : undefined
                        }
                        className="w-full px-3 py-2.5 bg-zinc-800/60 border border-zinc-700/50 rounded-lg text-sm text-zinc-100 font-mono placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40 focus-visible:border-cyan-500/40 transition-all"
                      />
                      {v.sensitive && (
                        <button
                          type="button"
                          onClick={() =>
                            setShowSensitive((prev) => ({
                              ...prev,
                              [v.name]: !prev[v.name],
                            }))
                          }
                          aria-label={
                            showSensitive[v.name]
                              ? `Hide ${v.label}`
                              : `Show ${v.label}`
                          }
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                        >
                          {showSensitive[v.name] ? (
                            <EyeOff size={16} aria-hidden="true" />
                          ) : (
                            <Eye size={16} aria-hidden="true" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white text-sm font-medium rounded-lg hover:from-cyan-400 hover:to-emerald-400 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play size={14} aria-hidden="true" />
                  <span aria-live="polite">
                    {loading ? "Installing..." : "Install"}
                  </span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

VariableModal.displayName = "VariableModal";
