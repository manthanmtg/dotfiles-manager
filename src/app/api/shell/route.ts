import { NextResponse } from "next/server";
import { detectShell } from "@/lib/shell";
import { assertSupported, getPlatformInfo } from "@/lib/platform";

export async function GET() {
  try {
    assertSupported();
    const { platform, supported } = getPlatformInfo();

    if (!supported) {
      return NextResponse.json({
        success: false,
        error: `Unsupported platform: ${platform}. Only macOS and Linux are supported.`,
      });
    }

    const shell = detectShell();

    return NextResponse.json({
      success: true,
      data: { platform, supported, shell },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Unsupported platform")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported platform: unsupported for dotfiles-manager. Only macOS and Linux are supported.",
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
