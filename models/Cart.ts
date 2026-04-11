import mongoose, { Schema, Document } from "mongoose";

export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  image: string;
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  status: "active" | "completed" | "abandoned" | "ordered";
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Seller",
      required: [true, "Vendor ID is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity cannot be less than 1"],
      default: 1,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    image: {
      type: String,
      required: [true, "Product image is required"],
    },
  },
  { _id: true }
);

const CartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    items: {
      type: [CartItemSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["active", "completed", "abandoned", "ordered"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Add compound index for fast retrieval of a user's active cart
CartSchema.index({ userId: 1, status: 1 });

if (mongoose.models.Cart) {
  delete (mongoose.models as any).Cart;
}

export default mongoose.model<ICart>("Cart", CartSchema);
