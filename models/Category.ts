import mongoose, { Schema, Document } from "mongoose";

/**
 * Category Interface for TypeScript
 */
export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Category Schema Definition
 */
const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Category slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    icon: {
      type: String, // Stores the name of the icon (e.g., 'Shirt') for frontend mapping
      default: "",
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

// Export the model
export default mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);
