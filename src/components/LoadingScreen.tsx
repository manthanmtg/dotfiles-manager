"use client";

import { motion } from "framer-motion";
import { Terminal } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/30"
        >
          <Terminal size={24} className="text-white" />
        </motion.div>
        <div className="text-center">
          <p className="text-sm text-zinc-300 font-medium">
            Initializing Dotfiles Manager
          </p>
          <p className="text-xs text-zinc-600 font-mono mt-1">
            Detecting shell environment...
          </p>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-1.5 h-1.5 rounded-full bg-cyan-400"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
