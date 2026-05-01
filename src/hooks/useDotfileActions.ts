"use client";

import { useCallback, useMemo, useState } from "react";
import type { DotfileEntry, InstallResult } from "@/types";

interface UseDotfileActionsParams {
  dotfiles: DotfileEntry[];
  install: (
    filename: string,
    variables?: Record<string, string>
  ) => Promise<InstallResult | null>;
  uninstall: (filename: string) => Promise<InstallResult | null>;
}

export function useDotfileActions({
  dotfiles,
  install,
  uninstall,
}: UseDotfileActionsParams) {
  const [installingFile, setInstallingFile] = useState<string | null>(null);
  const [variableModal, setVariableModal] = useState<DotfileEntry | null>(null);
  const [previewModal, setPreviewModal] = useState<DotfileEntry | null>(null);

  const dotfileByFilename = useMemo(() => {
    const map = new Map<string, DotfileEntry>();
    for (const dotfile of dotfiles) {
      map.set(dotfile.filename, dotfile);
    }
    return map;
  }, [dotfiles]);

  const handleInstall = useCallback(
    async (filename: string) => {
      const dotfile = dotfileByFilename.get(filename);
      if (!dotfile) return;

      if (dotfile.variables.length > 0) {
        setVariableModal(dotfile);
        return;
      }

      setInstallingFile(dotfile.filename);
      await install(filename);
      setInstallingFile(null);
    },
    [dotfileByFilename, install]
  );

  const handleVariableSubmit = useCallback(
    async (values: Record<string, string>) => {
      if (!variableModal) return;
      setInstallingFile(variableModal.filename);
      await install(variableModal.filename, values);
      setInstallingFile(null);
      setVariableModal(null);
    },
    [install, variableModal]
  );

  const handleUninstall = useCallback(
    async (filename: string) => {
      setInstallingFile(filename);
      await uninstall(filename);
      setInstallingFile(null);
    },
    [uninstall]
  );

  const handlePreview = useCallback(
    (filename: string) => {
      setPreviewModal(dotfileByFilename.get(filename) || null);
    },
    [dotfileByFilename]
  );

  const closeVariableModal = useCallback(() => {
    setVariableModal(null);
  }, []);

  const closePreviewModal = useCallback(() => {
    setPreviewModal(null);
  }, []);

  return useMemo(
    () => ({
      installingFile,
      variableModal,
      previewModal,
      handleInstall,
      handleVariableSubmit,
      handleUninstall,
      handlePreview,
      closeVariableModal,
      closePreviewModal,
    }),
    [
      installingFile,
      variableModal,
      previewModal,
      handleInstall,
      handleVariableSubmit,
      handleUninstall,
      handlePreview,
      closeVariableModal,
      closePreviewModal,
    ]
  );
}
