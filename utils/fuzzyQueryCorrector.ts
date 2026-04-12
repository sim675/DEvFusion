// Fuzzy Query Corrector — powered by Fuse.js + Self-Learning Engine
//
// Three-layer correction pipeline:
//   Layer 1 (fastest): Learned corrections from localStorage (client) or
//                      in-memory MongoDB cache (server) — O(1) Map lookup
//   Layer 2 (smart):   Fuse.js vocabulary fuzzy match — handles known products
//   Layer 3 (fallback): Return token unchanged
//
// Every correction is recorded so layers 1+2 get smarter over time.

import Fuse from "fuse.js";

// ─── Correction Result ────────────────────────────────────────────────────────

export interface CorrectionResult {
  query:       string;             // final corrected query
  corrections: Record<string, string>; // map of original→corrected tokens (non-empty if any fix was made)
  wasChanged:  boolean;
}

// ─── Product Vocabulary ───────────────────────────────────────────────────────
// Organised by category. Includes common brands, generic terms, and
// frequently misspelled words. Extend freely.

const VOCABULARY: string[] = [
  // ── Electronics
  "iphone", "samsung", "xiaomi", "oneplus", "realme", "oppo", "vivo", "nokia",
  "motorola", "google", "pixel", "apple",
  "mobile", "smartphone", "phone", "tablet", "ipad",
  "laptop", "notebook", "computer", "desktop", "macbook", "lenovo", "dell",
  "hp", "asus", "acer", "msi",
  "monitor", "display", "screen", "keyboard", "mouse", "webcam",
  "television", "tv", "oled", "qled", "led",
  "headphone", "earphone", "earbuds", "airpods", "neckband",
  "speaker", "bluetooth", "jbl", "boat", "bose", "sony", "sennheiser",
  "charger", "cable", "adapter", "power bank", "battery",
  "camera", "dslr", "mirrorless", "gopro", "drone",
  "smartwatch", "watch", "band", "fitbit", "garmin",
  "router", "wifi", "modem", "switch", "ethernet",
  "hard disk", "ssd", "pendrive", "memory card", "ram",
  "printer", "scanner", "projector",

  // ── Clothing & Fashion
  "shirt", "tshirt", "polo", "kurta", "dress", "saree", "lehenga",
  "jeans", "pants", "trousers", "shorts", "skirt", "leggings",
  "jacket", "hoodie", "sweater", "sweatshirt", "coat", "blazer",
  "suit", "formal", "casual", "ethnic", "western",
  "underwear", "innerwear", "socks", "cap", "hat", "scarf",

  // ── Footwear
  "shoes", "sneakers", "sandals", "heels", "boots", "slippers",
  "loafers", "floaters", "sports shoes", "running shoes",
  "nike", "adidas", "puma", "reebok", "skechers", "bata", "woodland",

  // ── Beauty & Personal Care
  "shampoo", "conditioner", "serum", "moisturizer", "sunscreen", "toner",
  "lipstick", "foundation", "concealer", "mascara", "eyeliner",
  "perfume", "deodorant", "cologne",
  "face wash", "cleanser", "scrub", "mask",
  "hair oil", "hair dye", "razor", "trimmer",
  "loreal", "maybeline", "lakme", "himalaya", "nykaa", "biotique",

  // ── Food & Grocery
  "rice", "wheat", "flour", "sugar", "salt", "oil", "ghee", "butter",
  "biscuit", "chips", "snacks", "chocolate", "candy",
  "tea", "coffee", "juice", "water bottle",
  "vegetables", "fruits", "organic", "pickles", "sauce", "ketchup",

  // ── Furniture & Home
  "sofa", "chair", "table", "desk", "bed", "mattress", "pillow",
  "wardrobe", "cabinet", "shelf", "bookshelf", "rack",
  "curtain", "bedsheet", "blanket", "pillow cover",
  "lamp", "fan", "cooler", "air conditioner",

  // ── Sports & Fitness
  "cricket", "football", "badminton", "tennis", "basketball",
  "bat", "ball", "racket", "gloves", "helmet", "jersey",
  "dumbbell", "barbell", "resistance band", "yoga mat", "treadmill",
  "cycle", "bicycle", "skipping rope", "protein",

  // ── Books & Stationery
  "book", "novel", "textbook", "notebook", "diary",
  "pen", "pencil", "marker", "eraser", "stapler",

  // ── Toys & Kids
  "toy", "doll", "puzzle", "board game", "lego", "cycle",
  "baby", "infant", "diaper", "stroller",

  // ── Kitchen & Appliances
  "mixer", "grinder", "blender", "juicer", "microwave", "oven",
  "refrigerator", "fridge", "washing machine", "iron",
  "cooker", "pressure cooker", "pan", "kadai", "bowl", "plate",
];

