import { getSolarDate } from "@dqcai/vn-lunar";
import { LUNAR_EVENTS } from "../config/lunar-events";

function formatICSDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

export function generateICSContent(
  startYear: number = 2026,
  endYear: number = 2026,
): string {
  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Antigravity//LunarEvents//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Lunar Events",
    "X-WR-TIMEZONE:Asia/Ho_Chi_Minh",
  ];

  for (let year = startYear; year <= endYear; year++) {
    for (const event of LUNAR_EVENTS) {
      // getSolarDate(day, month, year, leap?)
      const solarInfo = getSolarDate(event.day, event.month, year);

      // solarInfo.day, solarInfo.month, solarInfo.year
      const startDate = new Date(
        solarInfo.year,
        solarInfo.month - 1,
        solarInfo.day,
      );
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 1);

      icsLines.push("BEGIN:VEVENT");
      icsLines.push(`SUMMARY:${event.name}`);
      icsLines.push(`DTSTART;VALUE=DATE:${formatICSDate(startDate)}`);
      icsLines.push(`DTEND;VALUE=DATE:${formatICSDate(endDate)}`);
      icsLines.push(`DESCRIPTION:Lunar Date: ${event.day}/${event.month}`);
      icsLines.push("TRANSP:TRANSPARENT");
      icsLines.push("BEGIN:VALARM");
      icsLines.push("ACTION:DISPLAY");
      icsLines.push("DESCRIPTION:Reminder");
      icsLines.push("TRIGGER:PT9H");
      icsLines.push("END:VALARM");
      icsLines.push("END:VEVENT");
    }
  }

  icsLines.push("END:VCALENDAR");

  return icsLines.join("\r\n");
}
