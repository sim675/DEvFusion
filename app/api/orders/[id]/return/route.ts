import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { getUserFromAuth } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getUserFromAuth(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const order = await Order.findOne({ _id: id, userId: user.id });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    if (order.orderStatus !== "Delivered") {
      return NextResponse.json({ error: "Only delivered orders can be returned" }, { status: 400 });
    }

    const formData = await req.formData();
    const reason = formData.get("reason") as string;
    const description = formData.get("description") as string;
    const images: string[] = [];

    // Handle image uploads
    const imageFiles = formData.getAll("images") as File[];
    for (const file of imageFiles) {
      if (file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const isVercel = !!process.env.VERCEL;
        
        if (isVercel) {
          const base64 = buffer.toString("base64");
          const dataUri = `data:${file.type};base64,${base64}`;
          images.push(dataUri);
        } else {
          try {
            const uniqueName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "")}`;
            const uploadDir = path.join(process.cwd(), "public", "uploads", "returns");
            await fs.mkdir(uploadDir, { recursive: true });
            await fs.writeFile(path.join(uploadDir, uniqueName), buffer);
            images.push(`/uploads/returns/${uniqueName}`);
          } catch (fsError: any) {
            console.warn(`Local file write failed: ${fsError.message}. Falling back to Base64.`);
            const base64 = buffer.toString("base64");
            const dataUri = `data:${file.type};base64,${base64}`;
            images.push(dataUri);
          }
        }
      }
    }

    order.orderStatus = "Return Requested";
    order.returnDetails = {
      reason,
      images,
      description,
      requestDate: new Date(),
      status: "Pending",
    };
    order.refundDetails = {
      status: "Pending",
      amount: order.totalAmount,
      updatedAt: new Date(),
    };

    await order.save();

    return NextResponse.json({ success: true, message: "Return request submitted" }, { status: 200 });
  } catch (error: any) {
    console.error("Order Return POST error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
