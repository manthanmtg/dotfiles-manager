"use client";

import {
  Zap,
  Code,
  Terminal,
  Shield,
  Settings,
  Braces,
  GitBranch,
  Container,
  Box,
  FolderOpen,
  FileArchive,
  ShieldAlert,
  Network,
  FolderPlus,
  FileEdit,
  type LucideIcon,
} from "lucide-react";

const iconMap = {
  Zap,
  Code,
  Terminal,
  Shield,
  Settings,
  Braces,
  GitBranch,
  Container,
  Box,
  FolderOpen,
  FileArchive,
  ShieldAlert,
  Network,
  FolderPlus,
  FileEdit,
} as const;

export type IconName = keyof typeof iconMap;

interface DynamicIconProps {
  name: IconName | string;
  className?: string;
  size?: number;
}

export function DynamicIcon({
  name,
  className = "",
  size = 20,
}: DynamicIconProps) {
  const Icon = (iconMap as Record<string, LucideIcon>)[name] || Code;
  return <Icon className={className} size={size} />;
}
