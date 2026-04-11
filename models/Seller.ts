import mongoose from 'mongoose';

export interface ISeller extends mongoose.Document {
  // Step 1 – Basic Info
  fullName: string;
  phone: string;
  email: string;
  storeName: string;
  password: string;

  // Step 2 – Business Details
  businessType: 'individual' | 'sole_proprietor' | 'shop_owner';
  productCategory: string;
  gstNumber?: string;
  panNumber?: string;

  // Step 3 – Local Store Setup
  shopAddress: string;
  city: string;
  state: string;
  pincode: string;
  preciseLocation?: string;
  serviceRadius: '2km' | '5km' | '10km';
  deliveryType: 'self_delivery' | 'pickup_only' | 'platform_delivery';

  // Step 4 – Store Operations
  inventoryType?: 'ready_stock' | 'made_to_order';
  acceptingOrders: boolean;
  pickupAvailable: boolean;

  // Step 5 – Bank Details
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;

  // Step 6 – Documents (filenames / paths saved after upload)
  govtIdFile?: string;
  businessProofFile?: string;
  bankProofFile?: string;

  // Status
  sellerStatus: 'pending_verification' | 'approved' | 'rejected';

  createdAt: Date;
  updatedAt: Date;
}

const SellerSchema = new mongoose.Schema<ISeller>(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^[\w.-]+@[\w.-]+\.\w{2,}$/, 'Invalid email'],
    },
    storeName: { type: String, required: true, trim: true },
    password: { type: String, required: true },

    businessType: {
      type: String,
      enum: ['individual', 'sole_proprietor', 'shop_owner'],
      required: true,
    },
    productCategory: { type: String, required: true },
    gstNumber: { type: String, default: '' },
    panNumber: { type: String, default: '' },

    shopAddress: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    preciseLocation: { type: String, default: '' },
    serviceRadius: { type: String, enum: ['2km', '5km', '10km'], default: '5km' },
    deliveryType: {
      type: String,
      enum: ['self_delivery', 'pickup_only', 'platform_delivery'],
      default: 'self_delivery',
    },

    inventoryType: {
      type: String,
      enum: ['ready_stock', 'made_to_order', ''],
      default: '',
    },
    acceptingOrders: { type: Boolean, default: true },
    pickupAvailable: { type: Boolean, default: true },

    accountHolderName: { type: String, required: true },
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },

    govtIdFile: { type: String, default: '' },
    businessProofFile: { type: String, default: '' },
    bankProofFile: { type: String, default: '' },

    sellerStatus: {
      type: String,
      enum: ['pending_verification', 'approved', 'rejected'],
      default: 'pending_verification',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Seller ||
  mongoose.model<ISeller>('Seller', SellerSchema);
