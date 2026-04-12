import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Seller from '@/models/Seller';
import Category from '@/models/Category';
import { promises as fs } from 'fs';
import path from 'path';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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

    // Ensure the product belongs to this seller
    const product = await Product.findOne({ _id: id, vendorId: seller._id });
    if (!product) {
      return NextResponse.json({ error: 'Product not found or access denied.' }, { status: 404 });
    }

    const contentType = req.headers.get('content-type') || '';
    let updateData: Record<string, any> = {};

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const images: string[] = [];
      
      // First, keep existing images that were not removed
      const existingImagesStr = formData.get('existingImages');
      if (existingImagesStr) {
        try {
          const existingImages = JSON.parse(existingImagesStr as string);
          images.push(...existingImages);
        } catch (e) {
          console.error('Error parsing existing images:', e);
        }
      }

      // Handle new image uploads
      for (const [key, value] of formData.entries()) {
        if (key === 'images' && value instanceof File && value.size > 0) {
          const buffer = Buffer.from(await value.arrayBuffer());
          const isVercel = !!process.env.VERCEL;
          
          if (isVercel) {
            const base64 = buffer.toString('base64');
            const dataUri = `data:${value.type};base64,${base64}`;
            images.push(dataUri);
          } else {
            try {
              const uniqueName = `${Date.now()}-${value.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
              const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
              await fs.mkdir(uploadDir, { recursive: true });
              await fs.writeFile(path.join(uploadDir, uniqueName), buffer);
              images.push(`/uploads/products/${uniqueName}`);
            } catch (fsError: any) {
              console.warn(`Local file write failed: ${fsError.message}. Falling back to Base64.`);
              const base64 = buffer.toString('base64');
              const dataUri = `data:${value.type};base64,${base64}`;
              images.push(dataUri);
            }
          }
        } else if (typeof value === 'string' && key !== 'existingImages') {
          try {
            if (['specifications', 'additionalDetails'].includes(key)) {
              updateData[key] = JSON.parse(value);
            } else if (['price', 'discountPrice', 'mrp', 'stock'].includes(key)) {
              const num = parseFloat(value);
              if (!isNaN(num)) updateData[key] = num;
            } else if (['availability', 'pickupAvailable'].includes(key)) {
              updateData[key] = value === 'true';
            } else {
              updateData[key] = value;
            }
          } catch {
            updateData[key] = value;
          }
        }
      }

      if (images.length > 0) {
        updateData.images = images;
        // Handle main image index
        const mainIdx = parseInt(formData.get('mainImageIndex') as string || '0');
        updateData.mainImage = images[mainIdx] || images[0];
      } else if (existingImagesStr) {
        // Case where all images were removed
        updateData.images = [];
        updateData.mainImage = "";
      }
    } else {
      updateData = await req.json();
    }

    // Handle Category ID lookup if category name is provided
    if (updateData.category) {
      const categoryDoc = await Category.findOne({ name: updateData.category });
      if (categoryDoc) {
        updateData.categoryId = categoryDoc._id;
      }
    }

    // Update the product fields
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      console.error('Product update returned null for ID:', id);
      return NextResponse.json({ error: 'Failed to update product document.' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Product updated successfully', 
      product: updatedProduct 
    });
  } catch (error: any) {
    console.error('Update product error:', error);
    // If it's a validation error, return more specific message
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ error: `Validation Error: ${messages.join(', ')}` }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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

    // Ensure the product belongs to this seller
    const product = await Product.findOne({ _id: id, vendorId: seller._id });
    if (!product) {
      return NextResponse.json({ error: 'Product not found or access denied.' }, { status: 404 });
    }

    await Product.findByIdAndDelete(id);

    return NextResponse.json({ 
      success: true, 
      message: 'Product deleted successfully' 
    });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
