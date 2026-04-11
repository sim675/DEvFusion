"use client";

import { useState, useEffect } from "react";
import { Package, Plus, Search, Edit2, Trash2, Filter, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/seller/products");
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products Management</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your storefront inventory and product details.</p>
        </div>
        <Link 
          href="/seller/add-product"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium transition-all shadow-lg shadow-violet-500/20 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      <div className="bg-[#0a0714] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row items-center gap-3 bg-white/[0.02]">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search products by name or category..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-violet-500/50 text-white transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-white/10 bg-black/40 rounded-lg hover:bg-white/5 text-sm font-medium w-full sm:w-auto">
            <Filter className="h-4 w-4" /> Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/[0.03] text-slate-400 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-semibold w-1/3">Product Info</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Stock</th>
                <th className="px-6 py-4 font-semibold">Delivery Time</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-500 mx-auto" />
                    <p className="text-slate-500 mt-4 font-medium">Loading products...</p>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
                      <Package className="h-8 w-8 text-slate-500" />
                    </div>
                    <p className="text-slate-300 font-semibold text-lg">No products found</p>
                    <p className="text-slate-500 mt-1 max-w-xs mx-auto">Get started by adding your first product to your shop.</p>
                    <Link 
                      href="/seller/add-product"
                      className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-medium transition-all"
                    >
                      <Plus className="h-4 w-4" /> Add Product
                    </Link>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <motion.tr 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    key={product._id} 
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10 overflow-hidden">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <Package className="h-6 w-6 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-200">{product.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200">₹{product.price}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${product.stock <= 10 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-slate-500/10 text-slate-300 border border-slate-500/20'}`}>
                        {product.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-medium">{product.deliveryTime}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${product.availability ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${product.availability ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        {product.availability ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                            <Edit2 className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all">
                            <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
