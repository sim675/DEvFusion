// Fuzzy Intent Engine — powered by Fuse.js
//
// Two responsibilities:
//   1. fuzzyDetectIntent()  — scores each word in the message against a
//      weighted keyword index; tolerates typos (e.g. "ordr" → track_order)
//   2. fuzzyCleanQuery()    — removes stop words + intent trigger words from
//      the query using fuzzy matching so misspelled triggers are stripped too
//      (e.g. "serch shoes" → "shoes")
//
// Fuse.js is configured per-use-case with different thresholds:
//   - Intent matching:  threshold 0.35  (permissive — we want to catch typos)
//   - Query cleaning:   threshold 0.15  (strict — avoid removing real product words)

import Fuse from "fuse.js";
import type { Intent } from "@/utils/chatTypes";

// ─── Intent Keyword Index ─────────────────────────────────────────────────────
// Each entry maps one keyword to an intent + priority weight.
// Weight reflects how strongly that word signals the intent (1.0 = definitive).

interface KeywordEntry {
  keyword: string;
  intent: Intent;
  weight: number;
}

const KEYWORD_INDEX: KeywordEntry[] = [
  // search_product
  { keyword: "search",    intent: "search_product",    weight: 1.0 },
  { keyword: "find",      intent: "search_product",    weight: 1.0 },
  { keyword: "show",      intent: "search_product",    weight: 0.9 },
  { keyword: "buy",       intent: "search_product",    weight: 0.9 },
  { keyword: "purchase",  intent: "search_product",    weight: 0.9 },
  { keyword: "want",      intent: "search_product",    weight: 0.8 },
  { keyword: "need",      intent: "search_product",    weight: 0.8 },
  { keyword: "looking",   intent: "search_product",    weight: 0.8 },
  { keyword: "get",       intent: "search_product",    weight: 0.7 },
  { keyword: "suggest",   intent: "search_product",    weight: 0.8 },
  { keyword: "recommend", intent: "search_product",    weight: 0.8 },
  { keyword: "list",      intent: "search_product",    weight: 0.7 },
  { keyword: "available", intent: "search_product",    weight: 0.7 },
  { keyword: "price",     intent: "search_product",    weight: 0.6 },

  // track_order
  { keyword: "order",      intent: "track_order",      weight: 1.0 },
  { keyword: "track",      intent: "track_order",      weight: 1.0 },
  { keyword: "delivery",   intent: "track_order",      weight: 0.9 },
  { keyword: "shipped",    intent: "track_order",      weight: 0.9 },
  { keyword: "dispatched", intent: "track_order",      weight: 0.9 },
  { keyword: "status",     intent: "track_order",      weight: 0.8 },
  { keyword: "package",    intent: "track_order",      weight: 0.8 },
  { keyword: "parcel",     intent: "track_order",      weight: 0.8 },
  { keyword: "arrive",     intent: "track_order",      weight: 0.7 },
  { keyword: "when",       intent: "track_order",      weight: 0.5 },

  // go_to_cart
  { keyword: "cart",     intent: "go_to_cart",         weight: 1.0 },
  { keyword: "checkout", intent: "go_to_cart",         weight: 1.0 },
  { keyword: "basket",   intent: "go_to_cart",         weight: 0.9 },
  { keyword: "bag",      intent: "go_to_cart",         weight: 0.8 },
  { keyword: "payment",  intent: "go_to_cart",         weight: 0.7 },

  // seller_signup
  { keyword: "seller",   intent: "seller_signup",      weight: 1.0 },
  { keyword: "vendor",   intent: "seller_signup",      weight: 1.0 },
  { keyword: "sell",     intent: "seller_signup",      weight: 1.0 },
  { keyword: "selling",  intent: "seller_signup",      weight: 0.9 },
  { keyword: "register", intent: "seller_signup",      weight: 0.8 },
  { keyword: "shop",     intent: "seller_signup",      weight: 0.7 },
  { keyword: "store",    intent: "seller_signup",      weight: 0.7 },
  { keyword: "listing",  intent: "seller_signup",      weight: 0.8 },

  // browse_categories
  { keyword: "categories", intent: "browse_categories", weight: 1.0 },
  { keyword: "browse",     intent: "browse_categories", weight: 1.0 },
  { keyword: "explore",    intent: "browse_categories", weight: 0.9 },
  { keyword: "category",   intent: "browse_categories", weight: 1.0 },
  { keyword: "section",    intent: "browse_categories", weight: 0.7 },
];

