import { NextResponse } from "next/server";
import { detectShell } from "@/lib/shell";
import { assertSupported, getPlatformInfo } from "@/lib/platform";
import { PlatformData } from "@/lib/schemas";
import { ZodError } from "zod/v4";

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
    const clientError = mapShellError(error);
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
        error: "An unexpected error occurred while detecting shell environment.",
      },
      { status: 500 }
    );
  }
}

function mapShellError(error: unknown): { status: number; message: string } | null {
  if (error instanceof ZodError) {
    return {
      status: 500,
      message: "Internal validation error: platform data format mismatch.",
    };
  }

  if (error instanceof Error && error.message.includes("Platform not supported")) {
    return {
      status: 403,
      message: error.message,
    };
  }

  return null;
}
