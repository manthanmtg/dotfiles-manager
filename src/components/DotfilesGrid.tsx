"use client";

import { AnimatePresence } from "framer-motion";
import { memo } from "react";
import { DotfileCard } from "@/components/DotfileCard";
import type { DotfileEntry } from "@/types";

interface DotfilesGridProps {
  dotfiles: DotfileEntry[];
  installingFile: string | null;
  onInstall: (filename: string) => void;
  onUninstall: (filename: string) => void;
  onPreview: (filename: string) => void;
}

function DotfilesGridInner({
  dotfiles,
  installingFile,
  onInstall,
  onUninstall,
  onPreview,
}: DotfilesGridProps) {
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <AnimatePresence mode="popLayout">
        {dotfiles.map((dotfile) => (
          <li key={dotfile.filename}>
            <DotfileCard
              filename={dotfile.filename}
              dotfile={dotfile}
              onInstall={onInstall}
              onUninstall={onUninstall}
              onPreview={onPreview}
              installing={installingFile === dotfile.filename}
            />
          </li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

export const DotfilesGrid = memo(DotfilesGridInner);
