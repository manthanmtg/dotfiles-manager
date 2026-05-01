import { NextResponse } from "next/server";
import { seedDotfiles } from "@/lib/seed";
import { assertSupported } from "@/lib/platform";
import { SeedResult } from "@/lib/schemas";

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
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
