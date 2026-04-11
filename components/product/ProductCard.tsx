"use client";

import Link from "next/link";
import { ShoppingBag, ExternalLink } from "lucide-react";

interface ProductCardProps {
  product: any;
}

const formatPrice = (price: number) => `₹${price.toLocaleString("en-IN")}`;

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/product/${product._id}`}
      className="group flex flex-col h-full overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-100 to-blue-50 dark:from-slate-800 dark:to-slate-900">
        {product.mainImage || product.images?.[0] ? (
          <img
            src={product.mainImage || product.images?.[0]}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingBag className="h-10 w-10 text-slate-300 dark:text-slate-700" />
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            {product.category?.name || "General"}
          </p>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${product.stock > 0 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300" : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"}`}>
            {product.stock > 0 ? "In Stock" : "Out of Stock"}
          </span>
        </div>
        <h3 className="mt-2 line-clamp-1 text-sm font-semibold text-slate-900 dark:text-white">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
          {product.shortDescription || "View this product for full details."}
        </p>
        <div className="mt-auto pt-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{formatPrice(product.price)}</p>
              {(product.mrp ?? product.price) > product.price && (
                <p className="text-xs text-slate-400 line-through">{formatPrice(product.mrp)}</p>
              )}
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
              Open <ExternalLink className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="truncate">{product.vendor?.storeName || "VendorHub Seller"}</span>
            <span>{product.deliveryTime || "Same Day"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
