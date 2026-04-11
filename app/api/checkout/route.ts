import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import Address from "@/models/Address";
import Order from "@/models/Order";

// Helper for auth validation
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
    const { addressId, paymentMethod = "COD" } = body;

    if (!addressId) {
      return NextResponse.json({ error: "Delivery address is required." }, { status: 400 });
    }

    // 1. Validate Address
    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      return NextResponse.json({ error: "Invalid delivery address." }, { status: 404 });
    }

    // 2. Fetch Active Cart
    const cart = await Cart.findOne({ userId, status: "active" }).populate("items.productId", "name brand stock");

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    // 3. Stock Check & Deductions
    const orderItems = [];
    let subtotal = 0;

    for (let i = 0; i < cart.items.length; i++) {
      const item = cart.items[i];
      // Cast to 'any' to satisfy TypeScript, as .populate() transforms the ObjectId into an object at runtime
      const productInfo: any = item.productId;

      if (!productInfo) {
        return NextResponse.json({ error: "A product in your cart is no longer available." }, { status: 400 });
      }

      if (productInfo.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${productInfo.name}. Available: ${productInfo.stock}` }, { status: 400 });
      }

      // Deduct stock
      await Product.updateOne({ _id: productInfo._id }, { $inc: { stock: -item.quantity } });

      subtotal += (item.price * item.quantity);

      orderItems.push({
        productId: productInfo._id,
        vendorId: item.vendorId,
        name: productInfo.name,
        brand: productInfo.brand,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
        itemStatus: "Pending"
      });
    }

    const deliveryFee = 40; // Fixed hyperlocal delivery fee
    const totalAmount = subtotal + deliveryFee;

    // 4. Create Order
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
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
      totalAmount,
      deliveryFee
    });

    // 5. Clear Cart (or mark as ordered - clearing is cleaner for immediate reuse)
    cart.items = [];
    await cart.save();

    return NextResponse.json({ message: "Order placed successfully!", orderId: newOrder._id }, { status: 201 });

  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Internal server error during checkout." }, { status: 500 });
  }
}
