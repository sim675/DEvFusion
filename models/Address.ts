import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAddress extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  phone?: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    phone: { type: String, required: false },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Middleware to ensure only ONE address per user is set as Default
addressSchema.pre("save", async function () {
  if (this.isModified("isDefault") && this.isDefault === true) {
    // Dynamically retrieve the model to avoid initialization issues
    const AddressModel = mongoose.model<IAddress>("Address");
    await AddressModel.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
});

// Force refresh the model in development to pick up middleware changes
if (mongoose.models.Address) {
    delete (mongoose.models as any).Address;
}

const Address = mongoose.model<IAddress>("Address", addressSchema);

export default Address;
