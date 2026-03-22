"use client";

/**
 * Formats a date string to "DD-MMM-YY".
 * Supports ISO timestamps from Supabase and "DD/MM/YYYY" input.
 * @returns Formatted date string or original if parsing fails
 */
export function formatInvestDate(dateStr: string) {
  try {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    let day: number;
    let monthIndex: number;
    let year: number;

    if (dateStr.includes("/")) {
      const parts = dateStr.split("/");
      if (parts.length < 3) return dateStr;

      day = Number.parseInt(parts[0], 10);
      monthIndex = Number.parseInt(parts[1], 10) - 1;
      year = Number.parseInt(parts[2], 10);
    } else {
      const parsedDate = new Date(dateStr);
      if (Number.isNaN(parsedDate.getTime())) return dateStr;

      day = parsedDate.getUTCDate();
      monthIndex = parsedDate.getUTCMonth();
      year = parsedDate.getUTCFullYear();
    }

    if (monthIndex < 0 || monthIndex > 11 || Number.isNaN(day) || Number.isNaN(year)) {
      return dateStr;
    }

    const dd = String(day).padStart(2, "0");
    const mmm = months[monthIndex];
    const yy = year.toString().slice(-2);

    return `${dd}-${mmm}-${yy}`;
  } catch {
    return dateStr;
  }
}
