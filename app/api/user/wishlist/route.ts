import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;

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

    const user = await User.findById(payload.id).select('wishlist');

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const wishlistIds = (user.wishlist || []).map((id: any) => id.toString());
    const objectIds = wishlistIds
      .filter((id: string) => mongoose.Types.ObjectId.isValid(id))
      .map((id: string) => new mongoose.Types.ObjectId(id));

    if (objectIds.length === 0) {
      return NextResponse.json({ wishlist: [] });
    }

    const wishlist = await Product.aggregate([
      {
        $match: {
          _id: { $in: objectIds },
          isActive: true,
        },
      },
      {
        $lookup: {
          from: 'sellers',
          localField: 'vendorId',
          foreignField: '_id',
          as: 'vendorDoc',
        },
      },
      { $unwind: { path: '$vendorDoc', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          'vendorDoc.sellerStatus': 'approved',
          'vendorDoc.acceptingOrders': true,
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'categoryDoc',
          pipeline: [{ $project: { name: 1, slug: 1, icon: 1 } }],
        },
      },
      { $unwind: { path: '$categoryDoc', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          wishlistOrder: {
            $indexOfArray: [wishlistIds, { $toString: '$_id' }],
          },
        },
      },
      { $sort: { wishlistOrder: 1 } },
      {
        $project: {
          name: 1,
          brand: 1,
          shortDescription: 1,
          fullDescription: 1,
          price: 1,
          discountPrice: 1,
          mrp: 1,
          images: 1,
          mainImage: 1,
          stock: 1,
          rating: 1,
          numReviews: 1,
          deliveryTime: 1,
          vendorId: 1,
          category: '$categoryDoc',
          vendor: {
            storeName: '$vendorDoc.storeName',
            city: '$vendorDoc.city',
            state: '$vendorDoc.state',
          },
        },
      },
    ]);

    return NextResponse.json({ wishlist });
  } catch (error: unknown) {
    console.error('Wishlist fetch error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;

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

    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(payload.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const productIdStr = String(productId);
    const index = user.wishlist.findIndex((id: any) => id.toString() === productIdStr);
    let message = "";

    if (index === -1) {
      user.wishlist.push(productId);
      message = "Added to wishlist";
    } else {
      user.wishlist.splice(index, 1);
      message = "Removed from wishlist";
    }

    await user.save();

    return NextResponse.json({ message, wishlist: user.wishlist });
  } catch (error: unknown) {
    console.error('Wishlist toggle error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
