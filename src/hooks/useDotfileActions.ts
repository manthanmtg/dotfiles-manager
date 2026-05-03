import { useCallback, useEffect, useRef, useState, useMemo } from "react";
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

  // Use a ref for dotfiles to keep callbacks stable across dotfile updates
  const dotfilesRef = useRef(dotfiles);
  useEffect(() => {
    dotfilesRef.current = dotfiles;
  }, [dotfiles]);

  const handleInstall = useCallback(
    async (filename: string) => {
      const dotfile = dotfilesRef.current.find((d) => d.filename === filename);
      if (!dotfile) return;

      if (dotfile.variables.length > 0) {
        setVariableModal(dotfile);
        return;
      }

      setInstallingFile(dotfile.filename);
      await install(filename);
      setInstallingFile(null);
    },
    [install]
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

  const handlePreview = useCallback((filename: string) => {
    const dotfile = dotfilesRef.current.find((d) => d.filename === filename);
    setPreviewModal(dotfile || null);
  }, []);

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
