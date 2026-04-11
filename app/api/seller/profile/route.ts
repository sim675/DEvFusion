import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Seller from '@/models/Seller';
import Product from '@/models/Product';

export async function GET(req: NextRequest) {
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

    // Fetch the entire seller profile minus the password
    const seller = await Seller.findById(payload.id).select('-password');

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found.' }, { status: 404 });
    }

    return NextResponse.json(seller);
  } catch (error: unknown) {
    console.error('Seller profile error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
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
    
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const { acceptingOrders, serviceRadius, lat, lng, fulfillment } = body;
    const updateData: any = {};
    
    if (typeof acceptingOrders === 'boolean') {
      updateData.acceptingOrders = acceptingOrders;
    }
    
    if (serviceRadius) {
      // Expecting something like "5km", or "5". Ensure format if needed. 
      // The DB enum is '2km', '5km', '10km'.
      updateData.serviceRadius = serviceRadius.includes('km') ? serviceRadius : `${serviceRadius}km`;
    }
    
    if (typeof lat === 'number' && typeof lng === 'number') {
      updateData.location = {
        type: 'Point',
        coordinates: [lng, lat]
      };
      
      // Cascade the updated location to all products owned by this seller
      await Product.updateMany(
        { vendorId: payload.id },
        { $set: { "location.coordinates.coordinates": [lng, lat] } }
      );
    }
    
    // Delivery Types Mapping if provided (since frontend has fulfillment object)
    if (fulfillment) {
       const deliveryTypes = [];
       if (fulfillment.selfDelivery) deliveryTypes.push('self_delivery');
       if (fulfillment.pickup) deliveryTypes.push('pickup_only');
       if (fulfillment.platform) deliveryTypes.push('platform_delivery');
       
       if (deliveryTypes.length > 0) {
          // This maps correctly to DB logic conceptually although seller schema uses deliveryType single string or pickupAvailable bool
          // Update: The Seller model uses `deliveryType` (String) and `pickupAvailable` (Boolean)
          if (fulfillment.pickup) updateData.pickupAvailable = true;
          else updateData.pickupAvailable = false;
          
          if (fulfillment.selfDelivery) updateData.deliveryType = 'self_delivery';
          else if (fulfillment.platform) updateData.deliveryType = 'platform_delivery';
       }
    }

    const updatedSeller = await Seller.findByIdAndUpdate(
      payload.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedSeller) {
      return NextResponse.json({ error: 'Seller not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, seller: updatedSeller });
  } catch (error: any) {
    console.error('Seller profile update error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
