import { NextResponse } from "next/server";
import { seedDotfiles } from "@/lib/seed";
import { assertSupported } from "@/lib/platform";

export async function POST() {
  try {
    assertSupported();
    const result = seedDotfiles();

    return NextResponse.json({
      success: true,
      data: result,
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
