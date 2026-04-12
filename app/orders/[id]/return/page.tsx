"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  RotateCcw, 
  X, 
  Upload, 
  Loader2, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  Truck,
  AlertCircle,
  Package
} from "lucide-react";

export default function ReturnOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = use(params);
  const router = useRouter();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submittingReturn, setSubmittingReturn] = useState(false);
  
  const [formData, setFormData] = useState({
    reason: "",
    description: "",
    images: [] as File[],
    previews: [] as string[],
  });

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          const found = data.orders.find((o: any) => o._id === orderId);
          if (found) {
            setOrder(found);
            // Pre-fill if already return requested
            if (found.returnDetails) {
              setFormData(prev => ({
                ...prev,
                reason: found.returnDetails.reason,
                description: found.returnDetails.description,
                previews: found.returnDetails.images || []
              }));
            }
          }
        }
      } catch (err) {
        console.error("Fetch order error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newFiles],
        previews: [...prev.previews, ...newFiles.map(file => URL.createObjectURL(file))]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      const isNew = index >= (order?.returnDetails?.images?.length || 0);
      const newImages = [...prev.images];
      if (isNew) {
        const actualIdx = index - (order?.returnDetails?.images?.length || 0);
        newImages.splice(actualIdx, 1);
      }
      
      return {
        ...prev,
        images: newImages,
        previews: prev.previews.filter((_, i) => i !== index)
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingReturn(true);
      const data = new FormData();
      data.append("reason", formData.reason);
      data.append("description", formData.description);
      formData.images.forEach(img => data.append("images", img));

      const res = await fetch(`/api/orders/${orderId}/return`, {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        router.refresh();
        window.location.reload(); // Refresh to show new status
      } else {
        const err = await res.json();
        alert(err.error || "Failed to submit return request");
      }
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setSubmittingReturn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Order Not Found</h1>
        <Link href="/orders" className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700">
          Back to Orders
        </Link>
      </div>
    );
  }

  const isReturned = order.orderStatus.startsWith("Return");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link href="/orders" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to My Orders
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <RotateCcw className="h-7 w-7 text-blue-600" /> 
                {isReturned ? "Return Status" : "Request Return"}
              </h1>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                Order #{order._id.substring(order._id.length - 6)}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              {isReturned 
                ? "Track the progress of your return request below." 
                : "Please provide the details below to initiate your return request."}
            </p>
          </div>

          <div className="p-8">
            {isReturned ? (
              <div className="space-y-10">
                {/* Status Tracker */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/50">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Current Status</span>
                      <span className={`text-lg font-black uppercase tracking-tighter ${
                        order.orderStatus === "Returned" ? "text-emerald-500" : 
                        order.orderStatus === "Return Rejected" ? "text-red-500" : "text-violet-600"
                      }`}>
                        {order.orderStatus}
                      </span>
                    </div>
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                        order.orderStatus === "Returned" ? "bg-emerald-500/10 text-emerald-500" : 
                        order.orderStatus === "Return Rejected" ? "bg-red-500/10 text-red-500" : "bg-violet-600/10 text-violet-600"
                      }`}>
                      <RotateCcw className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {["Return Requested", "Returned"].map((step, sIdx) => {
                      const statusSequence = ["Return Requested", "Returned"];
                      const currentIdx = statusSequence.indexOf(order.orderStatus);
                      const isDone = sIdx <= currentIdx || order.orderStatus === "Return Rejected";
                      const isSuccess = order.orderStatus === "Returned" && sIdx === 1;
                      const isFailed = order.orderStatus === "Return Rejected";

                      return (
                        <div key={sIdx} className="flex-1 flex flex-col gap-2">
                          <div className={`h-2 rounded-full transition-all ${
                            isDone 
                              ? isFailed ? "bg-red-500" : isSuccess ? "bg-emerald-500" : "bg-violet-600" 
                              : "bg-slate-200 dark:bg-slate-800"
                          }`} />
                          <span className={`text-[10px] font-black uppercase tracking-widest text-center ${
                            isDone ? "text-slate-900 dark:text-white" : "text-slate-400"
                          }`}>{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Refund Details */}
                {order.refundDetails && (
                  <div className="bg-violet-600 text-white p-8 rounded-[2rem] shadow-lg shadow-violet-600/20 relative overflow-hidden">
                    <div className="relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-4 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" /> Refund Information
                      </p>
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-3xl font-black italic tracking-tighter">₹{order.refundDetails.amount.toLocaleString()}</p>
                          <p className="text-xs font-bold opacity-80 mt-1">Status: {order.refundDetails.status}</p>
                        </div>
                        {order.refundDetails.transactionId && (
                          <div className="text-right">
                            <p className="text-[10px] font-black uppercase opacity-60">Transaction ID</p>
                            <p className="text-xs font-mono font-bold">{order.refundDetails.transactionId}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Decorative Circle */}
                    <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-white/10 rounded-full blur-3xl" />
                  </div>
                )}

                {/* Return Summary */}
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-600" /> Return Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-bold text-slate-500">Reason</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">{order.returnDetails.reason}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-bold text-slate-500">Description</span>
                      <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 italic">
                        "{order.returnDetails.description || "No additional details provided."}"
                      </p>
                    </div>
                    {order.returnDetails.images?.length > 0 && (
                      <div className="space-y-3">
                        <span className="text-sm font-bold text-slate-500">Evidence Uploaded</span>
                        <div className="grid grid-cols-4 gap-3">
                          {order.returnDetails.images.map((img: string, idx: number) => (
                            <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                              <img src={img} alt="Evidence" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {order.returnDetails.adminComment && (
                  <div className={`p-6 rounded-3xl border flex items-start gap-4 ${
                    order.returnDetails.status === "Approved" 
                      ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/50" 
                      : "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-800/50"
                  }`}>
                    <AlertCircle className={`h-5 w-5 mt-0.5 ${
                      order.returnDetails.status === "Approved" ? "text-emerald-600" : "text-red-600"
                    }`} />
                    <div>
                      <p className={`text-sm font-black uppercase tracking-widest mb-1 ${
                        order.returnDetails.status === "Approved" ? "text-emerald-600" : "text-red-600"
                      }`}>
                        Seller's Feedback
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                        {order.returnDetails.adminComment}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Reason Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest ml-1">Reason for Return</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      "Damaged Product", 
                      "Wrong Item Received", 
                      "Quality not as expected", 
                      "Missing Parts", 
                      "Changed my mind"
                    ].map((reason) => (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => setFormData({...formData, reason})}
                        className={`p-4 rounded-2xl border text-left text-sm font-bold transition-all ${
                          formData.reason === reason 
                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20" 
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400"
                        }`}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest ml-1">Additional Details</label>
                  <textarea 
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe the issue in detail. This helps the seller approve your return faster..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none"
                  />
                </div>

                {/* Images */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Upload Proof Images</label>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{formData.images.length}/4 Photos</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {formData.previews.map((preview, idx) => (
                      <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-black shadow-inner">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => removeImage(idx)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {formData.images.length < 4 && (
                      <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-500 transition-all group">
                        <Upload className="h-6 w-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        <span className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-tighter">Add Photo</span>
                        <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={submittingReturn || !formData.reason || !formData.description}
                    className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    {submittingReturn ? (
                      <><Loader2 className="h-5 w-5 animate-spin" /> Submitting Request...</>
                    ) : (
                      <><CheckCircle2 className="h-5 w-5" /> Submit Return Request</>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-4 font-bold uppercase tracking-tight">
                    By submitting, you agree to our Return & Refund Policy.
                  </p>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
