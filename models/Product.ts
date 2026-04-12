import mongoose, { Schema, Document } from "mongoose";

/**
 * Product Interface for TypeScript
 */
export interface IProduct extends Document {
  name: string;
  brand: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  discountPrice?: number;
  mrp?: number;
  images: string[];
  mainImage: string;
  stock: number;
  availability: boolean;
  category: string;
  categoryId: mongoose.Types.ObjectId;
  subcategory: string;
  deliveryTime: "Instant" | "Same Day" | "Next Day";
  pickupAvailable: boolean;
  specifications: Record<string, string>;
  additionalDetails?: {
    warrantyInfo?: string;
    returnPolicy?: string;
    boxContents?: string;
  };
  vendorId: mongoose.Types.ObjectId; // Seller link
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
  rating: number;
  numReviews: number;
  tags: string[];
  keywords: string[];
  orderCount: number;
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
    brand: {
      type: String,
      required: [true, "Brand name is required"],
      trim: true,
    },
    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      trim: true,
    },
    fullDescription: {
      type: String,
      required: [true, "Full description is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    discountPrice: {
      type: Number,
      min: [0, "Discount price cannot be negative"],
    },
    mrp: {
      type: Number,
      min: [0, "MRP cannot be negative"],
    },
    images: {
      type: [String],
      default: [],
    },
    mainImage: {
      type: String,
      default: "",
    },
    stock: {
      type: Number,
      required: [true, "Stock count is required"],
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    availability: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      required: [true, "Category name is required"],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category ID is required"],
    },
    subcategory: {
      type: String,
      default: "",
    },
    deliveryTime: {
      type: String,
      enum: ["Instant", "Same Day", "Next Day"],
      default: "Same Day",
    },
    pickupAvailable: {
      type: Boolean,
      default: false,
    },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    additionalDetails: {
      warrantyInfo: String,
      returnPolicy: String,
      boxContents: String,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Seller",
      required: [true, "Vendor ID is required"],
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
    orderCount: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// --- INDEXES FOR SEARCH AND HYPERLOCAL ---

// Text index for robust search across name, brand, tags, and keywords
ProductSchema.index(
  {
    name: "text",
    brand: "text",
    category: "text",
    tags: "text",
    keywords: "text",
    shortDescription: "text",
  },
  {
    weights: {
      name: 10,
      brand: 8,
      category: 6,
      keywords: 5,
      tags: 3,
      shortDescription: 2,
    },
    name: "ProductSearchIndex",
  }
);

// 2dsphere index for proximity-based "near me" searches
ProductSchema.index({ "location.coordinates": "2dsphere" });

// Export the model
if (mongoose.models.Product) {
  delete (mongoose.models as any).Product;
}
export default mongoose.model<IProduct>("Product", ProductSchema);
