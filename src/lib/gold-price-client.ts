const CACHE_KEY = "gold_price_cache";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export type GoldData = {
  price: string;
  unit: string;
  name: string;
  updatedAt: string;
};

type CacheEntry = {
  data: GoldData;
  cachedAt: number;
};

export type GoldPriceResult =
  | { success: true; data: GoldData }
  | { success: false; error: string };

export async function fetchGoldPrice(
  forceRefresh = false,
): Promise<GoldPriceResult> {
  // Check localStorage cache first
  if (!forceRefresh && typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const entry: CacheEntry = JSON.parse(raw);
        if (Date.now() - entry.cachedAt < CACHE_TTL_MS) {
          return { success: true, data: entry.data };
        }
      }
    } catch {
      // Ignore corrupt cache
    }
  }

  // Fetch from API route proxy
  try {
    const response = await fetch("/api/gold-price", { cache: "no-store" });
    const result: GoldPriceResult = await response.json();

    if (result.success) {
      // Store in localStorage with timestamp
      try {
        const entry: CacheEntry = {
          data: result.data,
          cachedAt: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
      } catch {
        // Ignore storage errors (e.g. private mode quota)
      }
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: `Failed to fetch gold price: ${(error as Error)?.message || error}`,
    };
  }
}
