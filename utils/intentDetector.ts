/**
 * Intent Detection Engine (rule-based fallback)
 *
 * detectIntent()   — simple keyword match (unchanged, stays as fallback)
 * analyzeMessage() — richer rule-based NLP: price, nearby, category, synonyms, context merge
 *
 * This module is used directly when OpenAI is unavailable.
 * The canonical AI version lives in utils/aiAnalyzer.ts.
 */

export type { Intent } from "@/utils/chatTypes";
import type {
  Intent,
  ChatFilters,
  ParsedMessage,
  ConversationContext,
} from "@/utils/chatTypes";
import { fuzzyDetectIntent, fuzzyCleanQuery } from "@/utils/fuzzyIntentEngine";

// ─── Keyword Map (simple, unchanged) ─────────────────────────────────────────

interface IntentDefinition {
  intent: Intent;
  keywords: string[];
}

const INTENT_MAP: IntentDefinition[] = [
  { intent: "search_product",    keywords: ["search", "find", "show", "buy", "want", "get", "looking"] },
  { intent: "track_order",       keywords: ["order", "track", "delivery", "shipped", "dispatched"] },
  { intent: "go_to_cart",        keywords: ["cart", "checkout", "basket"] },
  { intent: "seller_signup",     keywords: ["seller", "vendor", "sell", "selling", "list my"] },
  { intent: "browse_categories", keywords: ["categories", "browse", "explore", "all products"] },
];

/**
 * Intent detection — delegates to Fuse.js fuzzy engine.
 * Falls back gracefully: if fuzzy returns "unknown", the old
 * exact-match loop is tried as a safety net.
 */
export function detectIntent(message: string): Intent {
  if (!message || typeof message !== "string") return "unknown";

  // Primary: fuzzy matching (typo-tolerant)
  const fuzzy = fuzzyDetectIntent(message);
  if (fuzzy !== "unknown") return fuzzy;

  // Safety-net: exact substring match on the original keyword map
  const normalized = message.toLowerCase();
  for (const { intent, keywords } of INTENT_MAP) {
    if (keywords.some((kw) => normalized.includes(kw))) return intent;
  }
  return "unknown";
}

// ─── Enhanced Rule-Based NLP ─────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "i","me","my","want","need","to","a","an","the","please","can","you",
  "show","find","search","get","buy","some","give","tell","about","for",
  "something","anything","help","with","like","do","is","are","have",
]);

const NEARBY_PATTERNS = /\b(near\s?me|nearby|close\s?by|around\s?me|local|in\s?my\s?area)\b/i;

const PRICE_PATTERNS = [
  /(?:under|below|less\s+than|max|upto|up\s+to|within)\s+(?:rs\.?|₹|inr)?\s*(\d+)/i,
  /(?:rs\.?|₹|inr)\s*(\d+)\s*(?:or\s+less|max|only)?/i,
  /(\d+)\s*(?:rs\.?|₹|inr)?\s*(?:budget|max|only|or\s+less)/i,
  /cheap(?:er)?|budget|affordable|low(?:\s+price)?|inexpensive/i,  // qualitative only
];

/** A rough price ceiling when user says "cheap" / "budget" without a number */
const QUALITATIVE_PRICE_CEILING = 500;

const PRICE_MIN_PATTERNS = [
  /(?:above|over|more\s+than|starting\s+from|min|minimum)\s+(?:rs\.?|₹|inr)?\s*(\d+)/i,
  /(?:rs\.?|₹|inr)?\s*(\d+)\s*(?:or\s+more|and\s+above)/i,
];

const RATING_PATTERNS = [
  /((?:top|best|highly)\s+rated)/i,
  /(\d+(?:\.\d+)?)\+?\s*stars?/i,
  /at\s+least\s+(\d+(?:\.\d+)?)\s*stars?/i,
];

