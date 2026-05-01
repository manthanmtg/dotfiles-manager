import { NextResponse } from "next/server";
import { detectShell } from "@/lib/shell";
import { assertSupported, getPlatformInfo } from "@/lib/platform";

export async function GET() {
  try {
    assertSupported();
    const { platform, supported } = getPlatformInfo();
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
