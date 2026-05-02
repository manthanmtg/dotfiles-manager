import { NextResponse } from "next/server";
import { detectShell, addSource, isSourced } from "@/lib/shell";
import {
  getDotfile,
  updateDotfileContent,
  applyVariables,
} from "@/lib/dotfiles";
import { assertSupported } from "@/lib/platform";
import { InstallRequest, InstallResult } from "@/lib/schemas";
import { ZodError } from "zod/v4";

export async function POST(request: Request) {
  try {
    assertSupported();
    const body: unknown = await request.json();
    const parsed = InstallRequest.parse(body);

    const shell = detectShell();
    if (shell.shell === "unknown") {
      return NextResponse.json(
        {
          success: false,
          error: "Your shell is not supported. Only zsh, bash, and fish are supported.",
        },
        { status: 400 }
      );
    }

    if (!shell.configExists) {
      return NextResponse.json(
        {
          success: false,
          error: `Shell configuration file not found: ${shell.configPath}. Please create it first.`,
        },
        { status: 400 }
      );
    }

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

    const providedVariables = parsed.variables ?? {};
    const allowedVariables = new Set(
      dotfile.variables.map((variable) => variable.name)
    );

    const invalidVariableNames = Object.keys(providedVariables).filter(
      (name) => !allowedVariables.has(name)
    );

    if (invalidVariableNames.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid variables: ${invalidVariableNames.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const missingRequiredVariables = dotfile.variables
      .filter((variable) => variable.required)
      .filter((variable) => !(variable.name in providedVariables));

    if (missingRequiredVariables.length > 0) {
      const missingNames = missingRequiredVariables
        .map((variable) => variable.name)
        .join(", ");
      return NextResponse.json(
        {
          success: false,
          error: `Missing required variables: ${missingNames}`,
        },
        { status: 400 }
      );
    }

    if (Object.keys(providedVariables).length > 0) {
      const updatedContent = applyVariables(dotfile.content, providedVariables);
      updateDotfileContent(parsed.filename, updatedContent);
    }

    addSource(shell.configPath, parsed.filename);

    const data = InstallResult.parse({
      filename: parsed.filename,
      configPath: shell.configPath,
      shell: shell.shell,
      message: `Successfully installed ${dotfile.name}. Run \`source ${shell.configPath}\` to apply.`,
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    const clientError = mapInstallError(error);
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
        error: "Unable to complete install request.",
      },
      { status: 500 }
    );
  }
}

function mapInstallError(error: unknown): { status: number; message: string } | null {
  if (error instanceof SyntaxError) {
    return {
      status: 400,
      message: "Invalid JSON payload for install request",
    };
  }

  if (error instanceof ZodError) {
    return {
      status: 400,
      message: "Invalid install request payload",
    };
  }

  if (error instanceof Error && error.message.includes("Config file is not writable")) {
    return {
      status: 403,
      message:
        "Failed to write to shell config. Check your shell config file permissions.",
    };
  }

  if (error instanceof Error && error.message.includes("Config file not found")) {
    return {
      status: 500,
      message: "Shell config file missing or inaccessible.",
    };
  }

  if (error instanceof Error && error.message.includes("Invalid value for variable")) {
    return {
      status: 400,
      message: error.message,
    };
  }

  if (error instanceof Error && error.message.includes("Refusing to write symlinked file")) {
    return {
      status: 403,
      message: "Security error: Dotfile storage uses symbolic links which is not allowed.",
    };
  }

  return null;
}
