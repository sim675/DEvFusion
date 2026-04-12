"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Package, Clock, Truck, CheckCircle2, AlertCircle, ShoppingBag, Printer, RotateCcw, X } from "lucide-react";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchOrders() {
    try {
      const res = await fetch("/api/orders");
      if (res.status === 401) {
        router.push("/login?redirect=/orders");
        return;
      }
      if (!res.ok) throw new Error("Failed to load your orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, [router]);

  // Helpers
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
      case "Placed": return "text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20";
      case "Preparing": return "text-blue-500 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20";
      case "Out for Delivery": return "text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20";
      case "Delivered": return "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20";
      case "Cancelled": return "text-red-500 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20";
      case "Return Requested": return "text-violet-500 bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/20";
      case "Returned": return "text-emerald-600 bg-emerald-50 dark:bg-emerald-600/10 border-emerald-200 dark:border-emerald-600/20";
      case "Return Rejected": return "text-slate-500 bg-slate-50 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20";
      default: return "text-slate-500 bg-slate-50 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
      case "Placed": return <Clock className="h-4 w-4" />;
      case "Preparing": return <Package className="h-4 w-4" />;
      case "Out for Delivery": return <Truck className="h-4 w-4" />;
      case "Delivered": return <CheckCircle2 className="h-4 w-4" />;
      case "Cancelled": return <AlertCircle className="h-4 w-4" />;
      case "Return Requested": return <RotateCcw className="h-4 w-4" />;
      case "Returned": return <CheckCircle2 className="h-4 w-4" />;
      case "Return Rejected": return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{error}</h1>
        <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/" className="text-sm font-semibold text-slate-500 hover:text-blue-600 mb-2 inline-block transition-colors">
              « Back to Home
            </Link>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 mt-1">
              <ShoppingBag className="h-8 w-8 text-blue-600" /> My Orders
            </h1>
          </div>
        </div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="h-24 w-24 mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
              <Package className="h-12 w-12 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">No orders yet</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
              When you place orders on our hyperlocal marketplace, they will appear here so you can track their status.
            </p>
            <Link href="/" className="inline-block px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
              Start Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                {/* Header */}
                <div className="bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row justify-between p-6 border-b border-slate-200 dark:border-slate-800 gap-4">
                  <div className="flex flex-wrap gap-x-8 gap-y-4">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Order Placed</p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          year: 'numeric', month: 'long', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total</p>
                      <p className="font-semibold text-slate-900 dark:text-white">₹{order.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className={`px-4 py-1.5 rounded-full border flex items-center gap-2 text-sm font-bold ${getStatusColor(order.orderStatus)}`}>
                      {getStatusIcon(order.orderStatus)}
                      {order.orderStatus}
                    </div>
                  </div>
                </div>

                  {/* Items */}
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Order ID: {order._id}</p>
                      
                      {/* Visual Status Tracker */}
                      <div className="flex items-center gap-2">
                        {order.orderStatus === "Cancelled" ? (
                           <span className="text-xs font-bold text-red-500 uppercase">Order Cancelled</span>
                        ) : order.orderStatus.startsWith("Return") ? (
                           <Link 
                             href={`/orders/${order._id}/return`}
                             className="text-[10px] font-black uppercase text-violet-600 tracking-tighter hover:underline"
                           >
                             View Return Status »
                           </Link>
                        ) : (
                          <div className="flex items-center gap-2">
                            {["Placed", "Preparing", "Out for Delivery", "Delivered"].map((step, sIdx) => {
                              const statusSequence = ["Placed", "Preparing", "Out for Delivery", "Delivered"];
                              const currentIdx = statusSequence.indexOf(order.orderStatus);
                              const isDone = sIdx <= currentIdx;
                              return (
                                <div key={sIdx} className="flex items-center">
                                  <div className={`h-2.5 w-2.5 rounded-full ${isDone ? 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]' : 'bg-slate-200 dark:bg-slate-800'}`} />
                                  {sIdx < 3 && <div className={`h-[2px] w-6 sm:w-8 ${isDone && sIdx < currentIdx ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`} />}
                                </div>
                              );
                            })}
                            <span className="ml-2 text-[10px] font-black uppercase text-blue-600 tracking-tighter">
                              Live Tracking
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-4 items-start p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50">
                          <div className="h-16 w-16 bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 flex-shrink-0">
                            <img src={item.image || "/placeholder.jpg"} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link href={`/product/${item.productId}`} className="font-bold text-slate-900 dark:text-white hover:text-blue-600 line-clamp-1 transition-colors">
                              {item.name}
                            </Link>
                            {item.brand && <p className="text-xs font-bold text-slate-400 uppercase mt-0.5">{item.brand}</p>}
                            <p className="text-sm text-slate-500 mt-1">
                              Qty: {item.quantity} • <span className="font-semibold text-slate-700 dark:text-slate-300">₹{item.price.toLocaleString()}</span>
                            </p>
                          </div>
                          <div className="flex flex-col gap-2 items-end">
                            <button 
                              onClick={() => window.open(`/api/orders/${order._id}/invoice`, "_blank")}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-white hover:bg-violet-600 px-3 py-1.5 rounded-lg border border-violet-100 dark:border-violet-900 transition-all"
                            >
                              <Printer className="h-3.5 w-3.5" /> Invoice
                            </button>
                            {order.orderStatus === "Delivered" && (
                              <Link 
                                href={`/orders/${order._id}/return`}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-white hover:bg-amber-600 px-3 py-1.5 rounded-lg border border-amber-100 dark:border-amber-900 transition-all"
                              >
                                <RotateCcw className="h-3.5 w-3.5" /> Return
                              </Link>
                            )}
                            {order.orderStatus.startsWith("Return") && (
                              <Link 
                                href={`/orders/${order._id}/return`}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-white hover:bg-violet-600 px-3 py-1.5 rounded-lg border border-violet-100 dark:border-violet-900 transition-all"
                              >
                                <RotateCcw className="h-3.5 w-3.5" /> Track Return
                              </Link>
                            )}
                            <Link 
                                href={`/product/${item.productId}#reviews`}
                                className="text-xs font-bold text-blue-600 hover:text-white hover:bg-blue-600 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900 transition-all text-center"
                            >
                                Write Review
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>



                    {/* Delivery Address Snippet */}
                    <div className="mt-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/50 text-sm">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Truck className="h-4 w-4" /> Ship-to Details
                      </p>
                      <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{order.deliveryAddress.name}</p>
                            <p className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                {order.deliveryAddress.street}, {order.deliveryAddress.city}<br/>
                                {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                            </p>
                          </div>
                          <div className="text-right">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Payment Method</p>
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{order.paymentMethod}</p>
                          </div>
                      </div>
                    </div>
                  </div>

              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
