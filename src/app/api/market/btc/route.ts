import { NextRequest, NextResponse } from "next/server";

const ALLOWED_DAYS = new Set(["1", "2"]);

export async function GET(request: NextRequest) {
  const daysParam = request.nextUrl.searchParams.get("days") ?? "2";
  const days = ALLOWED_DAYS.has(daysParam) ? daysParam : "2";

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${days}&precision=2`,
      {
        headers: {
          accept: "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch BTC market data: ${response.status}`,
        },
        { status: 502 },
      );
    }

    const payload = (await response.json()) as {
      prices?: [number, number][];
    };

    const prices = Array.isArray(payload.prices)
      ? payload.prices
          .filter(
            (entry): entry is [number, number] =>
              Array.isArray(entry) &&
              typeof entry[0] === "number" &&
              typeof entry[1] === "number",
          )
          .map(([timestamp, price]) => ({ timestamp, price }))
      : [];

    return NextResponse.json(
      {
        success: true,
        data: {
          symbol: "BTC",
          currency: "USD",
          days: Number(days),
          prices,
        },
      },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    console.error("Error fetching BTC market data:", error);

    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch BTC market data: ${(error as Error)?.message || error}`,
      },
      { status: 500 },
    );
  }
}
