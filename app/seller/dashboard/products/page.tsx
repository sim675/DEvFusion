"use client";

import { useState, useEffect } from "react";
import { Package, Plus, Search, Edit2, Trash2, Filter, Loader2, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Modal states
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    brand: "",
    shortDescription: "",
    fullDescription: "",
    price: "",
    discountPrice: "",
    mrp: "",
    stock: "",
    category: "",
    subcategory: "",
    deliveryTime: "Same Day",
    pickupAvailable: true,
    availability: true,
    specifications: [] as { key: string; value: string }[]
  });

  async function fetchProducts() {
    try {
      setLoading(true);
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

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  }

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/seller/products/${deletingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProducts(products.filter(p => p._id !== deletingId));
        setIsDeleteModalOpen(false);
        setDeletingId(null);
      } else {
        alert("Failed to delete product");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Something went wrong");
    }
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    
    // Convert specifications object to array
    const specsArray = product.specifications 
      ? Object.entries(product.specifications).map(([key, value]) => ({ key, value: value as string }))
      : [];

    setEditFormData({
      name: product.name || "",
      brand: product.brand || "",
      shortDescription: product.shortDescription || "",
      fullDescription: product.fullDescription || "",
      price: product.price ? product.price.toString() : "",
      discountPrice: product.discountPrice ? product.discountPrice.toString() : "",
      mrp: product.mrp ? product.mrp.toString() : "",
      stock: product.stock ? product.stock.toString() : "",
      category: product.category || "",
      subcategory: product.subcategory || "",
      deliveryTime: product.deliveryTime || "Same Day",
      pickupAvailable: product.pickupAvailable ?? true,
      availability: product.availability ?? true,
      specifications: specsArray
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    // Convert specs array back to object
    const specsObj: Record<string, string> = {};
    editFormData.specifications.forEach(s => {
      if (s.key && s.value) specsObj[s.key] = s.value;
    });

    try {
      const res = await fetch(`/api/seller/products/${editingProduct._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editFormData,
          price: parseFloat(editFormData.price),
          stock: parseInt(editFormData.stock),
          discountPrice: editFormData.discountPrice ? parseFloat(editFormData.discountPrice) : undefined,
          mrp: editFormData.mrp ? parseFloat(editFormData.mrp) : undefined,
          specifications: specsObj
        }),
      });
      if (res.ok) {
        await fetchProducts(); // Refresh list
        setIsEditModalOpen(false);
      } else {
        alert("Failed to update product");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Something went wrong");
    }
  };

  const addSpec = () => setEditFormData(prev => ({ ...prev, specifications: [...prev.specifications, { key: "", value: "" }] }));
  const removeSpec = (index: number) => setEditFormData(prev => ({ ...prev, specifications: prev.specifications.filter((_, i) => i !== index) }));
  const handleSpecChange = (index: number, field: "key" | "value", value: string) => {
    const newSpecs = [...editFormData.specifications];
    newSpecs[index][field] = value;
    setEditFormData(prev => ({ ...prev, specifications: newSpecs }));
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Modals */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[#0a0714] border border-white/10 p-8 rounded-3xl max-w-md w-full shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Delete Product?</h3>
                <p className="text-slate-400 mb-8">This action cannot be undone. All product data will be permanently removed.</p>
                <div className="flex gap-4 w-full">
                  <button 
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 transition-all"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="relative bg-[#0a0714] border border-white/10 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <h3 className="text-xl font-bold">Edit Product</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-all">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleUpdate} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Product Name</label>
                    <input 
                      type="text" 
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Brand Name</label>
                    <input 
                      type="text" 
                      value={editFormData.brand}
                      onChange={(e) => setEditFormData({...editFormData, brand: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Category</label>
                    <select 
                      value={editFormData.category}
                      onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                    >
                      <option value="" disabled>Select Category</option>
                      {categories.map((cat: any) => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Subcategory</label>
                    <input 
                      type="text" 
                      value={editFormData.subcategory}
                      onChange={(e) => setEditFormData({...editFormData, subcategory: e.target.value})}
                      placeholder="e.g. Wireless Headphones"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-300">Short Description</label>
                    <input 
                      type="text" 
                      value={editFormData.shortDescription}
                      onChange={(e) => setEditFormData({...editFormData, shortDescription: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-300">Full Description</label>
                    <textarea 
                      rows={4}
                      value={editFormData.fullDescription}
                      onChange={(e) => setEditFormData({...editFormData, fullDescription: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                    />
                  </div>

                  {/* Pricing */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Price (₹)</label>
                    <input 
                      type="number" 
                      value={editFormData.price}
                      onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Discount Price</label>
                      <input 
                        type="number" 
                        value={editFormData.discountPrice}
                        onChange={(e) => setEditFormData({...editFormData, discountPrice: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">MRP</label>
                      <input 
                        type="number" 
                        value={editFormData.mrp}
                        onChange={(e) => setEditFormData({...editFormData, mrp: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Inventory & Delivery */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Stock</label>
                    <input 
                      type="number" 
                      value={editFormData.stock}
                      onChange={(e) => setEditFormData({...editFormData, stock: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Delivery Time</label>
                    <select 
                      value={editFormData.deliveryTime}
                      onChange={(e) => setEditFormData({...editFormData, deliveryTime: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                    >
                      <option value="Instant">Instant (1-2 hours)</option>
                      <option value="Same Day">Same Day</option>
                      <option value="Next Day">Next Day</option>
                    </select>
                  </div>

                  <div className="flex gap-4 md:col-span-2">
                    <button
                      type="button"
                      onClick={() => setEditFormData({...editFormData, availability: !editFormData.availability})}
                      className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                        editFormData.availability 
                          ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" 
                          : "bg-red-500/10 border-red-500/50 text-red-400"
                      }`}
                    >
                      {editFormData.availability ? "In Stock" : "Out of Stock"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditFormData({...editFormData, pickupAvailable: !editFormData.pickupAvailable})}
                      className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                        editFormData.pickupAvailable 
                          ? "bg-blue-500/10 border-blue-500/50 text-blue-400" 
                          : "bg-black/40 border-white/10 text-slate-500"
                      }`}
                    >
                      {editFormData.pickupAvailable ? "Pickup Available" : "No Pickup"}
                    </button>
                  </div>

                  {/* Specifications */}
                  <div className="md:col-span-2 space-y-4 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-300">Specifications</label>
                      <button type="button" onClick={addSpec} className="text-xs font-bold text-violet-400 flex items-center gap-1 bg-violet-400/10 px-2 py-1 rounded-lg">
                        <Plus className="h-3 w-3" /> Add Spec
                      </button>
                    </div>
                    <div className="space-y-2">
                      {editFormData.specifications.map((s, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input 
                            placeholder="Key" value={s.key} onChange={(e) => handleSpecChange(idx, "key", e.target.value)}
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-violet-500/50"
                          />
                          <input 
                            placeholder="Value" value={s.value} onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-violet-500/50"
                          />
                          <button type="button" onClick={() => removeSpec(idx)} className="p-2 text-red-500 bg-red-500/10 rounded-xl">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold shadow-lg shadow-violet-500/20 transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
                        <button 
                          onClick={() => openEditModal(product)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        >
                            <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setDeletingId(product._id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                        >
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
