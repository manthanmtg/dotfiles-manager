import { NextResponse } from "next/server";
import { detectShell, removeSource, isSourced } from "@/lib/shell";
import { getDotfile } from "@/lib/dotfiles";
import { assertSupported } from "@/lib/platform";
import { UninstallRequest, InstallResult } from "@/lib/schemas";
import { ZodError } from "zod/v4";

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
    const clientError = mapUninstallError(error);
    if (clientError) {
      return NextResponse.json(
        {
          success: false,
          error: clientError.message,
        },
        { status: clientError.status }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Unable to complete uninstall request.",
      },
      { status: 500 }
    );
  }
}

function mapUninstallError(
  error: unknown
): { status: number; message: string } | null {
  if (error instanceof SyntaxError) {
    return {
      status: 400,
      message: "Invalid JSON payload for uninstall request",
    };
  }

  if (error instanceof ZodError) {
    return {
      status: 400,
      message: "Invalid uninstall request payload",
    };
  }

  if (error instanceof Error && error.message.includes("Config file is not writable")) {
    return {
      status: 403,
      message:
        "Failed to update shell config. Check your shell config file permissions.",
    };
  }

  if (error instanceof Error && error.message.includes("Config file not found")) {
    return {
      status: 500,
      message: "Shell config file missing or inaccessible.",
    };
  }

  if (error instanceof Error && error.message.includes("No managed source line found")) {
    return {
      status: 409,
      message: "Dotfile is not currently installed in your shell configuration.",
    };
  }

  return null;
}
