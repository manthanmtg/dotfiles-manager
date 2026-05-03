import { NextResponse } from "next/server";
import { seedDotfiles } from "@/lib/seed";
import { assertSupported } from "@/lib/platform";
import { SeedResult } from "@/lib/schemas";
import { ZodError } from "zod/v4";

export async function POST() {
  try {
    assertSupported();
    const result = seedDotfiles();

    const data = SeedResult.parse(result);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    const clientError = mapSeedError(error);
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
        error: "Unable to complete dotfile seeding.",
      },
      { status: 500 }
    );
  }
}

function mapSeedError(error: unknown): { status: number; message: string } | null {
  if (error instanceof ZodError) {
    return {
      status: 500,
      message: "Internal validation error: seed result format mismatch.",
    };
  }

  if (error instanceof Error && error.message.includes("Refusing to write symlinked file")) {
    return {
      status: 403,
      message: "Security error: Dotfile storage uses symbolic links which is not allowed.",
    };
  }

  if (error instanceof Error && (error.message.includes("EACCES") || error.message.includes("permission denied"))) {
    return {
      status: 403,
      message: "Permission denied: Unable to seed dotfiles to disk.",
    };
  }

  if (error instanceof Error && error.message.includes("Invalid dotfile name")) {
    return {
      status: 400,
      message: error.message,
    };
  }

  return null;
}