const SORT_PATTERNS = [
  { pattern: /(?:cheapest|lowest\s+price|price\s+low\s+to\s+high)/i, sort: "price_asc" as const },
  { pattern: /(?:expensive|highest\s+price|price\s+high\s+to\s+low)/i, sort: "price_desc" as const },
  { pattern: /(?:highest\s+rated|best\s+rated|top\s+rated)/i, sort: "rating_desc" as const },
];
function extractPrice(text: string): number | undefined {
  for (const pattern of PRICE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      // Numbered group — explicit price
      if (match[1] && /^\d+$/.test(match[1])) return parseInt(match[1], 10);
      // Qualitative match (cheap/budget/affordable)
      return QUALITATIVE_PRICE_CEILING;
    }
  }
  return undefined;
}

function extractPriceMin(text: string): number | undefined {
  for (const pattern of PRICE_MIN_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1] && /^\d+$/.test(match[1])) return parseInt(match[1], 10);
  }
  return undefined;
}

function extractRating(text: string): number | undefined {
  for (const pattern of RATING_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      if (match[1] && /^(?:top|best|highly)\s+rated$/i.test(match[1])) return 4;
      if (match[1]) {
        const rating = parseFloat(match[1]);
        if (!isNaN(rating)) return rating;
      }
    }
  }
  return undefined;
}

function extractSort(text: string): "price_asc" | "price_desc" | "rating_desc" | undefined {
  for (const { pattern, sort } of SORT_PATTERNS) {
    if (pattern.test(text)) return sort;
  }
  return undefined;
}

function extractQuery(text: string, intent: Intent): string {
  // Step 1 — strip regex-identifiable filters (price, nearby, sort phrases)
  const stripped = text.toLowerCase()
    .replace(NEARBY_PATTERNS, " ")
    .replace(/(?:under|below|less\s+than|upto|up\s+to|max|within)\s+(?:rs\.?|₹|inr)?\s*\d+/gi, " ")
    .replace(/(?:above|over|more\s+than|starting\s+from|min|minimum)\s+(?:rs\.?|₹|inr)?\s*\d+/gi, " ")
    .replace(/(?:rs\.?|₹|inr)\s*\d+/gi, " ")
    .replace(/\d+(?:\.\d+)?\+?\s*stars?/gi, " ")
    .replace(/(?:cheapest|lowest\s+price|expensive|highest\s+price|top\s+rated|best\s+rated|highly\s+rated)/gi, " ")
    .replace(/\d+/g, " ");

  // Step 2 — fuzzy-strip intent keywords and stop words
  // This removes misspelled trigger words that regex cannot catch
  return fuzzyCleanQuery(stripped);
}

/**
 * Rule-based fallback that produces a ParsedMessage.
 * Called when OpenAI is unavailable or the API key is not set.
 */
export function analyzeMessage(
  message: string,
  context?: ConversationContext
): ParsedMessage {
  const text = message.trim();
  const intent = detectIntent(text);

  const filters: ChatFilters = {
    nearby: NEARBY_PATTERNS.test(text) || undefined,
    priceMax: extractPrice(text),
    priceMin: extractPriceMin(text),
    minRating: extractRating(text),
    sort: extractSort(text),
  };

  // Remove undefined keys
  if (!filters.nearby) delete filters.nearby;
  if (!filters.priceMax) delete filters.priceMax;
  if (!filters.priceMin) delete filters.priceMin;
  if (!filters.minRating) delete filters.minRating;
  if (!filters.sort) delete filters.sort;

  const query = intent === "search_product" ? extractQuery(text, intent) : undefined;

  // ── Context merge: if intent is unknown treat as refinement ──────────────
  if (intent === "unknown" && context?.lastIntent && context.lastIntent !== "unknown") {
    return {
      intent: context.lastIntent,
      query: query || context.lastQuery,
      filters: { ...context.lastFilters, ...filters },
    };
  }

  // ── Partial refinement: same intent, merge filters ───────────────────────
  if (
    intent === context?.lastIntent &&
    context.lastIntent === "search_product"
  ) {
    return {
      intent,
      query: query || context.lastQuery,
      filters: { ...context.lastFilters, ...filters },
    };
  }

  return { intent, query, filters };
}
