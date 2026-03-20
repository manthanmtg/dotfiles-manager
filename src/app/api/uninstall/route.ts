import { NextResponse } from "next/server";
import { detectShell, removeSource, isSourced } from "@/lib/shell";
import { getDotfile } from "@/lib/dotfiles";
import { assertSupported } from "@/lib/platform";
import { UninstallRequest } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    assertSupported();
    const body = await request.json();
    const parsed = UninstallRequest.parse(body);

    const shell = detectShell();
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

    return NextResponse.json({
      success: true,
      data: {
        filename: parsed.filename,
        configPath: shell.configPath,
        shell: shell.shell,
        message: `Successfully uninstalled ${dotfile.name}. Run \`source ${shell.configPath}\` to apply.`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
