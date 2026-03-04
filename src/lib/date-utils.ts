"use client";

/**
 * Formats a date string from "DD/MM/YYYY" to "DD-MMM-YY"
 * @param dateStr Date string in "DD/MM/YYYY" format
 * @returns Formatted date string or original if parsing fails
 */
export function formatInvestDate(dateStr: string) {
  try {
    const parts = dateStr.split("/");
    if (parts.length < 3) return dateStr;

    const day = parseInt(parts[0]);
    const monthIndex = parseInt(parts[1]) - 1;
    const year = parseInt(parts[2]);

    const months = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];

    const dd = day;
    const mmm = months[monthIndex];
    const yy = year.toString().slice(-2);

    return `${dd}-${mmm}-${yy}`;
  } catch {
    return dateStr;
  }
}
