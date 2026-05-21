import { NextResponse } from "next/server";
import { detectShell, assertSafeConfigPath, assertSupportedShell } from "@/lib/shell";
import { listDotfiles, createDotfile, getDotfile } from "@/lib/dotfiles";
import { assertSupported } from "@/lib/platform";
import { CreateDotfileRequest, DotfileEntry, CreateDotfileResponse, DotfileFilename } from "@/lib/schemas";
import { z } from "zod/v4";
import { handleApiError } from "@/lib/errors";

export async function GET() {
  try {
    assertSupported();
    const shell = detectShell();
    assertSupportedShell(shell);
    assertSafeConfigPath(shell.configPath);
    const dotfiles = listDotfiles(shell.configPath);

    const data = z.array(DotfileEntry).parse(dotfiles);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleApiError(error, "An unexpected error occurred while listing dotfiles.");
  }
}

export async function POST(request: Request) {
  try {
    assertSupported();
    const body: unknown = await request.json();
    const parsed = CreateDotfileRequest.parse(body);

    const filename = parsed.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    DotfileFilename.parse(filename);

    const shell = detectShell();
    assertSupportedShell(shell);
    assertSafeConfigPath(shell.configPath);
    const existing = getDotfile(filename, shell.configPath);
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `A dotfile named "${filename}" already exists.`,
        },
        { status: 409 }
      );
    }

    createDotfile(filename, parsed.content, {
      name: parsed.name,
      description: parsed.description,
      category: parsed.category,
      variables: parsed.variables,
      tags: parsed.tags,
    });

    const data = CreateDotfileResponse.parse({
      filename,
      message: `Created dotfile: ${filename}`,
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return handleApiError(error, "Unable to complete dotfile creation request.");
  }
}
