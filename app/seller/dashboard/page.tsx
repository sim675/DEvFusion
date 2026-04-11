"use client";

import { useEffect, useState } from "react";
import { Package, TrendingUp, DollarSign, ListOrdered, Navigation, Clock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SellerDashboard() {
  const [sellerName, setSellerName] = useState("");
  const [storeName, setStoreName] = useState("");

  useEffect(() => {
    // Read cached seller info for header UI
    const str = localStorage.getItem("user");
    if (str) {
      try {
        const parsed = JSON.parse(str);
        if (parsed.role === "seller") {
          setSellerName(parsed.name || parsed.fullName || "Seller");
          setStoreName(parsed.storeName || "My Store");
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {sellerName}</h1>
        <p className="text-slate-400 mt-1">Here is the latest snapshot for {storeName}</p>
      </div>

      {/* Primary Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-violet-500/50 transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-violet-500/20 rounded-full blur-2xl group-hover:bg-violet-500/30 transition-colors"></div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-500/10 rounded-xl">
              <DollarSign className="text-violet-400 h-5 w-5" />
            </div>
            <h3 className="text-sm font-medium text-slate-400">Total Revenue</h3>
          </div>
          <p className="text-3xl font-bold mt-4">₹12,450</p>
          <p className="text-xs text-emerald-400 mt-2 font-medium">+14% vs last week</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-colors"></div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl">
              <ListOrdered className="text-emerald-400 h-5 w-5" />
            </div>
            <h3 className="text-sm font-medium text-slate-400">Orders This Week</h3>
          </div>
          <p className="text-3xl font-bold mt-4">24</p>
          <p className="text-xs text-emerald-400 mt-2 font-medium">+4 new today</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/50 transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl group-hover:bg-amber-500/30 transition-colors"></div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-xl">
              <Package className="text-amber-400 h-5 w-5" />
            </div>
            <h3 className="text-sm font-medium text-slate-400">Total Products</h3>
          </div>
          <p className="text-3xl font-bold mt-4">18</p>
          <p className="text-xs text-amber-400 mt-2 font-medium">3 running low on stock</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-colors"></div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl">
              <TrendingUp className="text-blue-400 h-5 w-5" />
            </div>
            <h3 className="text-sm font-medium text-slate-400">Top Product</h3>
          </div>
          <p className="text-xl font-bold mt-4 leading-tight truncate">Organic Honey</p>
          <p className="text-xs text-slate-400 mt-2 font-medium">12 units sold</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hyperlocal Specific Panel */}
        <div className="lg:col-span-1 bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Navigation className="h-5 w-5 text-indigo-400" />
            Hyperlocal Metrics
          </h2>
          <div className="space-y-4">
             <div className="bg-[#0a0714] border border-white/5 p-4 rounded-xl">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">Active Radius</span>
                <div className="flex items-center justify-between">
                   <p className="text-xl font-bold">5.0 km</p>
                   <Link href="/seller/dashboard/settings" className="text-xs text-indigo-400 hover:underline">Change</Link>
                </div>
             </div>
             
             <div className="bg-[#0a0714] border border-white/5 p-4 rounded-xl">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">Avg. Delivery Time</span>
                <div className="flex items-center justify-between">
                   <p className="text-xl font-bold flex items-center gap-2"><Clock className="h-4 w-4 text-emerald-400" /> 35 mins</p>
                </div>
             </div>

             <div className="bg-[#0a0714] border border-white/5 p-4 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 h-full w-1 bg-blue-500"></div>
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">Nearby Orders</span>
                <p className="text-3xl font-bold">4 <span className="text-sm font-normal text-slate-400">waiting</span></p>
             </div>
          </div>
        </div>

        {/* Recent Orders Stub */}
        <div className="lg:col-span-2 border border-white/10 rounded-2xl bg-white/5 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-200">Recent Orders</h2>
                <Link href="/seller/dashboard/orders" className="text-sm text-violet-400 hover:text-violet-300 font-medium">View All</Link>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-black/20 rounded-xl border border-white/5 border-dashed">
                <Package className="h-10 w-10 text-slate-600 mb-3" />
                <h3 className="text-lg font-bold text-slate-300">No recent orders</h3>
                <p className="text-slate-500 mt-1 max-w-sm text-sm">When local customers place an order, they will appear right here.</p>
            </div>
        </div>
      </div>
    </div>
  );
}
