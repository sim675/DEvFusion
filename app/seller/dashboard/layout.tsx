"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Loader2, LayoutDashboard, Package, Plus, ShoppingBag, DollarSign, Bell, Settings, Store, User, RotateCcw } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import SellerProfileModal from "../components/SellerProfileModal";

export default function SellerDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/seller/status");
        if (!res.ok) {
          router.replace("/seller/status");
          return;
        }
        const data = await res.json();
        
        // Ensure only fully approved sellers access the dashboard
        if (data.sellerStatus !== "approved") {
          router.replace("/seller/status");
          return;
        }
        
        setAuthorized(true);
      } catch (err) {
        console.error(err);
        router.replace("/seller/status");
      }
    }
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/seller/logout", { method: "POST" });
    } catch (_) {}
    finally {
      localStorage.removeItem("user");
      router.push("/");
    }
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#07050f] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  const navLinks = [
    { name: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
    { name: "Products", href: "/seller/dashboard/products", icon: Package },
    { name: "Add Product", href: "/seller/add-product", icon: Plus },
    { name: "Orders", href: "/seller/dashboard/orders", icon: ShoppingBag },
    { name: "Returns", href: "/seller/dashboard/returns", icon: RotateCcw },
    { name: "Earnings", href: "/seller/dashboard/earnings", icon: DollarSign },
    { name: "Inventory Alerts", href: "/seller/dashboard/inventory", icon: Bell },
    { name: "Store Settings", href: "/seller/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-[#07050f] text-white font-sans">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-[#0a0714] border-r border-white/10 z-50 flex flex-col shadow-2xl shadow-indigo-500/5">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-white/10">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Store className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">VendorHub</span>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm ${
                  isActive
                    ? "bg-violet-600/10 text-violet-400 border border-violet-500/20 shadow-inner"
                    : "text-slate-400 border border-transparent hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "text-violet-400" : "text-slate-500"}`} />
                {item.name}
                {item.name === "Inventory Alerts" && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-[10px] font-bold text-red-400">
                    3
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 font-medium text-sm transition-all disabled:opacity-50"
          >
            {isLoggingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
            {isLoggingOut ? "Signing out..." : "Logout"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 border-b border-white/10 bg-[#07050f]/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-8">
          <h1 className="text-lg font-semibold text-slate-200 tracking-tight">
            {navLinks.find((l) => l.href === pathname)?.name || "Dashboard"}
          </h1>
          <div className="flex items-center gap-4">
             <div className="flex flex-col text-right">
                <span className="text-sm font-semibold tracking-tight text-white leading-none">Store Status</span>
                <span className="text-xs text-emerald-400 mt-1 flex items-center justify-end gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span> Active</span>
             </div>
             <div className="h-8 w-px bg-white/10 mx-2"></div>
             <button 
                onClick={() => setProfileModalOpen(true)}
                title="View Profile"
                className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
             >
                <User className="h-5 w-5 text-slate-300" />
             </button>
          </div>
        </header>

        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      <SellerProfileModal isOpen={isProfileModalOpen} onClose={() => setProfileModalOpen(false)} />
    </div>
  );
}
