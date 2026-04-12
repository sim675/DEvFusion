// GET  /api/search/learn  — returns all trusted corrections (for client-side localStorage sync)
// POST /api/search/learn  — logs a search event (called fire-and-forget from the search page)

import { NextRequest, NextResponse } from "next/server";
import {
  initLearningCache,
  getAllLearnedCorrections,
  recordSearch,
} from "@/utils/searchLearningEngine";

// ─── GET — ship corrections to the browser ────────────────────────────────────
export async function GET() {
  try {
    await initLearningCache();
    const corrections = getAllLearnedCorrections();
    return NextResponse.json(
      { corrections },
      {
        status: 200,
        headers: {
          // Cache for 5 min in the browser; stale-while-revalidate another 5 min
          "Cache-Control": "public, max-age=300, stale-while-revalidate=300",
        },
      }
    );
  } catch {
    return NextResponse.json({ corrections: {} }, { status: 200 });
  }
}

// ─── POST — log a search event ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { originalQuery, correctedQuery, resultCount, intent } = body;

    if (!originalQuery || typeof originalQuery !== "string") {
      return NextResponse.json({ ok: false, error: "originalQuery required" }, { status: 400 });
    }

    await initLearningCache();
    await recordSearch(
      originalQuery,
      correctedQuery ?? originalQuery,  // if no correction, same as original
      typeof resultCount === "number" ? resultCount : 0,
      intent
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    // Never block the caller — learning is best-effort
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
