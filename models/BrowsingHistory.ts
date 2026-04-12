import mongoose, { Schema, Document } from "mongoose";

export interface IBrowsingHistory extends Document {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  category: string;
  subcategory: string;
  viewedAt: Date;
}

const BrowsingHistorySchema = new Schema<IBrowsingHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    category: { type: String, required: true },
    subcategory: { type: String, default: "" },
    viewedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Create an index for quick lookup by user and sorted by date
BrowsingHistorySchema.index({ userId: 1, viewedAt: -1 });
// Unique constraint to avoid duplicate views for the same product in a short time if needed, 
// but here we might just want to update the viewedAt timestamp.
BrowsingHistorySchema.index({ userId: 1, productId: 1 }, { unique: true });

if (mongoose.models.BrowsingHistory) {
  delete (mongoose.models as any).BrowsingHistory;
}

export default mongoose.model<IBrowsingHistory>("BrowsingHistory", BrowsingHistorySchema);
