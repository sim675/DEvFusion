import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Seller from '@/models/Seller';
import Category from '@/models/Category';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('seller_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET || 'fallback_development_secret_key';
    let payload: { id: string; email: string };
    try {
      payload = jwt.verify(token, secret) as { id: string; email: string };
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 });
    }

    await dbConnect();
    const seller = await Seller.findById(payload.id);
    if (!seller) {
      return NextResponse.json({ error: 'Seller not found.' }, { status: 404 });
    }

    const formData = await req.formData();
    const images: string[] = [];
    const body: Record<string, string> = {};

    // Handle form data including multiple images
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        if (value.size > 0) {
          const buffer = Buffer.from(await value.arrayBuffer());
          const uniqueName = `${Date.now()}-${value.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
          const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
          await fs.mkdir(uploadDir, { recursive: true });
          await fs.writeFile(path.join(uploadDir, uniqueName), buffer);
          images.push(`/uploads/products/${uniqueName}`);
        }
      } else if (typeof value === 'string') {
        body[key] = value;
      }
    }

    const {
      name,
      description,
      price,
      stock,
      categoryName,
      subcategory,
      deliveryTime,
      availability,
      pickupAvailable,
    } = body;

    // Find the category by name to get its ID
    const categoryDoc = await Category.findOne({ name: categoryName });
    if (!categoryDoc) {
      return NextResponse.json({ error: `Category "${categoryName}" not found.` }, { status: 400 });
    }

    // Prepare product location based on seller's location
    const productLocation = {
      city: seller.city,
      state: seller.state,
      pincode: seller.pincode,
      coordinates: {
        type: "Point",
        coordinates: seller.location?.coordinates || [0, 0]
      }
    };

    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      category: categoryName,
      categoryId: categoryDoc._id,
      subcategory,
      images,
      deliveryTime,
      availability: availability === 'true',
      pickupAvailable: pickupAvailable === 'true',
      vendorId: seller._id,
      location: productLocation,
      isActive: true,
    });

    await product.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Product added successfully', 
      product 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Add product error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
