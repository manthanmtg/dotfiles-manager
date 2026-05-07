import { NextResponse } from "next/server";
import { detectShell, removeSource, isSourced, assertSafeConfigPath, assertSupportedShell } from "@/lib/shell";
import { getDotfile } from "@/lib/dotfiles";
import { assertSupported } from "@/lib/platform";
import { UninstallRequest, InstallResult } from "@/lib/schemas";
import { handleApiError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    assertSupported();
    const body: unknown = await request.json();
    const parsed = UninstallRequest.parse(body);

    const shell = detectShell();
    assertSupportedShell(shell);
    assertSafeConfigPath(shell.configPath);

    const dotfile = getDotfile(parsed.filename, shell.configPath);

    if (!dotfile) {
      return NextResponse.json(
        { success: false, error: `Dotfile not found: ${parsed.filename}` },
        { status: 404 }
      );
    }

    if (!isSourced(shell.configPath, parsed.filename)) {
      return NextResponse.json(
        {
          success: false,
          error: `${parsed.filename} is not currently installed`,
        },
        { status: 409 }
      );
    }

    removeSource(shell.configPath, parsed.filename);

    const data = InstallResult.parse({
      filename: parsed.filename,
      configPath: shell.configPath,
      shell: shell.shell,
      message: `Successfully uninstalled ${dotfile.name}. Run \`source ${shell.configPath}\` to apply.`,
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return handleApiError(error, "Unable to complete uninstall request.");
  }
}
