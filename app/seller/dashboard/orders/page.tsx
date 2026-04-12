"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, MapPin, CheckCircle2, Clock, Truck, ChevronRight, Loader2, Package, Phone, Printer, X, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      const res = await fetch("/api/seller/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (orderId: string, currentStatus: string) => {
    if (currentStatus.startsWith("Return")) {
      alert("Cannot update status while a return is in progress. Please manage returns in the Returns section.");
      return;
    }
    const statusSequence = ["Placed", "Preparing", "Out for Delivery", "Delivered"];
    const currentIndex = statusSequence.indexOf(currentStatus);
    
    if (currentIndex === statusSequence.length - 1) return; // Already delivered

    const nextStatus = statusSequence[currentIndex + 1];

    if (!confirm(`Mark this order as "${nextStatus}"?`)) return;

    try {
        setUpdating(true);
        const res = await fetch(`/api/seller/orders/${orderId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newStatus: nextStatus }),
        });

        if (res.ok) {
            await fetchOrders();
            // Update the selected order if it's open in modal
            if (selectedOrder && selectedOrder._id === orderId) {
                setSelectedOrder({ ...selectedOrder, orderStatus: nextStatus });
            }
        } else {
            const err = await res.json();
            alert(err.error || "Failed to update status");
        }
    } catch (err) {
        alert("An error occurred");
    } finally {
        setUpdating(false);
    }
  };

  const handlePrintInvoice = (orderId: string) => {
    window.open(`/api/orders/${orderId}/invoice`, "_blank");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Placed': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Preparing': return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'Out for Delivery': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Delivered': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Return Requested': return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'Returned': return 'bg-emerald-600/10 text-emerald-500 border-emerald-600/20';
      case 'Return Rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  if (loading) {
      return (
        <div className="h-96 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
          <p className="text-slate-500 font-medium">Fetching orders...</p>
        </div>
      );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Orders Management</h1>
            <p className="text-sm text-slate-400 mt-1">Manage local deliveries and track sequential fulfillment.</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
             <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Active VendorHub System</span>
        </div>
      </div>

      {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.01]">
                <Package className="h-12 w-12 text-slate-700 mb-4" />
                <h3 className="text-xl font-bold text-slate-300">No Orders Found</h3>
                <p className="text-slate-500 max-w-xs text-center mt-2">When items are purchased from your store, they will appear here immediately.</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
              <div className="space-y-4">
                  {orders.map((order) => (
                      <div key={order._id} className="bg-[#0a0714] border border-white/10 rounded-2xl p-5 hover:border-violet-500/30 transition-all shadow-xl group">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                              <div className="flex gap-4">
                                  <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0 border border-violet-500/20 group-hover:bg-violet-500/20 transition-colors">
                                      <ShoppingBag className="h-5 w-5 text-violet-400" />
                                  </div>
                                  <div>
                                      <div className="flex items-center gap-2 mb-1">
                                          <h3 className="font-bold text-white uppercase text-sm tracking-tight">Order #{order._id.substring(order._id.length - 6)}</h3>
                                          <span className="text-xs text-slate-500 font-medium">{new Date(order.createdAt).toLocaleString()}</span>
                                      </div>
                                      <div className="space-y-1">
                                          {order.sellerItems.map((item: any, i: number) => (
                                              <p key={i} className="font-semibold text-slate-200 text-sm">
                                                  {item.quantity}x {item.name}
                                              </p>
                                          ))}
                                      </div>
                                      <div className="flex items-center gap-3 mt-4 text-xs text-slate-400">
                                          <span className="flex items-center gap-1 font-medium text-slate-300"><MapPin className="h-3.5 w-3.5 text-slate-500"/> {order.deliveryAddress.city}, {order.deliveryAddress.pincode}</span>
                                          <span className="text-slate-700 font-bold">•</span>
                                          <span className="bg-white/5 px-2 py-0.5 rounded italic">Buyer: {order.deliveryAddress.name}</span>
                                      </div>
                                  </div>
                              </div>
                              
                              <div className="flex flex-col items-end justify-between min-h-68">
                                  <div className="flex flex-col items-end gap-2">
                                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(order.orderStatus)}`}>
                                        {order.orderStatus === 'Placed' && <Clock className="h-3 w-3" />}
                                        {order.orderStatus === 'Preparing' && <Package className="h-3 w-3" />}
                                        {order.orderStatus === 'Out for Delivery' && <Truck className="h-3 w-3" />}
                                        {order.orderStatus === 'Delivered' && <CheckCircle2 className="h-3 w-3" />}
                                        {order.orderStatus}
                                      </span>
                                      <p className="text-xs text-slate-500 font-medium italic">Payment: {order.paymentStatus}</p>
                                  </div>

                                  <div className="flex items-center gap-3 mt-6 sm:mt-0">
                                      <button 
                                        onClick={() => handlePrintInvoice(order._id)}
                                        className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors border border-white/5"
                                        title="Invoice"
                                      >
                                          <Printer className="h-4 w-4" />
                                      </button>
                                      <button 
                                        onClick={() => setSelectedOrder(order)}
                                        className="px-4 py-2 bg-violet-600/10 text-violet-400 border border-violet-600/20 rounded-xl text-sm font-bold hover:bg-violet-600 hover:text-white transition-all shadow-lg active:scale-95"
                                      >
                                          Track & Manage
                                      </button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Order Tracking Modal */}
      <AnimatePresence>
          {selectedOrder && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedOrder(null)}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                  />
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative w-full max-w-2xl bg-[#0a0714] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
                  >
                      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                          <div>
                              <h2 className="text-xl font-bold flex items-center gap-2 italic uppercase">
                                  <Truck className="h-5 w-5 text-violet-400" />
                                  Fulfillment Tracker
                              </h2>
                              <p className="text-xs text-slate-500 mt-1 uppercase tracking-tighter font-bold">Local Delivery Route Optimization</p>
                          </div>
                          <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-colors">
                              <X className="h-5 w-5" />
                          </button>
                      </div>

                      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Left: Tracker */}
                          <div className="space-y-8 relative">
                              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-white/5"></div>
                              {[
                                  { status: "Placed", desc: "Order received by system" },
                                  { status: "Preparing", desc: "Items being packed at store" },
                                  { status: "Out for Delivery", desc: "Delivery partner assigned" },
                                  { status: "Delivered", desc: "Reached destination" }
                              ].map((step, idx) => {
                                  const statusSequence = ["Placed", "Preparing", "Out for Delivery", "Delivered"];
                                  const currentIdx = statusSequence.indexOf(selectedOrder.orderStatus);
                                  const isDone = idx <= currentIdx;
                                  const isNext = idx === currentIdx + 1;

                                  return (
                                      <div key={idx} className="relative flex items-start gap-6 group">
                                          <div className={`z-10 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                              isDone ? 'bg-violet-600 border-violet-600 text-white' : 
                                              isNext ? 'bg-violet-500/10 border-violet-500/30 text-violet-500' : 'bg-black border-white/10 text-slate-600'
                                          }`}>
                                              {isDone ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-1.5 w-1.5 rounded-full bg-current" />}
                                          </div>
                                          <div>
                                              <h4 className={`text-sm font-bold uppercase tracking-wide ${isDone ? 'text-white' : 'text-slate-500'}`}>{step.status}</h4>
                                              <p className="text-xs text-slate-500 leading-tight mt-1">{step.desc}</p>
                                          </div>
                                      </div>
                                  );
                              })}
                          </div>

                          {/* Right: Info & Actions */}
                          <div className="space-y-6">
                              <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Delivery To</h4>
                                  <div className="space-y-3">
                                      <p className="text-sm font-bold text-white leading-snug">{selectedOrder.deliveryAddress.name}</p>
                                      <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                          {selectedOrder.deliveryAddress.street}, {selectedOrder.deliveryAddress.city}<br/>
                                          {selectedOrder.deliveryAddress.state} - {selectedOrder.deliveryAddress.pincode}
                                      </p>
                                      <div className="pt-2 flex items-center gap-2 text-violet-400 font-bold text-xs">
                                          <Phone className="h-3 w-3" />
                                          {selectedOrder.deliveryAddress.phone || "No phone provided"}
                                      </div>
                                  </div>
                              </div>

                              <div className="space-y-3">
                                  <button 
                                    disabled={updating || selectedOrder.orderStatus === 'Delivered'}
                                    onClick={() => handleUpdateStatus(selectedOrder._id, selectedOrder.orderStatus)}
                                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/10 flex items-center justify-center gap-2 transition-all disabled:opacity-30 active:scale-95"
                                  >
                                      {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Next Phase <ChevronRight className="h-4 w-4" /></>}
                                  </button>
                                  <button 
                                    onClick={() => handlePrintInvoice(selectedOrder._id)}
                                    className="w-full py-4 bg-white/5 border border-white/10 text-slate-300 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                  >
                                      <Download className="h-4 w-4" /> Export Invoice
                                  </button>
                              </div>
                          </div>
                      </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>
    </div>
  );
}
