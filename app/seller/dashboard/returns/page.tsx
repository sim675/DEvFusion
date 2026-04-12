"use client";

import { useState, useEffect } from "react";
import { RotateCcw, MapPin, CheckCircle2, Clock, Truck, ChevronRight, Loader2, Package, Phone, Printer, X, Download, AlertCircle, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [updating, setUpdating] = useState(false);
  const [adminComment, setAdminComment] = useState("");

  useEffect(() => {
    fetchReturns();
  }, []);

  async function fetchReturns() {
    try {
      setLoading(true);
      const res = await fetch("/api/seller/returns");
      if (res.ok) {
        const data = await res.json();
        setReturns(data);
      }
    } catch (err) {
      console.error("Failed to fetch returns", err);
    } finally {
      setLoading(false);
    }
  }

  const handleReturnAction = async (orderId: string, action: "approve" | "reject") => {
    if (!confirm(`Are you sure you want to ${action} this return?`)) return;

    try {
      setUpdating(true);
      const res = await fetch(`/api/seller/returns/${orderId}/action`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, adminComment }),
      });

      if (res.ok) {
        await fetchReturns();
        setSelectedReturn(null);
        setAdminComment("");
      } else {
        const err = await res.json();
        alert(err.error || `Failed to ${action} return`);
      }
    } catch (err) {
      alert("An error occurred");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Return Requested': return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'Returned': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Return Rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
        <p className="text-slate-500 font-medium">Fetching return requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Returns Management</h1>
          <p className="text-sm text-slate-400 mt-1">Manage product returns and process refunds.</p>
        </div>
      </div>

      {returns.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.01]">
          <RotateCcw className="h-12 w-12 text-slate-700 mb-4" />
          <h3 className="text-xl font-bold text-slate-300">No Returns Found</h3>
          <p className="text-slate-500 max-w-xs text-center mt-2">When buyers request returns for your products, they will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {returns.map((order) => (
            <div key={order._id} className="bg-[#0a0714] border border-white/10 rounded-2xl p-5 hover:border-violet-500/30 transition-all shadow-xl group">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0 border border-violet-500/20">
                    <RotateCcw className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white uppercase text-sm tracking-tight">Return Request #{order._id.substring(order._id.length - 6)}</h3>
                      <span className="text-xs text-slate-500 font-medium">{new Date(order.returnDetails?.requestDate).toLocaleString()}</span>
                    </div>
                    <div className="space-y-1">
                      {order.sellerItems.map((item: any, i: number) => (
                        <p key={i} className="font-semibold text-slate-200 text-sm">
                          {item.quantity}x {item.name}
                        </p>
                      ))}
                    </div>
                    <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-1">Reason for Return</p>
                      <p className="text-sm text-slate-300 font-medium">{order.returnDetails?.reason}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between min-h-68">
                  <div className="flex flex-col items-end gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(order.orderStatus)}`}>
                      <RotateCcw className="h-3 w-3" />
                      {order.orderStatus}
                    </span>
                    <p className="text-xs text-slate-500 font-medium italic">Refund: {order.refundDetails?.status}</p>
                  </div>

                  <div className="flex items-center gap-3 mt-6 sm:mt-0">
                    <button 
                      onClick={() => setSelectedReturn(order)}
                      className="px-6 py-2 bg-violet-600/10 text-violet-400 border border-violet-600/20 rounded-xl text-sm font-bold hover:bg-violet-600 hover:text-white transition-all shadow-lg"
                    >
                      Review Return
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Return Review Modal */}
      <AnimatePresence>
        {selectedReturn && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedReturn(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#0a0714] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <h2 className="text-xl font-bold flex items-center gap-2 italic uppercase">
                  <RotateCcw className="h-5 w-5 text-violet-400" />
                  Review Return Request
                </h2>
                <button onClick={() => setSelectedReturn(null)} className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Side: Images & Reason */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Return Images</h4>
                      {selectedReturn.returnDetails?.images?.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {selectedReturn.returnDetails.images.map((img: string, idx: number) => (
                            <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-white/10 bg-white/5">
                              <img src={img} alt="Return Evidence" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="aspect-video rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center bg-white/[0.01]">
                          <ImageIcon className="h-6 w-6 text-slate-700 mb-2" />
                          <p className="text-[10px] text-slate-500 uppercase font-bold">No images provided</p>
                        </div>
                      )}
                    </div>

                    <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Reason for Return</h4>
                      <p className="text-sm text-white font-bold mb-3">{selectedReturn.returnDetails?.reason}</p>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Description</h4>
                      <p className="text-xs text-slate-400 leading-relaxed italic">{selectedReturn.returnDetails?.description || "No description provided."}</p>
                    </div>
                  </div>

                  {/* Right Side: Order Info & Actions */}
                  <div className="space-y-6">
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Order Summary</h4>
                      <div className="space-y-3">
                        {selectedReturn.sellerItems.map((item: any, i: number) => (
                          <div key={i} className="flex gap-3 items-center">
                            <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white line-clamp-1">{item.name}</p>
                              <p className="text-[10px] text-slate-500">Qty: {item.quantity} • ₹{item.price.toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase">Total Refund</span>
                        <span className="text-lg font-black text-emerald-400 italic">₹{selectedReturn.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    {selectedReturn.orderStatus === "Return Requested" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Admin Comment (Optional)</label>
                          <textarea 
                            value={adminComment}
                            onChange={(e) => setAdminComment(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-violet-500/50 resize-none"
                            placeholder="Reason for approval or rejection..."
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            disabled={updating}
                            onClick={() => handleReturnAction(selectedReturn._id, "approve")}
                            className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all disabled:opacity-30 active:scale-95 flex items-center justify-center gap-2"
                          >
                            {updating ? <Loader2 className="h-3 w-3 animate-spin" /> : <><CheckCircle2 className="h-3 w-3" /> Approve</>}
                          </button>
                          <button 
                            disabled={updating}
                            onClick={() => handleReturnAction(selectedReturn._id, "reject")}
                            className="py-3 bg-red-600 hover:bg-red-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all disabled:opacity-30 active:scale-95 flex items-center justify-center gap-2"
                          >
                            {updating ? <Loader2 className="h-3 w-3 animate-spin" /> : <><X className="h-3 w-3" /> Reject</>}
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {(selectedReturn.orderStatus === "Returned" || selectedReturn.orderStatus === "Return Rejected") && (
                       <div className={`p-4 rounded-xl border text-center ${
                          selectedReturn.orderStatus === "Returned" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                       }`}>
                          <p className="text-xs font-bold uppercase tracking-widest mb-1">{selectedReturn.orderStatus}</p>
                          <p className="text-[10px] italic">{selectedReturn.returnDetails?.adminComment || "No comment provided."}</p>
                       </div>
                    )}
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
