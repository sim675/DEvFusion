import type { NextRequest } from "next/server";
import { aiAnalyzeMessage } from "@/utils/aiAnalyzer";
import { mapParsedToRoute } from "@/utils/intentMapper";
import type {
  ChatFilters,
  ConversationContext,
  Intent,
} from "@/utils/chatTypes";

// ─── Request / Response Types ─────────────────────────────────────────────────

interface ChatRequestBody {
  message: string;
  context?: ConversationContext;
}

type ChatSuccessResponse = {
  success: true;
  intent: Intent;
  route: string | null;
  reply: string;
  filters: ChatFilters;
  context: ConversationContext; // updated context for frontend to store
};

type ChatErrorResponse = {
  success: false;
  error: string;
};

// ─── Reply Generator ──────────────────────────────────────────────────────────

/**
 * Builds a human-readable, context-aware reply based on the parsed result.
 */
function buildReply(
  intent: Intent,
  route: string | null,
  query?: string,
  filters?: ChatFilters
): string {
  if (!route) {
    return "Sorry, I didn't understand that. Try asking me to find a product, track your order, or open your cart!";
  }

  switch (intent) {
    case "search_product": {
      const parts: string[] = [];
      if (query) parts.push(`"${query}"`);
      if (filters?.priceMax) parts.push(`under ₹${filters.priceMax}`);
      if (filters?.nearby) parts.push("near you");
      if (filters?.category) parts.push(`in ${filters.category}`);

      return parts.length > 0
        ? `Got it! Showing you ${parts.join(", ")}...`
        : "Here are all products for you!";
    }
    case "track_order":
      return "Taking you to your orders!";
    case "go_to_cart":
      return "Opening your cart!";
    case "seller_signup":
      return "Let's get you started as a seller!";
    case "browse_categories":
      return "Here are all product categories!";
    default:
      return "Redirecting you...";
  }
}

// ─── POST /api/chat ───────────────────────────────────────────────────────────

/**
 * Accepts a user message + optional conversation context.
 * Uses OpenAI (with rule-based fallback) to parse intent, query, and filters.
 * Returns a structured response with an updated context for multi-turn support.
 *
 * @example
 * POST /api/chat
 * Body: { "message": "cheap shoes near me", "context": {} }
 * →    { success: true, intent: "search_product", route: "/products?search=shoes&priceMax=500&nearby=true", reply: "Got it! Showing you \"shoes\" under ₹500 near you...", filters: {...}, context: {...} }
 */
export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body: ChatRequestBody = await req.json();
    const raw: unknown = body?.message;

    // ── Validate ────────────────────────────────────────────────────────────
    if (!raw || typeof raw !== "string") {
      const err: ChatErrorResponse = {
        success: false,
        error: "Invalid request: 'message' must be a non-empty string.",
      };
      return Response.json(err, { status: 400 });
    }

    const message = raw.trim();
    if (!message) {
      const err: ChatErrorResponse = {
        success: false,
        error: "Invalid request: 'message' cannot be blank.",
      };
      return Response.json(err, { status: 400 });
    }

    const context: ConversationContext = body.context ?? {};

    // ── AI analysis (with rule-based fallback) ──────────────────────────────
    const parsed = await aiAnalyzeMessage(message, context);
    const { intent, query, filters } = parsed;

    // ── Route mapping ───────────────────────────────────────────────────────
    const route = mapParsedToRoute(parsed);

    // ── Reply ───────────────────────────────────────────────────────────────
    const reply = buildReply(intent, route, query, filters);

    // ── Updated context (sent back to frontend for next turn) ───────────────
    const updatedContext: ConversationContext = {
      lastIntent: intent,
      lastQuery: query,
      lastFilters: filters,
    };

    const success: ChatSuccessResponse = {
      success: true,
      intent,
      route,
      reply,
      filters,
      context: updatedContext,
    };

    return Response.json(success);
  } catch (err) {
    console.error("[/api/chat] Unhandled error:", err);
    const error: ChatErrorResponse = {
      success: false,
      error: "Something went wrong. Please try again.",
    };
    return Response.json(error, { status: 500 });
  }
}
