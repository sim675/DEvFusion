"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, MapPin, PackageSearch, ShoppingCart, ChevronRight } from "lucide-react";

interface RelatedProductsProps {
  category: string;
  currentProductId: string;
  lat?: number;
  lng?: number;
}

export default function RelatedProducts({ category, currentProductId, lat, lng }: RelatedProductsProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelated() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set("category", category);
        if (lat && lng) {
          params.set("lat", lat.toString());
          params.set("lng", lng.toString());
          params.set("radius", "10000"); // 10km radius for related nearby
        }
        params.set("limit", "5");

        const res = await fetch(`/api/products/search?${params.toString()}`);
        const data = await res.json();

        if (res.ok && data.success) {
          // Filter out the current product
          const filtered = data.results.filter((p: any) => p._id !== currentProductId);
          setProducts(filtered);
        }
      } catch (err) {
        console.error("Failed to fetch related products", err);
      } finally {
        setLoading(false);
      }
    }

    if (category) fetchRelated();
  }, [category, currentProductId, lat, lng]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">You might also like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-3xl bg-white/5 animate-pulse border border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white tracking-tight">You might also like</h2>
        <Link href={`/search?category=${category}`} className="text-sm font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
          View All <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((product, idx) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group bg-white/[0.02] border border-white/10 rounded-[2rem] overflow-hidden hover:bg-white/[0.04] transition-all hover:border-violet-500/30"
          >
            <Link href={`/product/${product._id}`} className="block">
              <div className="aspect-square relative overflow-hidden bg-black/40">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PackageSearch className="h-10 w-10 text-slate-700" />
                  </div>
                )}
                {/* Overlay Badge */}
                <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-[10px] font-black text-white uppercase tracking-tighter">
                  {product.category?.name || category}
                </div>
              </div>

              <div className="p-4 space-y-3">
                <h3 className="font-bold text-slate-200 text-sm line-clamp-1 group-hover:text-violet-400 transition-colors">
                  {product.name}
                </h3>
                
                <div className="flex items-center justify-between">
                  <span className="font-black text-white">₹{product.price.toLocaleString()}</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-[10px] font-bold text-slate-400">{product.rating || "4.5"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{product.vendor?.city || "Local"}</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
