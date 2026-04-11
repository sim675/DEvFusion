"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  Store, 
  MapPin, 
  CreditCard,
  AlertCircle,
  Loader2,
  PackageSearch
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null); // productId being updated

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login?redirect=/cart");
          return;
        }
        throw new Error("Failed to load cart");
      }
      const data = await res.json();
      setCart(data.cart);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (productId: string, action: "increase" | "decrease") => {
    setUpdating(productId);
    try {
      const res = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        setCart(data.cart);
      } else {
        alert(data.error || "Failed to update quantity");
      }
    } catch (err: any) {
      alert("Network error while updating cart");
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (productId: string) => {
    setUpdating(productId);
    try {
      const res = await fetch(`/api/cart?productId=${productId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setCart(data.cart);
      } else {
        alert(data.error || "Failed to remove item");
      }
    } catch (err: any) {
      alert("Network error while removing item");
    } finally {
      setUpdating(null);
    }
  };

  const clearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/cart", { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setCart(data.cart);
      }
    } catch (err) {
      alert("Failed to clear cart");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-slate-500 font-medium animate-pulse">Loading your cart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="h-20 w-20 rounded-3xl bg-red-500/10 flex items-center justify-center mb-6">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{error}</h1>
        <button onClick={fetchCart} className="mt-8 px-6 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
  const deliveryFee = items.length > 0 ? 40 : 0; // Fixed dummy delivery fee
  const total = subtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-2 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Continue Shopping
            </Link>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
              Your Cart
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          {items.length > 0 && (
            <button 
              onClick={clearCart}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-full dark:bg-red-500/10 dark:hover:bg-red-500/20 transition-colors self-start sm:self-auto"
            >
              <Trash2 className="h-4 w-4" /> Clear Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          // Empty State
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="h-24 w-24 mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
              <PackageSearch className="h-12 w-12 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Your cart is feeling lonely</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
              Explore our marketplace and discover great products from local vendors around you.
            </p>
            <Link href="/" className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all">
              Start Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map((item: any) => {
                  const productInfo = item.productId || {}; // In case populate failed or product deleted
                  const isItemUpdating = updating === item.productId._id?.toString() || updating === item.productId?.toString() || updating === item.productId;

                  return (
                    <motion.div
                      key={item._id || item.productId._id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, height: 0 }}
                      className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-4 relative overflow-hidden"
                    >
                      {/* Loading Guard Layer */}
                      {isItemUpdating && (
                        <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        </div>
                      )}

                      <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <img 
                          src={item.image || "/placeholder.jpg"} 
                          alt={productInfo.name || "Product"} 
                          className="w-full h-full object-cover" 
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              {productInfo.brand && (
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">
                                  {productInfo.brand}
                                </p>
                              )}
                              <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight line-clamp-2">
                                {productInfo.name || "Unknown Product"}
                              </h3>
                            </div>
                            <span className="font-black text-lg text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                              ₹{item.price.toLocaleString()} each
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 p-1">
                            <button 
                              onClick={() => updateQuantity(item.productId._id || item.productId, "decrease")}
                              disabled={isItemUpdating}
                              className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm hover:text-blue-600 transition-colors disabled:opacity-50"
                            >
                              {item.quantity <= 1 ? <Trash2 className="h-4 w-4 text-red-500" /> : <Minus className="h-4 w-4" />}
                            </button>
                            <span className="w-4 text-center font-bold text-sm text-slate-900 dark:text-white">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.productId._id || item.productId, "increase")}
                              disabled={isItemUpdating || item.quantity >= (productInfo.stock || 10)}
                              className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm hover:text-blue-600 transition-colors disabled:opacity-50"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <button 
                            onClick={() => removeItem(item.productId._id || item.productId)}
                            className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors hidden sm:block"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Order Summary</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Subtotal ({items.length} items)</span>
                    <span className="font-semibold text-slate-900 dark:text-white">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Hyperlocal Delivery</span>
                    <span className="font-semibold text-emerald-500">₹{deliveryFee}</span>
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 dark:text-white">Total Amount</span>
                    <span className="text-2xl font-black text-blue-600 dark:text-white focus:text-blue-500">
                      ₹{total.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 text-right">Inclusive of all taxes</p>
                </div>

                <button 
                  onClick={() => router.push("/checkout")}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <CreditCard className="h-5 w-5" />
                  Proceed to Checkout
                </button>

                <div className="mt-6 flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <MapPin className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <p>Delivering instantly via our localized vendor network.</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <Store className="h-5 w-5 text-violet-500 flex-shrink-0" />
                    <p>Support your local community sellers with every order.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
