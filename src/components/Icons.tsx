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
} from "lucide-react";
import { type DotfileIcon } from "@/lib/schemas";

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

export type IconName = DotfileIcon;

interface DynamicIconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName | string;
  size?: number;
}

export function DynamicIcon({
  name,
  size = 20,
  ...props
}: DynamicIconProps) {
  const Icon = (name in iconMap) ? iconMap[name as IconName] : Code;
  return <Icon size={size} {...props} />;
}
