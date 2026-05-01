import { NextResponse } from "next/server";
import { detectShell } from "@/lib/shell";
import { assertSupported, getPlatformInfo } from "@/lib/platform";
import { PlatformData } from "@/lib/schemas";

export async function GET() {
  try {
    assertSupported();
    const { platform, supported } = getPlatformInfo();
    const shell = detectShell();

    const data = PlatformData.parse({ platform, supported, shell });

    return NextResponse.json({
      success: true,
      data,
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
