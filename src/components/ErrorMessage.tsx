"use client";

import { motion } from "framer-motion";
import { memo } from "react";

interface ErrorMessageProps {
  error: string;
}

function ErrorMessageInner({ error }: ErrorMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm"
    >
      {error}
    </motion.div>
  );
}

export const ErrorMessage = memo(ErrorMessageInner);
