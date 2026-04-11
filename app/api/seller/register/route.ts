import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import Seller from '@/models/Seller';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Handle multipart form data (documents)
    const contentType = req.headers.get('content-type') || '';

    let body: Record<string, any> = {};
    const savedFiles: Record<string, string> = {};

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();

      // Extract all text fields
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') {
          body[key] = value;
        } else {
          // It's a File — save it to public/uploads
          const file = value as File;
          if (file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const isVercel = !!process.env.VERCEL;

            if (isVercel) {
              // On Vercel, store as Base64 Data URI
              const base64 = buffer.toString('base64');
              savedFiles[key] = `data:${file.type};base64,${base64}`;
            } else {
              try {
                const uniqueName = Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
                const uploadDir = path.join(process.cwd(), 'public', 'uploads');
                await fs.mkdir(uploadDir, { recursive: true });
                await fs.writeFile(path.join(uploadDir, uniqueName), buffer);
                savedFiles[key] = `/uploads/${uniqueName}`;
              } catch (err) {
                console.warn('Local file save error, falling back to Base64:', err);
                const base64 = buffer.toString('base64');
                savedFiles[key] = `data:${file.type};base64,${base64}`;
              }
            }
          }
        }
      }
    } else {
      body = await req.json();
    }

    const {
      fullName,
      phone,
      email,
      storeName,
      password,
      businessType,
      productCategory,
      gstNumber,
      panNumber,
      shopAddress,
      city,
      state,
      pincode,
      preciseLocation,
      serviceRadius,
      deliveryType,
      inventoryType,
      acceptingOrders,
      pickupAvailable,
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode,
    } = body;

    // Required fields check
    const required = [
      fullName, phone, email, storeName, password,
      businessType, productCategory,
      shopAddress, city, state, pincode,
      accountHolderName, bankName, accountNumber, ifscCode,
    ];
    if (required.some((f) => !f || String(f).trim() === '')) {
      return NextResponse.json(
        { error: 'Missing required fields.' },
        { status: 400 }
      );
    }

    // Password length check
    if (String(password).length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters.' },
        { status: 400 }
      );
    }

    // Duplicate check
    const existing = await Seller.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: 'A seller with this email already exists.' },
        { status: 409 }
      );
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(String(password), 12);

    // Parse preciseLocation for lat, lng if provided
    let coords: [number, number] = [0, 0];
    if (preciseLocation) {
      // Look for two decimal numbers separated by a comma (e.g., "22.5726, 88.3639")
      const match = String(preciseLocation).match(/([+-]?\d+\.\d+)\s*,\s*([+-]?\d+\.\d+)/);
      if (match) {
        // match[1] is latitude, match[2] is longitude.
        // GeoJSON expects [longitude, latitude]
        coords = [parseFloat(match[2]), parseFloat(match[1])];
      }
    }

    const seller = await Seller.create({
      fullName,
      phone,
      email,
      storeName,
      password: hashedPassword,
      businessType,
      productCategory,
      gstNumber: gstNumber || '',
      panNumber: panNumber || '',
      shopAddress,
      city,
      state,
      pincode,
      preciseLocation: preciseLocation || '',
      location: {
        type: 'Point',
        coordinates: coords,
      },
      serviceRadius: serviceRadius || '5km',
      deliveryType: deliveryType || 'self_delivery',
      inventoryType: inventoryType || '',
      acceptingOrders: acceptingOrders === 'true' || acceptingOrders === true,
      pickupAvailable: pickupAvailable === 'true' || pickupAvailable === true,
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode,
      govtIdFile: savedFiles['govtIdFile'] || '',
      businessProofFile: savedFiles['businessProofFile'] || '',
      bankProofFile: savedFiles['bankProofFile'] || '',
      sellerStatus: 'pending_verification',
    });

    return NextResponse.json(
      {
        message: 'Seller registration submitted successfully.',
        sellerId: seller._id,
        sellerStatus: seller.sellerStatus,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Seller registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error during seller registration.' },
      { status: 500 }
    );
  }
}
