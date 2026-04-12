/**
 * Intent → Route Mapper
 *
 * mapIntentToRoute()  — original simple mapper (backward-compatible fallback)
 * mapParsedToRoute()  — new rich mapper using ParsedMessage (query + filters)
 */

import type { Intent, ParsedMessage } from "@/utils/chatTypes";

// ─── Shared stop-word list (for fallback path) ────────────────────────────────

const SEARCH_STOP_WORDS: string[] = [
  "search","find","show","buy","me","a","an","the","for",
  "i","want","to","some","get","something","please","can","you",
];

function extractSearchQuery(text: string): string {
  const pattern = new RegExp(`\\b(${SEARCH_STOP_WORDS.join("|")})\\b`, "gi");
  return text.replace(pattern, " ").replace(/\s+/g, " ").trim();
}

// ─── Original mapper (unchanged, kept for backward compat) ───────────────────

/**
 * Maps a detected intent and raw message to an app route.
 * Preserved for backward compatibility with the simple pipeline.
 */
export function mapIntentToRoute(
  intent: Intent,
  message: string
): string | null {
  const text = message.toLowerCase();

  switch (intent) {
    case "search_product": {
      const cleanQuery = extractSearchQuery(text);
      return cleanQuery ? `/search?q=${encodeURIComponent(cleanQuery)}` : "/search";
    }
    case "track_order":       return "/orders";
    case "go_to_cart":        return "/cart";
    case "seller_signup":     return "/vendor/register";
    case "browse_categories": return "/categories";
    case "unknown":
    default:                  return null;
  }
}

// ─── Rich mapper using ParsedMessage ─────────────────────────────────────────

/**
 * Converts a ParsedMessage (from AI or rule-based analyzer) into a route URL.
 * Appends query params for search, priceMax, nearby, and category.
 *
 * @example
 * mapParsedToRoute({ intent: "search_product", query: "shoes", filters: { priceMax: 500, nearby: true } })
 * // → "/products?search=shoes&priceMax=500&nearby=true"
 */
export function mapParsedToRoute(parsed: ParsedMessage): string | null {
  const { intent, query, filters } = parsed;

  switch (intent) {
    case "search_product": {
      const params = new URLSearchParams();
      if (query)            params.set("q", query);
      if (filters.priceMax) params.set("priceMax", String(filters.priceMax));
      if (filters.priceMin) params.set("priceMin", String(filters.priceMin));
      if (filters.minRating) params.set("minRating", String(filters.minRating));
      if (filters.sort)     params.set("sort", filters.sort);
      if (filters.nearby)   params.set("nearby", "true");
      if (filters.category) params.set("category", filters.category);

      const qs = params.toString();
      return qs ? `/search?${qs}` : "/search";
    }

    case "track_order":       return "/orders";
    case "go_to_cart":        return "/cart";
    case "seller_signup":     return "/vendor/register";
    case "browse_categories": return "/categories";
    case "unknown":
    default:                  return null;
  }
}
