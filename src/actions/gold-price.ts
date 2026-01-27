"use server";

import { unstable_cache } from "next/cache";
import { XMLParser } from "fast-xml-parser";

type GoldItem = {
  _Name: string;
  _Key: string;
  _Sell: string;
  _Buy: string;
};

type GoldList = {
  GoldList: {
    LED: {
      Row: GoldItem[];
    };
    DateTime: string;
  };
};

async function fetchGoldPrice() {
  try {
    const response = await fetch(
      "https://update.giavang.doji.vn/banggia/doji_92411/92411",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch gold price: ${response.statusText}`);
    }

    const xmlData = await response.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "_",
    });

    // The XML structure based on inspection:
    // <GoldList><LED><Row ... /><Row ... /></LED></GoldList>
    // fast-xml-parser often converts attributes to properties prefixed with the configured prefix (or default)
    // In the raw XML: <Row Name='...' Key='...' ... />
    // With ignoreAttributes: false, it should parse correctly.

    const result = parser.parse(xmlData);

    // Helper to handle potential array vs single object if XML changes (though Row is likely an array here)
    const rows = result?.GoldList?.LED?.Row;

    if (!rows || !Array.isArray(rows)) {
      console.error("Unexpected XML structure:", result);
      return null;
    }

    const targetItem = rows.find((item: any) => item._Key === "doji_3");

    if (!targetItem) {
      console.error("Target gold item (doji_3) not found");
      return null;
    }

    // Return the Buy price. It comes as a string like "17,300" (meaning 17,300 * 1000 VND / chi?)
    // The user just asked for the value mostly. I'll return the string directly for now,
    // or parse it if calculation is needed.
    // The prompt says: lấy giá trị mua vào của loại vàng: "Nhẫn Tròn 9999 (Hưng Thịnh Vượng) - Bán Lẻ"
    // "17,300" usually means 17.3 million or something?
    // Actually standard gold price in Vietnam is often quoted in VND/chi (3.75g) or VND/luong (37.5g).
    // 17,300 likely means 17,300,000 VND / luong? Or 17,300 * 1000 / chi?
    // Wait, let's look at today's prices. Gold is high.
    // If it is 17,300, it's weird.
    // Ah, DOJI raw data: Buy='17,300'.
    // SJC gold is around 80-90 million VND / luong.
    // So 17,300 might be partial? Or looking at a different unit?
    // "Đơn vị: Nghìn VNĐ/Chỉ" seen in HTML header!
    // So 17,300 Nghìn VNĐ/Chỉ => 17,300,000 VND / 1000 * 1000 => 17,300,000 / tael? No.
    // 17,300 (thousand) / Chi => 17,300,000 VND / Chi? That's too high.
    // Wait. Gold is ~8 million / chi (~80 million / tael).
    // Maybe the unit is different or this is old data.
    // Let's check "DateTime": "04:10 27-01-2026".
    // Wait, the year 2026?
    // The metadata says current time is 2026-01-27.
    // Okay, so 17,300 * 1000 = 17,300,000 VND / Chi?
    // That means 173 million / Tael (10 chi).
    // If Gold is 173 million/tael in 2026, valid.
    // I will return the string as is, or "17,300".
    // I'll also return the raw value and maybe a formatted label.

    return {
      price: targetItem._Buy,
      unit: "Nghìn VNĐ/Chỉ",
      name: targetItem._Name,
      updatedAt: result.GoldList.LED.DateTime,
    };
  } catch (error) {
    console.error("Error fetching gold price:", error);
    return null;
  }
}

export const getGoldPrice = unstable_cache(
  fetchGoldPrice,
  ["gold-price-doji"],
  { revalidate: 3600 },
);
