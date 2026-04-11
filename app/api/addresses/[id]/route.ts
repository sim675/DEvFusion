import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import Address from "@/models/Address";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Get the auth token from cookies
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized. Please login to update an address." },
        { status: 401 }
      );
    }

    // 2. Verify the JWT Token
    const secret = process.env.JWT_SECRET || "fallback_development_secret_key";
    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid or expired session. Please login again." },
        { status: 401 }
      );
    }

    const userId = decoded.id;

    // 3. Connect to the database
    await dbConnect();

    // 4. Find the address and ensure it belongs to the user
    const address = await Address.findOne({ _id: id, userId });

    if (!address) {
      return NextResponse.json(
        { error: "Address not found or unauthorized access." },
        { status: 404 }
      );
    }

    // 5. Parse updated fields from request body
    const body = await req.json();
    const { name, phone, street, city, state, pincode, isDefault } = body;

    // 6. Update fields if provided
    if (name !== undefined) address.name = name;
    if (phone !== undefined) address.phone = phone;
    if (street !== undefined) address.street = street;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (pincode !== undefined) address.pincode = pincode;
    if (isDefault !== undefined) address.isDefault = isDefault;

    // 7. Save the updated address
    // The pre-save hook in the model will handle isDefault logic automatically
    await address.save();

    return NextResponse.json(
      { message: "Address updated successfully", address },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating address:", error);
    return NextResponse.json(
      { error: "Internal server error while updating address." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Get the auth token from cookies
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized. Please login to delete an address." },
        { status: 401 }
      );
    }

    // 2. Verify the JWT Token
    const secret = process.env.JWT_SECRET || "fallback_development_secret_key";
    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid or expired session. Please login again." },
        { status: 401 }
      );
    }

    const userId = decoded.id;

    // 3. Connect to the database
    await dbConnect();

    // 4. Find and delete the address ensuring it belongs to the user
    const result = await Address.deleteOne({ _id: id, userId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Address not found or unauthorized access." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Address deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting address:", error);
    return NextResponse.json(
      { error: "Internal server error while deleting address." },
      { status: 500 }
    );
  }
}

