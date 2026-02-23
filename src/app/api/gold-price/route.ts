import { load } from "cheerio";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://giavang.doji.vn/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `Failed to fetch: ${response.status}` },
        { status: 502 },
      );
    }

    const html = await response.text();
    const $ = load(html);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const targetRow = $("tr").filter((_: number, el: any) => {
      const title = $(el).find("td.first span.title").text().trim();
      return title.toLowerCase().includes("nhẫn tròn 9999");
    });

    if (targetRow.length === 0) {
      return NextResponse.json(
        { success: false, error: "Gold item not found in source" },
        { status: 404 },
      );
    }

    const sellPriceRaw = targetRow.find("td.goldprice-td-1").text().trim();

    const updateTimeRaw = $(".update-time").text().trim();
    const updateTime = updateTimeRaw.replace("Cập nhập lúc:", "").trim();

    return NextResponse.json(
      {
        success: true,
        data: {
          price: sellPriceRaw + ",000",
          unit: "VNĐ/Chỉ",
          name: "Nhẫn Tròn 9999 (Hưng Thịnh Vượng - Bán Lẻ)",
          updatedAt: updateTime,
        },
      },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    console.error("Error fetching gold price:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch gold price: ${(error as Error)?.message || error}`,
      },
      { status: 500 },
    );
  }
}
