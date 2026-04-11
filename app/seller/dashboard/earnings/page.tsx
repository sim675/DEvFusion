"use client";

import { useState, useEffect } from "react";
import { DollarSign, Download, TrendingUp, CreditCard, Activity, Loader2, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export default function EarningsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEarnings() {
      try {
        const res = await fetch("/api/seller/earnings");
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (err) {
          console.error(err);
      } finally {
          setLoading(false);
      }
    }
    fetchEarnings();
  }, []);

  const formatPrice = (price: number) => `₹${Math.round(price).toLocaleString("en-IN")}`;

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
        <p className="text-slate-500 font-medium">Calculating revenue streams...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Earnings Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Track your store's financial performance and platform deductions.</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 font-medium transition-all w-full sm:w-auto"
        >
          <Download className="h-4 w-4" /> Download Report
        </button>
      </div>

      {/* Main Income Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl p-7 relative overflow-hidden shadow-2xl shadow-violet-500/20"
        >
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-violet-100 font-bold uppercase text-[10px] tracking-widest">Net Revenue</p>
              <h2 className="text-4xl font-black text-white mt-2">{formatPrice(data.netRevenue)}</h2>
            </div>
            <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                <DollarSign className="h-7 w-7 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-8 relative z-10">
              <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs font-bold text-white flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" />
                  Realtime
              </span>
              <p className="text-violet-200 text-xs font-medium italic">After all platform fees</p>
          </div>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0a0714] border border-white/10 rounded-3xl p-7 relative overflow-hidden shadow-xl"
        >
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Gross Sales</p>
              <h2 className="text-3xl font-black text-white mt-2">{formatPrice(data.totalGrossSales)}</h2>
            </div>
            <div className="h-14 w-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                <Activity className="h-6 w-6 text-slate-300" />
            </div>
          </div>
          <p className="text-slate-500 text-xs mt-8 relative z-10 font-medium">
             From <span className="text-white font-bold">{data.totalOrdersCount}</span> successful orders
          </p>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-[#0a0714] border border-white/10 rounded-3xl p-7 relative overflow-hidden shadow-xl"
        >
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">Platform Fee <span className="text-[10px] bg-red-500/10 px-2 py-0.5 rounded-lg text-red-400 border border-red-500/10">5%</span></p>
              <h2 className="text-3xl font-black text-red-500 mt-2">-{formatPrice(data.commission)}</h2>
            </div>
            <div className="h-14 w-14 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
                <CreditCard className="h-6 w-6 text-red-400" />
            </div>
          </div>
          <p className="text-slate-500 text-xs mt-8 relative z-10 font-medium italic">Standard commission per transaction</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#0a0714] border border-white/10 rounded-[2.5rem] p-8 shadow-xl">
              <h3 className="font-black text-sm uppercase tracking-widest mb-8 flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-emerald-400" /> 
                  Product Sales breakdown
              </h3>
              <div className="space-y-5">
                  {data.productStats.length === 0 ? (
                      <p className="text-center text-slate-500 py-20 text-sm">No sales data available yet.</p>
                  ) : (
                      data.productStats.map((prod: any, i: number) => (
                        <div key={i} className="flex justify-between items-center p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group">
                            <div>
                                <h4 className="font-bold text-slate-200 group-hover:text-violet-400 transition-colors">{prod.name}</h4>
                                <p className="text-xs text-slate-500 mt-1 font-medium">{prod.sales} confirmed units sold</p>
                            </div>
                            <div className="text-right">
                                <span className="font-black text-lg text-white">{formatPrice(prod.revenue)}</span>
                            </div>
                        </div>
                      ))
                  )}
              </div>
          </div>

          <div className="bg-[#0a0714] border border-white/10 rounded-[2.5rem] p-10 shadow-xl flex flex-col items-center justify-center text-center">
              <div className="h-24 w-24 rounded-full border-4 border-dashed border-white/10 flex items-center justify-center mb-8 bg-white/[0.02]">
                  <DollarSign className="h-10 w-10 text-slate-600" />
              </div>
              <h4 className="text-xl font-black text-white mb-3 uppercase tracking-tight">Payout System Active</h4>
              <p className="text-slate-500 text-sm max-w-xs leading-relaxed font-medium">
                  Your current net revenue of <span className="text-violet-400 font-bold">{formatPrice(data.netRevenue)}</span> is eligible for the next payout cycle.
              </p>
              <div className="mt-8 flex flex-col gap-3 w-full">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Next Cycle</span>
                      <span className="text-xs font-black text-white">Every Tuesday</span>
                  </div>
                  <button className="text-sm font-black text-violet-400 hover:text-white transition-colors uppercase tracking-widest py-3 hover:bg-violet-600/10 rounded-2xl">
                    Manage Bank Credentials
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
}
