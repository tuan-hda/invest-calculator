import { generateICSContent } from "@/lib/calendar-export";

export async function GET() {
  try {
    const content = generateICSContent();

    // Stream the content
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(content));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/calendar",
        "Content-Disposition": 'attachment; filename="lunar-events.ics"',
      },
    });
  } catch (error) {
    console.error("Failed to export ICS:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to generate file" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
