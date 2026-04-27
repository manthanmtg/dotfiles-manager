import { NextResponse } from "next/server";
import { detectShell, addSource, isSourced } from "@/lib/shell";
import {
  getDotfile,
  updateDotfileContent,
  applyVariables,
} from "@/lib/dotfiles";
import { assertSupported } from "@/lib/platform";
import { InstallRequest } from "@/lib/schemas";
import { ZodError } from "zod/v4";

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

    const providedVariables = parsed.variables ?? {};
    const allowedVariables = new Set(
      dotfile.variables.map((variable) => variable.name)
    );

    const invalidVariableNames = Object.keys(providedVariables).filter(
      (name) => !allowedVariables.has(name)
    );

    if (invalidVariableNames.length > 0) {
      throw new Error(
        `Invalid variables: ${invalidVariableNames.join(", ")}`
      );
    }

    const missingRequiredVariables = dotfile.variables
      .filter((variable) => variable.required)
      .filter((variable) => !(variable.name in providedVariables));

    if (missingRequiredVariables.length > 0) {
      const missingNames = missingRequiredVariables
        .map((variable) => variable.name)
        .join(", ");
      throw new Error(`Missing required variables: ${missingNames}`);
    }

    const hasNewlineValues = Object.entries(providedVariables).some(
      ([, value]) => /[\r\n]/.test(value)
    );

    if (hasNewlineValues) {
      throw new Error("Variable values cannot contain newlines");
    }

    if (Object.keys(providedVariables).length > 0) {
      const updatedContent = applyVariables(dotfile.content, providedVariables);
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
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON payload for install request",
        },
        { status: 400 }
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid install request payload",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
