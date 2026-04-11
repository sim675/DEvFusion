import mongoose, { Schema, Document } from "mongoose";

/**
 * Product Interface for TypeScript
 */
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  categoryId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  images: string[];
  tags: string[];
  keywords: string[];
  stock: number;
  rating: number;
  numReviews: number;
  location: {
    city: string;
    state: string;
    pincode: string;
    coordinates: {
      type: "Point";
      coordinates: [number, number]; // [longitude, latitude]
    };
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Product Schema Definition
 */
const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category ID is required"],
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Seller",
      required: [true, "Vendor ID is required"],
    },
    images: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    keywords: {
      type: [String],
      default: [],
      index: true,
    },
    stock: {
      type: Number,
      required: [true, "Stock count is required"],
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    location: {
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number], // [lng, lat]
          required: true,
        },
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// --- INDEXES FOR SEARCH AND HYPERLOCAL ---

// Text index for robust search across name, tags, and keywords
ProductSchema.index(
  {
    name: "text",
    tags: "text",
    keywords: "text",
    description: "text",
  },
  {
    weights: {
      name: 10,
      keywords: 5,
      tags: 3,
      description: 1,
    },
    name: "ProductSearchIndex",
  }
);

// 2dsphere index for proximity-based "near me" searches
ProductSchema.index({ "location.coordinates": "2dsphere" });

// Export the model
export default mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);
