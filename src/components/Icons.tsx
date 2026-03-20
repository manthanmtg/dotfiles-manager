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
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
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
};

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
}

export function DynamicIcon({
  name,
  className = "",
  size = 20,
}: DynamicIconProps) {
  const Icon = iconMap[name] || Code;
  return <Icon className={className} size={size} />;
}
