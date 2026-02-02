"use server";

import { unstable_cache } from "next/cache";
import { load } from "cheerio";

type GoldData = {
  price: string;
  unit: string;
  name: string;
  updatedAt: string;
};

type GoldPriceResult =
  | { success: true; data: GoldData }
  | { success: false; error: string };

async function fetchGoldPrice(): Promise<GoldPriceResult> {
  try {
    const response = await fetch("https://giavang.doji.vn/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      // Return error but do not expose system details if not needed,
      // though user said "do not leak env info", status text is usually fine.
      // But let's be safe and generic + status code.
      return { success: false, error: `Failed to fetch: ${response.status}` };
    }

    const html = await response.text();
    const $ = load(html);

    // Find the row containing "Nhẫn Tròn 9999 (Hưng Thịnh Vượng - Bán Lẻ)"
    // The title is in a span with class "title" inside the first td
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const targetRow = $("tr").filter((_: number, el: any) => {
      const title = $(el).find("td.first span.title").text().trim();
      return title.includes("Nhẫn Tròn 9999 (Hưng Thịnh Vượng - Bán Lẻ)");
    });

    if (targetRow.length === 0) {
      console.error("Target gold item not found in HTML");
      return { success: false, error: "Gold item not found in source" };
    }

    // Extract Sell price (Bán) - usually the 3rd column (index 2) or class .goldprice-td-1
    // Based on HTML: <td class="goldprice-td goldprice-td-1"><div class="item-relative">16,580</div></td>
    const sellPriceRaw = targetRow.find("td.goldprice-td-1").text().trim();

    // Extract update time
    // <span class="update-time size-14">Cập nhập lúc: 13:36 02/02/2026</span>
    const updateTimeRaw = $(".update-time").text().trim();
    // format: "Cập nhập lúc: 13:36 02/02/2026" -> remove prefix
    const updateTime = updateTimeRaw.replace("Cập nhập lúc:", "").trim();

    return {
      success: true,
      data: {
        price: sellPriceRaw + ",000", // Append ,000 to match previous format (assuming raw is like 16,580)
        unit: "VNĐ/Chỉ",
        name: "Nhẫn Tròn 9999 (Hưng Thịnh Vượng - Bán Lẻ)",
        updatedAt: updateTime,
      },
    };
  } catch (error) {
    console.error("Error fetching gold price:", error);
    return { success: false, error: `Failed to fetch gold price: ${error}` };
  }
}

export const getGoldPrice = unstable_cache(
  fetchGoldPrice,
  ["gold-price-doji"],
  { revalidate: 3600 },
);
