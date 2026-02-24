import { NextResponse } from "next/server";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { generateICSContent } from "@/lib/calendar-export";

export async function POST() {
  try {
    const content = generateICSContent();
    const publicDir = join(process.cwd(), "public");
    const filePath = join(publicDir, "lunar-events.ics");

    if (!existsSync(publicDir)) {
      mkdirSync(publicDir, { recursive: true });
    }

    writeFileSync(filePath, content);

    return NextResponse.json({
      success: true,
      url: "/lunar-events.ics",
    });
  } catch (error) {
    console.error("Failed to export ICS:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate file" },
      { status: 500 },
    );
  }
}
