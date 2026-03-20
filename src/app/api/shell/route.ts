import { NextResponse } from "next/server";
import { detectShell } from "@/lib/shell";
import { getPlatformInfo } from "@/lib/platform";

export async function GET() {
  try {
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
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
