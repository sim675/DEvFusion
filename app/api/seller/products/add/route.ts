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
    const body: Record<string, any> = {};

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
        // Handle nested objects and arrays sent as JSON strings
        try {
          if (key === 'specifications' || key === 'additionalDetails') {
            body[key] = JSON.parse(value);
          } else {
            body[key] = value;
          }
        } catch {
          body[key] = value;
        }
      }
    }

    const {
      name,
      brand,
      shortDescription,
      fullDescription,
      price,
      discountPrice,
      mrp,
      stock,
      categoryName,
      subcategory,
      deliveryTime,
      availability,
      pickupAvailable,
      specifications,
      additionalDetails,
      mainImageIndex,
    } = body;

    // Validation
    if (!name || !brand || !shortDescription || !fullDescription || !price || !categoryName || !stock) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    if (images.length === 0) {
      return NextResponse.json({ error: 'At least one image is required.' }, { status: 400 });
    }

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

    // Determine main image
    const mainIdx = parseInt(mainImageIndex || '0');
    const mainImage = images[mainIdx] || images[0];

    const product = new Product({
      name,
      brand,
      shortDescription,
      fullDescription,
      price: parseFloat(price),
      discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
      mrp: mrp ? parseFloat(mrp) : undefined,
      stock: parseInt(stock),
      category: categoryName,
      categoryId: categoryDoc._id,
      subcategory,
      images,
      mainImage,
      deliveryTime,
      availability: availability === 'true',
      pickupAvailable: pickupAvailable === 'true',
      specifications: specifications || {},
      additionalDetails: additionalDetails || {},
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
