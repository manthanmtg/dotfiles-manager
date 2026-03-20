import { NextResponse } from "next/server";
import { detectShell } from "@/lib/shell";
import { listDotfiles, createDotfile } from "@/lib/dotfiles";
import { assertSupported } from "@/lib/platform";
import { CreateDotfileRequest } from "@/lib/schemas";

export async function GET() {
  try {
    assertSupported();
    const shell = detectShell();
    const dotfiles = listDotfiles(shell.configPath);

    return NextResponse.json({ success: true, data: dotfiles });
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
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}
