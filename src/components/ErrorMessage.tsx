"use client";

import { motion } from "framer-motion";
import { memo } from "react";
import { ShieldAlert } from "lucide-react";

interface ErrorMessageProps {
  error: string;
}

function ErrorMessageInner({ error }: ErrorMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-3 shadow-lg shadow-rose-950/20"
    >
      <ShieldAlert size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1">
        <p className="font-semibold mb-0.5">Operation failed</p>
        <p className="text-rose-400/80 leading-relaxed">{error}</p>
      </div>
    </motion.div>
  );
}

export const ErrorMessage = memo(ErrorMessageInner);
