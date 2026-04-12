import mongoose, { Schema, Document } from "mongoose";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface ISearchLog extends Document {
  originalQuery: string;       // what the user actually typed
  correctedQuery: string;      // what was searched after correction
  wasCorrection: boolean;      // whether a typo was fixed
  resultCount: number;         // how many results came back
  intent?: string;             // chatbot intent (if via bot)
  createdAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const SearchLogSchema = new Schema<ISearchLog>(
  {
    originalQuery:  { type: String, required: true, lowercase: true, trim: true, index: true },
    correctedQuery: { type: String, required: true, lowercase: true, trim: true },
    wasCorrection:  { type: Boolean, default: false, index: true },
    resultCount:    { type: Number, default: 0 },
    intent:         { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Auto-expire logs older than 180 days (keeps the collection lean)
SearchLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 3600 });

// Compound index for the correction aggregation query
SearchLogSchema.index({ wasCorrection: 1, originalQuery: 1, correctedQuery: 1 });

// ─── Export ───────────────────────────────────────────────────────────────────

export default mongoose.models.SearchLog ||
  mongoose.model<ISearchLog>("SearchLog", SearchLogSchema);
