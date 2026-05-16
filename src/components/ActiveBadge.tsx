"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { memo } from "react";

export const ActiveBadge = memo(function ActiveBadge() {
  return (
    <div 
      className="absolute top-3 right-3 z-10"
      role="status"
      aria-label="Configuration is active"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)] overflow-hidden"
      >
        {/* Shimmer effect */}
        <motion.div
          animate={{
            x: ["-100%", "200%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 1,
          }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent pointer-events-none"
        />

        <CheckCircle2
          size={12}
          className="text-emerald-400 relative z-10"
          aria-hidden="true"
        />
        <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider relative z-10">
          Active
        </span>
      </motion.div>
    </div>
  );
});

ActiveBadge.displayName = "ActiveBadge";
