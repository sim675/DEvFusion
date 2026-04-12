/**
 * Shared types for the chatbot pipeline.
 * Imported by: intentDetector, intentMapper, chat API route, Chatbot component.
 */

export type Intent =
  | "search_product"
  | "track_order"
  | "go_to_cart"
  | "seller_signup"
  | "browse_categories"
  | "unknown";

/** Structured filters extracted from a user message. */
export interface ChatFilters {
  category?: string;
  priceMax?: number;
  priceMin?: number;
  nearby?: boolean;
  minRating?: number;
  sort?: "price_asc" | "price_desc" | "rating_desc";
}

/**
 * The fully parsed result of a user message.
 * Produced by analyzeMessage() and consumed by mapParsedToRoute().
 */
export interface ParsedMessage {
  intent: Intent;
  query?: string;
  filters: ChatFilters;
}

/**
 * Cross-turn conversation context stored on the frontend and
 * sent with every request so the backend can merge refinements.
 */
export interface ConversationContext {
  lastIntent?: Intent;
  lastQuery?: string;
  lastFilters?: ChatFilters;
}