// ─── Fuse instance ────────────────────────────────────────────────────────────
// Conservative threshold (0.25) — only correct when very confident.
// ignoreLocation: true — don't penalize words that appear mid-string.

const vocabFuse = new Fuse(VOCABULARY, {
  includeScore: true,
  threshold: 0.25,
  minMatchCharLength: 3,
  ignoreLocation: true,
  shouldSort: true,
});

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * SYNC version: uses only the static Fuse.js vocabulary.
 * Safe to call in non-async contexts (e.g. client components without a hook).
 */
export function correctQuery(rawQuery: string): string {
  if (!rawQuery) return rawQuery;
  const tokens = rawQuery.trim().split(/\s+/);
  return tokens
    .map((token) => {
      if (token.length < 4 || /^\d+$/.test(token)) return token;
      const results = vocabFuse.search(token, { limit: 1 });
      if (results.length > 0 && (results[0].score ?? 1) <= 0.20) return results[0].item;
      return token;
    })
    .join(" ")
    .trim();
}

/**
 * ASYNC server-side version: checks the learning engine cache first (O(1)),
 * then falls back to Fuse.js vocabulary matching.
 *
 * Returns a CorrectionResult so the caller knows exactly what changed
 * and can log corrections to the learning engine.
 */
export async function smartCorrectQuery(rawQuery: string): Promise<CorrectionResult> {
  if (!rawQuery) return { query: rawQuery, corrections: {}, wasChanged: false };

  // Lazy-load the learning engine on the server side only
  // (this module may also be imported by client components for reRankProducts)
  let getLearnedFn: ((word: string) => string | null) | null = null;
  if (typeof window === "undefined") {
    try {
      const engine = await import("@/utils/searchLearningEngine");
      await engine.initLearningCache();
      getLearnedFn = engine.getLearnedCorrection;
    } catch {
      // Learning engine unavailable (e.g. no DB) — proceed without it
    }
  }

  const tokens = rawQuery.trim().split(/\s+/);
  const correctionsMade: Record<string, string> = {};

  const correctedTokens = tokens.map((token) => {
    if (token.length < 3 || /^\d+$/.test(token)) return token;

    // Layer 1: learned correction cache
    if (getLearnedFn) {
      const learned = getLearnedFn(token);
      if (learned && learned !== token) {
        correctionsMade[token] = learned;
        return learned;
      }
    }

    // Layer 2: Fuse.js vocabulary
    const results = vocabFuse.search(token, { limit: 1 });
    if (results.length > 0 && (results[0].score ?? 1) <= 0.20 && results[0].item !== token) {
      correctionsMade[token] = results[0].item;
      return results[0].item;
    }

    return token;
  });

  const corrected = correctedTokens.join(" ").trim();
  return {
    query:       corrected,
    corrections: correctionsMade,
    wasChanged:  corrected !== rawQuery.trim(),
  };
}

/**
 * Scores a list of product objects against a search query using Fuse.js.
 * Used client-side to re-rank MongoDB results for better relevance.
 *
 * @param products  - Array of products from the search API
 * @param query     - The raw search query string
 * @returns Products sorted by Fuse.js relevance score (best first)
 */
export function reRankProducts<T extends {
  name: string;
  brand?: string;
  tags?: string[];
  keywords?: string[];
  shortDescription?: string;
}>(products: T[], query: string): T[] {
  if (!query || products.length === 0) return products;

  const fuse = new Fuse(products, {
    keys: [
      { name: "name",             weight: 0.45 },
      { name: "brand",            weight: 0.20 },
      { name: "tags",             weight: 0.15 },
      { name: "keywords",         weight: 0.12 },
      { name: "shortDescription", weight: 0.08 },
    ],
    includeScore: true,
    threshold: 0.45,       // fairly permissive to not drop valid results
    minMatchCharLength: 2,
    ignoreLocation: true,
    shouldSort: true,
  });

  const results = fuse.search(query);

  if (results.length === 0) return products; // no matches → return original order

  // Return re-ranked results; append anything Fuse dropped at the end
  const ranked = results.map((r) => r.item);
  const rankedSet = new Set(ranked);
  const rest = products.filter((p) => !rankedSet.has(p));
  return [...ranked, ...rest];
}
