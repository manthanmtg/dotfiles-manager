import { NextResponse } from "next/server";
import { detectShell } from "@/lib/shell";
import { assertSupported, getPlatformInfo } from "@/lib/platform";
import { PlatformData } from "@/lib/schemas";
import { handleApiError } from "@/lib/errors";

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
    return handleApiError(
      error,
      "An unexpected error occurred while detecting shell environment."
    );
  }
}
