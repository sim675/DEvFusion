"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Package, Loader2, RefreshCcw, ArrowRight, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function InventoryAlertsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLowStock();
  }, []);

  async function fetchLowStock() {
    try {
      setLoading(true);
      const res = await fetch("/api/seller/inventory-alerts");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
        <p className="text-slate-500 font-medium">Scanning inventory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            Inventory Alerts
          </h1>
          <p className="text-sm text-slate-400 mt-1">Products listed here have less than 5 units in stock.</p>
        </div>
        <button 
          onClick={fetchLowStock}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium"
        >
          <RefreshCcw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {products.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-white/5 rounded-[2.5rem] bg-emerald-500/[0.02]"
        >
          <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
            <Package className="h-8 w-8 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-white">Stock Levels Healthy!</h3>
          <p className="text-slate-500 max-w-sm text-center mt-2">All your products currently have sufficient inventory levels. Great job!</p>
          <Link href="/seller/dashboard/products" className="mt-6 text-sm text-violet-400 hover:underline flex items-center gap-1 font-bold">
            View All Products <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {products.map((product) => (
              <motion.div
                key={product._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0a0714] border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:border-red-500/30 transition-all flex flex-col group"
              >
                <div className="h-40 relative">
                  <img 
                    src={product.mainImage || product.images?.[0] || "/placeholder-product.png"} 
                    alt={product.name} 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded-md shadow-lg border border-red-500">
                    Low Stock: {product.stock}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-1">{product.categoryName || "Product"}</p>
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-slate-400 line-clamp-2 flex-1 mb-4">{product.shortDescription || "Immediate restock required to prevent out-of-stock status."}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Current Count</p>
                        <p className={`text-xl font-black ${product.stock === 0 ? "text-red-500" : "text-amber-500"}`}>{product.stock}</p>
                    </div>
                    <Link 
                      href={`/seller/dashboard/products?edit=${product._id}`}
                      className="px-4 py-2 rounded-xl bg-violet-600 text-xs font-black uppercase tracking-widest hover:bg-violet-700 transition-all shadow-lg active:scale-95"
                    >
                      Update Stock
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Recommended Action */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <ShoppingCart className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                  <h4 className="font-bold text-white">Bulk Inventory Update</h4>
                  <p className="text-sm text-slate-500">Need to update multiple products at once? Use our bulk editor.</p>
              </div>
          </div>
          <Link href="/seller/dashboard/products" className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all uppercase tracking-widest">
              Go to Products
          </Link>
      </div>
    </div>
  );
}
