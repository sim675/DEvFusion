"use client";

import { DollarSign, Download, TrendingUp, CreditCard, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function EarningsPage() {
  const topProducts = [
    { name: "Organic Local Honey", sales: 12, revenue: 2988 },
    { name: "Farm Fresh Eggs", sales: 8, revenue: 640 },
    { name: "Artisanal Bread", sales: 4, revenue: 480 },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Earnings Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Track your store's financial performance and commission rates.</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 font-medium transition-all w-full sm:w-auto">
          <Download className="h-4 w-4" /> Download Report
        </button>
      </div>

      {/* Main Income Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-6 relative overflow-hidden shadow-xl shadow-violet-500/20">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-violet-100 font-medium">Net Revenue</p>
              <h2 className="text-4xl font-extrabold text-white mt-1">₹11,827</h2>
            </div>
            <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-violet-200 text-sm mt-6 relative z-10 font-medium">+14.2% from last month</p>
        </div>

        <div className="bg-[#0a0714] border border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-slate-400 font-medium">Gross Sales</p>
              <h2 className="text-3xl font-bold text-white mt-1">₹12,450</h2>
            </div>
            <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center">
                <Activity className="h-5 w-5 text-slate-300" />
            </div>
          </div>
          <p className="text-slate-500 text-sm mt-6 relative z-10 font-medium">24 total orders processed</p>
        </div>

        <div className="bg-[#0a0714] border border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-slate-400 font-medium flex items-center gap-2">VendorHub Commission <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-white">5%</span></p>
              <h2 className="text-3xl font-bold text-red-400 mt-1">-₹623</h2>
            </div>
            <div className="h-12 w-12 bg-red-400/10 rounded-full flex items-center justify-center border border-red-400/20">
                <CreditCard className="h-5 w-5 text-red-400" />
            </div>
          </div>
          <p className="text-slate-500 text-sm mt-6 relative z-10 font-medium">Deducted automatically per order</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0a0714] border border-white/10 rounded-2xl p-6 shadow-xl">
              <h3 className="font-bold mb-6 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-emerald-400" /> Top-Selling Products</h3>
              <div className="space-y-4">
                  {topProducts.map((prod, i) => (
                      <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-white/5 bg-white/[0.02]">
                          <div>
                              <h4 className="font-semibold text-slate-200">{prod.name}</h4>
                              <p className="text-xs text-slate-400">{prod.sales} confirmed sales</p>
                          </div>
                          <div className="text-right">
                              <span className="font-bold text-emerald-400">₹{prod.revenue}</span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          <div className="bg-[#0a0714] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center min-h-[300px]">
              <div className="h-24 w-24 rounded-full border-4 border-dashed border-white/10 flex items-center justify-center mb-6">
                  <DollarSign className="h-8 w-8 text-slate-500" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">No active payout history</h4>
              <p className="text-center text-slate-400 text-sm max-w-sm">Your payouts are initiated every Tuesday directly to your configured bank account. You have no completed payouts yet.</p>
              <button className="mt-6 text-sm text-violet-400 hover:text-violet-300 hover:underline">Manage Bank Account</button>
          </div>
      </div>
    </div>
  );
}
