import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  productId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    productId: { 
      type: Schema.Types.ObjectId, 
      ref: "Product", 
      required: true,
      index: true 
    },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    userName: {
      type: String,
      required: true
    },
    rating: { 
      type: Number, 
      required: true, 
      min: 1, 
      max: 5 
    },
    comment: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent re-compilation of model in dev mode
export default mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);
