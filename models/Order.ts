import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  name: string;
  brand: string;
  quantity: number;
  price: number;
  image: string;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  deliveryAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    phone?: string;
  };
  paymentMethod: "COD" | "Online";
  paymentStatus: "Pending" | "Paid" | "Failed";
  orderStatus: "Pending" | "Preparing" | "Out for Delivery" | "Delivered" | "Cancelled";
  totalAmount: number;
  deliveryFee: number;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "Seller", required: true },
    name: { type: String, required: true },
    brand: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [OrderItemSchema], required: true },
    deliveryAddress: {
      name: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      phone: { type: String },
    },
    paymentMethod: { type: String, enum: ["COD", "Online"], default: "COD" },
    paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
    orderStatus: {
      type: String,
      enum: ["Pending", "Preparing", "Placed", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Pending"
    },
    totalAmount: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.Order) {
  delete (mongoose.models as any).Order;
}

export default mongoose.model<IOrder>("Order", OrderSchema);