// ─── Fuse instances (module-level singletons — built once) ────────────────────

const intentFuse = new Fuse(KEYWORD_INDEX, {
  keys: ["keyword"],
  includeScore: true,
  threshold: 0.35,       // allows ~1-2 character typos
  minMatchCharLength: 3, // don't match very short tokens
  ignoreLocation: true,  // match anywhere in the field
  shouldSort: true,
});

// All words that should be stripped from the product query (stop words +
// intent triggers). Collected once for the query-cleaning Fuse instance.
const QUERY_STRIP_WORDS: string[] = [
  ...new Set(KEYWORD_INDEX.map((e) => e.keyword)),
  // extra functional stop words
  "i","me","my","a","an","the","please","can","you","some",
  "give","tell","about","for","something","anything","help",
  "with","like","do","is","are","have","what","which","where",
  "how","much","many","any","all","other","more",
];

const stripFuse = new Fuse(QUERY_STRIP_WORDS, {
  includeScore: true,
  threshold: 0.15,       // strict — don't accidentally strip product words
  minMatchCharLength: 3,
  ignoreLocation: true,
  shouldSort: true,
});

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Detects the user's intent using fuzzy token matching.
 *
 * Each word in the message is searched against the keyword index.
 * The per-word scores are accumulated per intent (weighted by keyword weight
 * and inverted fuse score so 0=best becomes 1=best).
 * The highest-scoring intent wins if it clears a minimum threshold.
 *
 * Advantages over exact-match:
 *   - "ordr" → track_order  ✓
 *   - "serch" → search_product ✓
 *   - "chekout" → go_to_cart ✓
 */
export function fuzzyDetectIntent(message: string): Intent {
  if (!message || typeof message !== "string") return "unknown";

  // Tokenize: split on non-alpha, filter very short tokens
  const tokens = message
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((t) => t.length >= 3);

  if (tokens.length === 0) return "unknown";

  const intentScores: Partial<Record<Intent, number>> = {};

  for (const token of tokens) {
    const results = intentFuse.search(token, { limit: 3 });
    for (const result of results) {
      const { intent, weight } = result.item;
      // score is 0 (perfect) → 1 (no match); invert so higher = better
      const matchStrength = (1 - (result.score ?? 1)) * weight;
      intentScores[intent] = (intentScores[intent] ?? 0) + matchStrength;
    }
  }

  const entries = Object.entries(intentScores) as [Intent, number][];
  if (entries.length === 0) return "unknown";

  // Sort descending by accumulated score
  entries.sort((a, b) => b[1] - a[1]);
  const [bestIntent, bestScore] = entries[0];

  // Require a minimum score to avoid false positives on short/ambiguous messages
  return bestScore >= 0.45 ? bestIntent : "unknown";
}

/**
 * Strips intent trigger words and stop words from the query text using fuzzy
 * matching so that misspelled trigger words don't pollute the search query.
 *
 * e.g. "serch iphone" → ["serch", "iphone"] → "serch" fuzzy-matches "search"
 *      → gets stripped → resulting query: "iphone"
 */
export function fuzzyCleanQuery(text: string): string {
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => {
      if (word.length < 2) return false;
      // Keep if no fuzzy match to any strip word is found
      const results = stripFuse.search(word, { limit: 1 });
      return results.length === 0;
    })
    .join(" ")
    .trim();
}
