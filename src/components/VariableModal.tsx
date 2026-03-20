"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Eye, EyeOff } from "lucide-react";
import type { DotfileVariable } from "@/types";

interface VariableModalProps {
  open: boolean;
  dotfileName: string;
  variables: DotfileVariable[];
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => void;
  loading: boolean;
}

export function VariableModal({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
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
            className="w-full max-w-lg mx-4 bg-zinc-900 border border-zinc-700/50 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-semibold text-zinc-100">
                  Configure Variables
                </h3>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">
                  {dotfileName}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {variables.map((v) => (
                <div key={v.name}>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    {v.label}
                    {v.required && (
                      <span className="text-rose-400 ml-1">*</span>
                    )}
                  </label>
                  {v.description && (
                    <p className="text-xs text-zinc-500 mb-2">
                      {v.description}
                    </p>
                  )}
                  <div className="relative">
                    <input
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
                      className="w-full px-3 py-2.5 bg-zinc-800/60 border border-zinc-700/50 rounded-lg text-sm text-zinc-100 font-mono placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-all"
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
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                      >
                        {showSensitive[v.name] ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white text-sm font-medium rounded-lg hover:from-cyan-400 hover:to-emerald-400 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play size={14} />
                  {loading ? "Installing..." : "Install"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
