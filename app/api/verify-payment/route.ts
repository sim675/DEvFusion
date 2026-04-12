import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import Address from "@/models/Address";
import Order from "@/models/Order";
import crypto from "crypto";
import { getUserFromAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = user.id;

    await dbConnect();
    const body = await req.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, addressId } = body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !addressId) {
       return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || "dummy";

    // Verify signature
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Payment verification failed: Invalid signature" }, { status: 400 });
    }

    // 1. Process Order since payment is valid
    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      return NextResponse.json({ error: "Invalid delivery address" }, { status: 404 });
    }

    const cart = await Cart.findOne({ userId, status: "active" }).populate("items.productId", "name brand stock");
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const orderItems = [];
    let subtotal = 0;

    for (let i = 0; i < cart.items.length; i++) {
        const item = cart.items[i];
        const productInfo: any = item.productId;
        
        // Deduct stock atomically and ensure it doesn't go below 0
        const updatedProduct = await Product.findByIdAndUpdate(
            productInfo._id,
            { $inc: { stock: -item.quantity } },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return NextResponse.json({ error: "Failed to update stock for " + productInfo.name }, { status: 500 });
        }

        subtotal += (item.price * item.quantity);

        orderItems.push({
            productId: productInfo._id,
            vendorId: item.vendorId,
            name: productInfo.name,
            brand: productInfo.brand,
            quantity: item.quantity,
            price: item.price,
            image: item.image
        });
    }

    const deliveryFee = 40;
    const totalAmount = subtotal + deliveryFee;

    const newOrder = await Order.create({
      userId,
      items: orderItems,
      deliveryAddress: {
        name: address.name,
        street: address.street,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        phone: address.phone
      },
      paymentMethod: "Online",
      paymentStatus: "Paid",
      orderStatus: "Placed",
      totalAmount,
      deliveryFee
    });

    cart.items = [];
    await cart.save();

    return NextResponse.json({ message: "Payment verified successfully", orderId: newOrder._id }, { status: 201 });

  } catch (err: any) {
    console.error("Payment verify error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
