import { NextResponse } from "next/server";
import { seedDotfiles } from "@/lib/seed";
import { assertSupported } from "@/lib/platform";
import { SeedResult } from "@/lib/schemas";
import { handleApiError } from "@/lib/errors";

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
    return handleApiError(error, "Unable to complete dotfile seeding.");
  }
}
