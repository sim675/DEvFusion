import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Seller from '@/models/Seller';

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
          // It's a File — store the filename
          const file = value as File;
          if (file.size > 0) {
            savedFiles[key] = file.name;
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
      deliveryTimeCommitment,
      openTime,
      closeTime,
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
      fullName, phone, email, storeName,
      businessType, productCategory,
      shopAddress, city, state, pincode, preciseLocation,
      openTime, closeTime,
      inventoryType,
      accountHolderName, bankName, accountNumber, ifscCode,
    ];
    if (required.some((f) => !f || String(f).trim() === '')) {
      return NextResponse.json(
        { error: 'Missing required fields.' },
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

    const seller = await Seller.create({
      fullName,
      phone,
      email,
      storeName,
      businessType,
      productCategory,
      gstNumber: gstNumber || '',
      panNumber: panNumber || '',
      shopAddress,
      city,
      state,
      pincode,
      preciseLocation,
      serviceRadius: serviceRadius || '5km',
      deliveryType: deliveryType || 'self_delivery',
      deliveryTimeCommitment: deliveryTimeCommitment || 'same_day',
      openTime,
      closeTime,
      inventoryType,
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
