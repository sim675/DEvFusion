import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Cart from "@/models/Cart";
import { getUserFromAuth } from "@/lib/auth";

// GET: Fetch the user's active cart
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromAuth(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = user.id;
    await dbConnect();

    const cart = await Cart.findOne({ userId, status: "active" }).populate("items.productId", "name brand stock");
    if (!cart) {
      return NextResponse.json({ cart: { items: [], status: "active" } }, { status: 200 });
    }

    return NextResponse.json({ cart }, { status: 200 });
  } catch (error: any) {
    console.error("Cart GET error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// POST: Add an item to the cart or handle quantity updates
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromAuth(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = user.id;

    await dbConnect();

    const body = await req.json();
    const { productId, vendorId, quantity, price, image } = body;

    if (!productId || !vendorId || price === undefined || !image) {
      return NextResponse.json({ error: "Missing required item fields." }, { status: 400 });
    }

    let cart = await Cart.findOne({ userId, status: "active" });
    if (!cart) {
      cart = new Cart({ userId, items: [], status: "active" });
    }

    const itemIndex = cart.items.findIndex(
      (item: any) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += (quantity || 1);
    } else {
      cart.items.push({ productId, vendorId, quantity: quantity || 1, price, image });
    }

    await cart.save();
    await cart.populate("items.productId", "name brand stock");

    return NextResponse.json({ message: "Cart updated successfully", cart }, { status: 200 });
  } catch (error: any) {
    console.error("Cart POST error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// PUT: Specifically update the quantity of a cart item
export async function PUT(req: NextRequest) {
  try {
    const userId = await getUserFromAuth(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const body = await req.json();
    const { productId, action, quantity } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
    }

    let cart = await Cart.findOne({ userId, status: "active" });
    if (!cart) {
      return NextResponse.json({ error: "Cart not found." }, { status: 404 });
    }

    const itemIndex = cart.items.findIndex(
      (item: any) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      if (action === "increase") {
        cart.items[itemIndex].quantity += 1;
      } else if (action === "decrease") {
        cart.items[itemIndex].quantity -= 1;
        if (cart.items[itemIndex].quantity <= 0) {
          cart.items.splice(itemIndex, 1);
        }
      } else if (quantity !== undefined) {
        if (quantity <= 0) {
          cart.items.splice(itemIndex, 1);
        } else {
          cart.items[itemIndex].quantity = quantity;
        }
      }
      
      await cart.save();
      await cart.populate("items.productId", "name brand stock");
      return NextResponse.json({ message: "Cart item updated", cart }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Item not found in cart." }, { status: 404 });
    }
  } catch (error: any) {
    console.error("Cart PUT error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// DELETE: Remove an item entirely or clear the cart
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserFromAuth(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    let cart = await Cart.findOne({ userId, status: "active" });
    if (!cart) {
      return NextResponse.json({ error: "Cart not found." }, { status: 404 });
    }

    if (productId) {
      // Remove a specific item
      cart.items = cart.items.filter(
        (item: any) => item.productId.toString() !== productId
      );
      await cart.save();
      await cart.populate("items.productId", "name brand stock");
      return NextResponse.json({ message: "Item removed from cart", cart }, { status: 200 });
    } else {
      // Clear the entire cart if no productId is provided
      cart.items = [];
      await cart.save();
      return NextResponse.json({ message: "Cart cleared", cart }, { status: 200 });
    }
  } catch (error: any) {
    console.error("Cart DELETE error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
