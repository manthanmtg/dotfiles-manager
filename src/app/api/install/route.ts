import { NextResponse } from "next/server";
import { detectShell, addSource, isSourced } from "@/lib/shell";
import {
  getDotfile,
  updateDotfileContent,
  applyVariables,
} from "@/lib/dotfiles";
import { assertSupported } from "@/lib/platform";
import { InstallRequest } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    assertSupported();
    const body = await request.json();
    const parsed = InstallRequest.parse(body);

    const shell = detectShell();
    const dotfile = getDotfile(parsed.filename, shell.configPath);

    if (!dotfile) {
      return NextResponse.json(
        { success: false, error: `Dotfile not found: ${parsed.filename}` },
        { status: 404 }
      );
    }

    if (isSourced(shell.configPath, parsed.filename)) {
      return NextResponse.json(
        {
          success: false,
          error: `${parsed.filename} is already installed`,
        },
        { status: 409 }
      );
    }

    if (parsed.variables && Object.keys(parsed.variables).length > 0) {
      const updatedContent = applyVariables(dotfile.content, parsed.variables);
      updateDotfileContent(parsed.filename, updatedContent);
    }

    addSource(shell.configPath, parsed.filename);

    return NextResponse.json({
      success: true,
      data: {
        filename: parsed.filename,
        configPath: shell.configPath,
        shell: shell.shell,
        message: `Successfully installed ${dotfile.name}. Run \`source ${shell.configPath}\` to apply.`,
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
