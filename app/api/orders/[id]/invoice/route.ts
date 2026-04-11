import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Seller from "@/models/Seller";
import User from "@/models/User";

async function verifyAuth(req: NextRequest) {
  const buyerToken = req.cookies.get("auth_token")?.value;
  const sellerToken = req.cookies.get("seller_token")?.value;
  const secret = process.env.JWT_SECRET || "fallback_development_secret_key";
  
  if (buyerToken) {
    try { 
      const decoded = jwt.verify(buyerToken, secret) as any;
      return { id: decoded.id, role: 'buyer' }; 
    } catch(e) {}
  }
  if (sellerToken) {
    try { 
      const decoded = jwt.verify(sellerToken, secret) as any;
      return { id: decoded.id, role: 'seller' }; 
    } catch(e) {}
  }
  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const order: any = await Order.findById(id).populate("userId", "name email");
    
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Permissions check
    if (auth.role === 'buyer' && order.userId._id.toString() !== auth.id) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    
    // For seller, we just check if any item belongs to them
    if (auth.role === 'seller') {
        const hasItem = order.items.some((item: any) => item.vendorId.toString() === auth.id);
        if (!hasItem) return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch seller details (assuming unique seller for invoice or just use the first item's vendor)
    // In a multi-vendor order, you might need multiple invoices, but we'll fetch details for the prime seller
    const seller = await Seller.findById(order.items[0].vendorId).select("storeName email shopAddress phone gstNumber");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${order._id}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 0; padding: 40px; background: #f9f9f9; }
          .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; background: #fff; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); border-radius: 8px; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
          .header h1 { margin: 0; color: #4F46E5; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
          .details { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .details div { width: 45%; }
          .details h3 { font-size: 12px; text-transform: uppercase; color: #999; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          .details p { margin: 5px 0; font-size: 14px; line-height: 1.5; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          table th { background: #f8f8f8; text-align: left; padding: 12px; font-size: 13px; text-transform: uppercase; color: #666; border-bottom: 2px solid #eee; }
          table td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
          .totals { text-align: right; }
          .totals p { margin: 10px 0; font-size: 14px; }
          .totals .grand-total { font-size: 20px; font-weight: bold; color: #4F46E5; }
          .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
          @media print {
            body { background: none; padding: 0; }
            .invoice-box { border: none; box-shadow: none; width: 100%; max-width: none; }
            .no-print { display: none; }
          }
          .print-btn { background: #4F46E5; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align: center;">
            <button class="print-btn" onclick="window.print()">Print This Invoice</button>
        </div>
        <div class="invoice-box">
          <div class="header">
            <div>
              <h1>VendorHub</h1>
              <p style="font-size: 12px; color: #666;">Hyperlocal Marketplace Solution</p>
            </div>
            <div style="text-align: right;">
              <p style="font-weight: bold; margin: 0;">INVOICE</p>
              <p style="font-size: 13px; color: #666; margin: 5px 0;">#ORD-${order._id.toString().substring(order._id.toString().length-8).toUpperCase()}</p>
              <p style="font-size: 13px; color: #666; margin: 0;">Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div class="details">
            <div>
              <h3>From (Seller)</h3>
              <p><strong>${seller?.storeName || 'VendorHub Seller'}</strong></p>
              <p>${seller?.shopAddress || 'No address provided'}</p>
              <p>Phone: ${seller?.phone || 'N/A'}</p>
              ${seller?.gstNumber ? `<p>GST: ${seller.gstNumber}</p>` : ''}
            </div>
            <div style="text-align: right;">
              <h3>To (Buyer)</h3>
              <p><strong>${order.deliveryAddress.name}</strong></p>
              <p>${order.deliveryAddress.street}, ${order.deliveryAddress.city}</p>
              <p>${order.deliveryAddress.state} - ${order.deliveryAddress.pincode}</p>
              <p>Phone: ${order.deliveryAddress.phone || 'N/A'}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Product Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map((item: any) => `
                <tr>
                  <td>
                    <strong>${item.name}</strong><br/>
                    <span style="font-size: 11px; color: #888;">${item.brand || ''}</span>
                  </td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">₹${item.price.toLocaleString()}</td>
                  <td style="text-align: right;">₹${(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <p>Subtotal: ₹${(order.totalAmount - order.deliveryFee).toLocaleString()}</p>
            <p>Delivery Fee: ₹${order.deliveryFee.toLocaleString()}</p>
            <p class="grand-total">Total Amount: ₹${order.totalAmount.toLocaleString()}</p>
          </div>

          <div class="footer">
            <p>Thank you for shopping on VendorHub!</p>
            <p>This is a computer-generated invoice and doesn't require a physical signature.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(html, {
        headers: { "Content-Type": "text/html" }
    });

  } catch (err: any) {
    console.error("Invoice API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
