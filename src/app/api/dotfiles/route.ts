import { NextResponse } from "next/server";
import { detectShell } from "@/lib/shell";
import { listDotfiles, createDotfile } from "@/lib/dotfiles";
import { assertSupported } from "@/lib/platform";
import { CreateDotfileRequest, DotfileEntry } from "@/lib/schemas";
import { z, ZodError } from "zod/v4";

export async function GET() {
  try {
    assertSupported();
    const shell = detectShell();
    const dotfiles = listDotfiles(shell.configPath);

    const data = z.array(DotfileEntry).parse(dotfiles);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred while listing dotfiles.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    assertSupported();
    const body = await request.json();
    const parsed = CreateDotfileRequest.parse(body);

    const filename = parsed.name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-");

    createDotfile(filename, parsed.content, {
      name: parsed.name,
      description: parsed.description,
      category: parsed.category,
      variables: parsed.variables,
      tags: parsed.tags,
    });

    return NextResponse.json({
      success: true,
      data: { filename, message: `Created dotfile: ${filename}` },
    });
  } catch (error) {
    const clientError = mapDotfileError(error);
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
        error: "Unable to complete dotfile creation request.",
      },
      { status: 500 }
    );
  }
}

function mapDotfileError(error: unknown): { status: number; message: string } | null {
  if (error instanceof SyntaxError) {
    return {
      status: 400,
      message: "Invalid JSON payload for dotfile request",
    };
  }

  if (error instanceof ZodError) {
    return {
      status: 400,
      message: "Invalid dotfile request payload",
    };
  }

  if (error instanceof Error && error.message.includes("Refusing to write symlinked file")) {
    return {
      status: 403,
      message: "Security error: Dotfile storage uses symbolic links which is not allowed.",
    };
  }

  if (error instanceof Error && error.message.includes("Invalid dotfile name")) {
    return {
      status: 400,
      message: error.message,
    };
  }

  if (error instanceof Error && (error.message.includes("EACCES") || error.message.includes("permission denied"))) {
    return {
      status: 403,
      message: "Permission denied: Unable to write dotfile to disk.",
    };
  }

  return null;
}
