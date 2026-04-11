import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import Cart from "@/models/Cart";
import Address from "@/models/Address";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_dummy",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy",
});

async function getUserFromAuth(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return null;
  try {
    const secret = process.env.JWT_SECRET || "fallback_development_secret_key";
    const decoded: any = jwt.verify(token, secret);
    return decoded.id;
  } catch (error) {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Please login to checkout." }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { addressId } = body;

    if (!addressId) {
      return NextResponse.json({ error: "Delivery address is required." }, { status: 400 });
    }

    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      return NextResponse.json({ error: "Invalid delivery address." }, { status: 404 });
    }

    const cart = await Cart.findOne({ userId, status: "active" }).populate("items.productId", "name stock");
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    let subtotal = 0;
    for (let i = 0; i < cart.items.length; i++) {
        const item = cart.items[i];
        const productInfo: any = item.productId;
        if (!productInfo) return NextResponse.json({ error: "A product is unavailable." }, { status: 400 });
        if (productInfo.stock < item.quantity) {
          return NextResponse.json({ error: `Insufficient stock for ${productInfo.name}` }, { status: 400 });
        }
        subtotal += (item.price * item.quantity);
    }
    
    const deliveryFee = 40;
    const totalAmount = subtotal + deliveryFee;

    const options = {
      amount: totalAmount * 100, // Amount is in currency subunits (paise)
      currency: "INR",
      receipt: `rcpt_${userId.substring(0, 8)}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency
    }, { status: 201 });

  } catch (err: any) {
    console.error("Create Razorpay order error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
