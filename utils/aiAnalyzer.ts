// Message Analyzer — Zero-API, Pure Rule-Based NLP + Smart Query Correction
//
// Pipeline:
//   1. analyzeMessage()      — extract intent, filters, raw query via NLP + Fuse intent engine
//   2. smartCorrectQuery()   — 3-layer correction: learned cache → Fuse vocab → unchanged
//   3. recordSearch()        — fire-and-forget log so the system learns from this query
//
// The async interface is kept so the chat route needs no changes if AI is re-added later.

import { analyzeMessage } from "@/utils/intentDetector";
import { smartCorrectQuery } from "@/utils/fuzzyQueryCorrector";
import { recordSearch } from "@/utils/searchLearningEngine";
import type { ParsedMessage, ConversationContext } from "@/utils/chatTypes";

export async function aiAnalyzeMessage(
  message: string,
  context?: ConversationContext
): Promise<ParsedMessage> {
  const parsed = analyzeMessage(message, context);

  if (parsed.query) {
    const result = await smartCorrectQuery(parsed.query);
    parsed.query = result.query;

    // Log every chatbot search to the learning engine (fire-and-forget)
    // so the system gradually learns from real usage patterns
    recordSearch(
      Object.keys(result.corrections).join(" ") || parsed.query, // original tokens
      result.query,                                               // corrected tokens
      -1,                                                         // resultCount unknown at this stage
      parsed.intent
    ).catch(() => {}); // never let logging crash parsing
  }

  return parsed;
}
