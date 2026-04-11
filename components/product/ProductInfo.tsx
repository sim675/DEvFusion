"use client";

import { Star, MapPin, Store, Truck, Clock, ShieldCheck, RefreshCcw, PackageCheck } from "lucide-react";

interface ProductInfoProps {
  product: any;
  seller: any;
  reviewStats: any;
}

export default function ProductInfo({ product, seller, reviewStats }: ProductInfoProps) {
  const discountPercent = product.mrp 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
    : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Brand & Name */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-violet-500/10 text-violet-400 text-xs font-bold rounded-full border border-violet-500/20 uppercase tracking-wider">
            {product.brand}
          </span>
          {product.stock <= 5 && product.stock > 0 && (
            <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-xs font-bold rounded-full border border-amber-500/20 uppercase tracking-wider">
              Only {product.stock} left
            </span>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
          {product.name}
        </h1>
        
        {/* Rating Summary */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(reviewStats.average) 
                      ? "text-yellow-400 fill-yellow-400" 
                      : "text-slate-600 fill-slate-600"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-slate-200">{reviewStats.average}</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <button className="text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors">
            {reviewStats.total} Customer Reviews
          </button>
        </div>
      </div>

      {/* Pricing */}
      <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
        <div className="flex items-baseline gap-4">
          <span className="text-4xl font-black text-white">₹{product.price.toLocaleString()}</span>
          {product.mrp && product.mrp > product.price && (
            <>
              <span className="text-xl text-slate-500 line-through">₹{product.mrp.toLocaleString()}</span>
              <span className="text-lg font-bold text-emerald-500">-{discountPercent}% OFF</span>
            </>
          )}
        </div>
        <p className="text-sm text-slate-400">Inclusive of all taxes</p>
      </div>

      {/* Seller Mini Card */}
      <div className="p-5 rounded-3xl border border-white/10 bg-white/[0.02] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-violet-600/20 flex items-center justify-center border border-violet-500/20">
              <Store className="h-6 w-6 text-violet-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sold by</p>
              <h3 className="font-bold text-white hover:text-violet-400 transition-colors cursor-pointer">{seller.shopName}</h3>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
            seller.acceptingOrders ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
          }`}>
            {seller.acceptingOrders ? "Store Open" : "Closed"}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <MapPin className="h-4 w-4 text-slate-500" />
          <span>{seller.city}, {seller.state}</span>
        </div>
      </div>

      {/* Description & Specs Preview */}
      <div className="space-y-4">
        <p className="text-slate-300 leading-relaxed">
          {product.shortDescription}
        </p>
        
        {/* Quick Highlights */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
            <Clock className="h-5 w-5 text-violet-400" />
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Delivery</p>
              <p className="text-xs font-semibold text-slate-200">{product.deliveryTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
            <PackageCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Status</p>
              <p className="text-xs font-semibold text-slate-200">{product.availability ? "In Stock" : "Out of Stock"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button className="flex-1 px-8 py-4 bg-white text-black font-black rounded-2xl hover:bg-slate-200 transition-all active:scale-95">
          ADD TO CART
        </button>
        <button className="flex-1 px-8 py-4 bg-violet-600 text-white font-black rounded-2xl hover:bg-violet-700 shadow-xl shadow-violet-500/20 transition-all active:scale-95">
          BUY NOW
        </button>
      </div>

      {/* Policies */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5">
        <div className="flex flex-col items-center gap-2 text-center">
          <ShieldCheck className="h-5 w-5 text-slate-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Warranty</span>
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <RefreshCcw className="h-5 w-5 text-slate-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">7 Day Return</span>
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <Truck className="h-5 w-5 text-slate-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Local Shipping</span>
        </div>
      </div>
    </div>
  );
}
