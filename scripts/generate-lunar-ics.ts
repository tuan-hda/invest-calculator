import { writeFileSync } from "fs";
import { generateICSContent } from "../src/lib/calendar-export";

const OUTPUT_FILE = "lunar-events.ics";

function generateICS() {
  const content = generateICSContent();
  writeFileSync(OUTPUT_FILE, content);
  console.log(`Successfully generated ${OUTPUT_FILE}`);
}

generateICS();
