"use client";

import { useEffect, useState } from "react";
import { Store, LogOut, Package, TrendingUp, DollarSign, ListOrdered } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SellerDashboard() {
  const router = useRouter();
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

  const handleLogout = async () => {
    await fetch("/api/seller/logout", { method: "POST" });
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#07050f] text-white font-sans">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#07050f]/80 backdrop-blur-md z-40">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Store className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight">VendorHub Seller</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 text-sm transition-all"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {sellerName}</h1>
          <p className="text-slate-400 mt-1">Here is the latest snapshot for {storeName}</p>
        </div>

        {/* Dashboard Cards Demo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-violet-500/50 transition-colors">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-violet-500/20 rounded-full blur-2xl group-hover:bg-violet-500/30 transition-colors"></div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-violet-500/10 rounded-xl">
                <DollarSign className="text-violet-400 h-5 w-5" />
              </div>
              <h3 className="text-sm font-medium text-slate-400">Total Revenue</h3>
            </div>
            <p className="text-3xl font-bold mt-4">₹0.00</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-colors"></div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                <ListOrdered className="text-emerald-400 h-5 w-5" />
              </div>
              <h3 className="text-sm font-medium text-slate-400">Active Orders</h3>
            </div>
            <p className="text-3xl font-bold mt-4">0</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/50 transition-colors">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl group-hover:bg-amber-500/30 transition-colors"></div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 rounded-xl">
                <Package className="text-amber-400 h-5 w-5" />
              </div>
              <h3 className="text-sm font-medium text-slate-400">Total Products</h3>
            </div>
            <p className="text-3xl font-bold mt-4">0</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-colors"></div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-xl">
                <TrendingUp className="text-blue-400 h-5 w-5" />
              </div>
              <h3 className="text-sm font-medium text-slate-400">Store Views</h3>
            </div>
            <p className="text-3xl font-bold mt-4">0</p>
          </div>
        </div>
        
        <div className="border border-white/10 rounded-2xl bg-white/5 p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
            <Package className="h-12 w-12 text-slate-600 mb-4" />
            <h2 className="text-xl font-bold text-slate-200">No active products yet</h2>
            <p className="text-slate-400 mt-2 max-w-sm">You haven't added any products to your active catalog. Start configuring your store to accept local orders!</p>
            <button className="mt-6 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 font-semibold transition-colors shadow-lg shadow-violet-500/20">
              Add New Product
            </button>
        </div>
      </main>
    </div>
  );
}
