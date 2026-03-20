"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Monitor } from "lucide-react";

export function PlatformGuard() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} className="text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-100 mb-3">
          Unsupported Platform
        </h1>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          Dotfiles Manager is designed for Unix-based systems only. It requires
          direct access to shell configuration files like{" "}
          <code className="text-cyan-400 font-mono text-xs bg-zinc-800 px-1.5 py-0.5 rounded">
            ~/.zshrc
          </code>{" "}
          or{" "}
          <code className="text-cyan-400 font-mono text-xs bg-zinc-800 px-1.5 py-0.5 rounded">
            ~/.bashrc
          </code>
          .
        </p>
        <div className="flex items-center justify-center gap-2 text-zinc-500 text-xs font-mono">
          <Monitor size={14} />
          <span>Supported: macOS, Linux</span>
        </div>
      </motion.div>
    </div>
  );
}
