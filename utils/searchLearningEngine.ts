// Search Learning Engine — server-side in-memory cache backed by MongoDB
//
// Lifecycle:
//   1. On first use, reads all stored corrections from MongoDB into a Map.
//   2. Every CACHE_TTL ms the cache auto-refreshes from DB (picks up new entries).
//   3. When a new correction is made, the Map is updated immediately AND
//      a fire-and-forget write goes to MongoDB — so the next server restart
//      still knows about it.
//
// Key design choices:
//   - "Trusted" threshold: a correction must appear ≥ TRUST_THRESHOLD times
//     before it's treated as authoritative (otherwise a one-off typo could
//     permanently override a real word).
//   - Confidence score: grows with frequency, capped at 0.99.
//   - Only server-side — never shipped to the client bundle.

import dbConnect from "@/lib/mongodb";

// ─────────────────────────────────────────────────────────────────────────────

interface LearnedEntry {
  corrected:  string;
  count:      number;
  confidence: number; // 0–1; higher = more trustworthy
}

// How many times a correction must be seen before we fully trust it
const TRUST_THRESHOLD = 1;

// Cache TTL: refresh from DB every 5 minutes
const CACHE_TTL_MS = 5 * 60 * 1000;

// Module-level singletons — survive for the lifetime of the Node process
const correctionCache = new Map<string, LearnedEntry>();
const popularTermsSet = new Set<string>();  // successful terms, never corrected

let cacheInitialized = false;
let lastRefreshedAt  = 0;

// ─── Cache management ─────────────────────────────────────────────────────────

function calcConfidence(count: number): number {
  // Grows toward 0.99 as count increases: 1→0.55, 2→0.65, 5→0.85, 10→0.97
  return Math.min(0.99, 0.5 + count * 0.1);
}

export async function initLearningCache(): Promise<void> {
  const now = Date.now();
  if (cacheInitialized && now - lastRefreshedAt < CACHE_TTL_MS) return;

  try {
    await dbConnect();
    // dynamic import avoids circular-dep issues at module load time
    const SearchLog = (await import("@/models/SearchLog")).default;

    // Build correction map: group by original → pick most-frequent corrected form
    const corrections = await SearchLog.aggregate([
      { $match: { wasCorrection: true } },
      {
        $group: {
          _id:      "$originalQuery",
          corrected: { $first: "$correctedQuery" },
          count:    { $sum: 1 },
        },
      },
      { $match: { count: { $gte: TRUST_THRESHOLD } } },
    ]);

    correctionCache.clear();
    for (const entry of corrections) {
      if (entry._id && entry.corrected) {
        correctionCache.set(entry._id, {
          corrected:  entry.corrected,
          count:      entry.count,
          confidence: calcConfidence(entry.count),
        });
      }
    }

    // Also gather successful (uncorrected) search terms
    const popular = await SearchLog.aggregate([
      { $match: { wasCorrection: false, resultCount: { $gt: 0 } } },
      { $group: { _id: "$originalQuery", count: { $sum: 1 } } },
      { $match: { count: { $gte: 2 } } },
      { $limit: 300 },
    ]);

    popularTermsSet.clear();
    for (const t of popular) popularTermsSet.add(t._id);

    cacheInitialized = true;
    lastRefreshedAt  = now;

    console.log(
      `[LearningEngine] Cache loaded: ${correctionCache.size} corrections, ${popularTermsSet.size} popular terms`
    );
  } catch (err) {
    console.warn("[LearningEngine] Cache init failed:", err);
  }
}

// ─── Public read API ──────────────────────────────────────────────────────────

/**
 * Returns the learned correction for a word, or null if none / below threshold.
 */
export function getLearnedCorrection(word: string): string | null {
  const key   = word.toLowerCase().trim();
  const entry = correctionCache.get(key);
  if (!entry || entry.confidence < 0.5) return null;
  return entry.corrected;
}

/**
 * Returns all learned corrections as a plain object (used by the API endpoint
 * to ship corrections to the client for localStorage caching).
 */
export function getAllLearnedCorrections(): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [original, entry] of correctionCache.entries()) {
    if (entry.confidence >= 0.5) result[original] = entry.corrected;
  }
  return result;
}

/**
 * Returns the set of known-good popular search terms (useful for query validation).
 */
export function getPopularTerms(): Set<string> {
  return popularTermsSet;
}

// ─── Public write API ─────────────────────────────────────────────────────────

/**
 * Records a search event.
 * Updates the in-memory cache immediately; persists to MongoDB asynchronously.
 *
 * @param originalQuery   - The raw extracted / user-typed query
 * @param correctedQuery  - The query after correction (same as original if no fix)
 * @param resultCount     - Number of results returned by MongoDB
 * @param intent          - Chatbot intent, if applicable
 */
export async function recordSearch(
  originalQuery:  string,
  correctedQuery: string,
  resultCount:    number,
  intent?:        string
): Promise<void> {
  const original  = originalQuery.toLowerCase().trim();
  const corrected = correctedQuery.toLowerCase().trim();
  const isCorrection = original !== corrected;

  // Update in-memory cache immediately (no DB round-trip needed for fast lookup)
  if (isCorrection) {
    const existing = correctionCache.get(original);
    const newCount = (existing?.count ?? 0) + 1;
    correctionCache.set(original, {
      corrected,
      count:      newCount,
      confidence: calcConfidence(newCount),
    });
  }

  if (!isCorrection && resultCount > 0) {
    popularTermsSet.add(original);
  }

  // Persist to MongoDB (fire-and-forget)
  setImmediate(async () => {
    try {
      await dbConnect();
      const SearchLog = (await import("@/models/SearchLog")).default;
      await SearchLog.create({
        originalQuery:  original,
        correctedQuery: corrected,
        wasCorrection:  isCorrection,
        resultCount,
        intent,
      });
    } catch (err) {
      // Never crash the request — learning is best-effort
      console.warn("[LearningEngine] Persist failed:", err);
    }
  });
}
