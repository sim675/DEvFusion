"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Store,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  ArrowRight,
  LogOut,
  Home,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SellerInfo {
  fullName: string;
  email: string;
  storeName: string;
  sellerStatus: "pending_verification" | "approved" | "rejected";
  createdAt: string;
}

const STATUS_CONFIG = {
  pending_verification: {
    icon: Clock,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    gradientFrom: "from-amber-500",
    gradientTo: "to-orange-500",
    title: "Application Under Review",
    desc: "Our team is reviewing your application. This usually takes 24–48 hours.",
    badge: "Pending Verification",
    badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  approved: {
    icon: CheckCircle2,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    gradientFrom: "from-emerald-500",
    gradientTo: "to-teal-500",
    title: "Application Approved!",
    desc: "Congratulations! Your seller account is active. You can now access your dashboard.",
    badge: "Approved",
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  rejected: {
    icon: XCircle,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    gradientFrom: "from-red-500",
    gradientTo: "to-rose-500",
    title: "Application Not Approved",
    desc: "Unfortunately, your application was not approved. Please contact support for more details.",
    badge: "Rejected",
    badgeColor: "bg-red-500/15 text-red-400 border-red-500/30",
  },
};

export default function SellerStatusPage() {
  const router = useRouter();
  const [seller, setSeller] = useState<SellerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/seller/status");
        if (res.status === 401) {
          // Not logged in — redirect to main login
          router.replace("/login");
          return;
        }
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to fetch status.");
        }
        const data: SellerInfo = await res.json();
        setSeller(data);

        // If approved, redirect to seller dashboard after a brief moment
        if (data.sellerStatus === "approved") {
          setTimeout(() => router.push("/seller/dashboard"), 2500);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/seller/logout", { method: "POST" });
    localStorage.removeItem("user");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07050f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
          <p className="text-sm">Loading your status…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#07050f] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <XCircle className="h-14 w-14 text-red-400 mx-auto" />
          <h1 className="text-xl font-bold text-white">Something went wrong</h1>
          <p className="text-slate-400 text-sm">{error}</p>
          <Link href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (!seller) return null;

  const cfg = STATUS_CONFIG[seller.sellerStatus];
  const StatusIcon = cfg.icon;

  return (
    <div className="min-h-screen bg-[#07050f] text-white">
      {/* Top bar */}
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Store className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight">VendorHub</span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 text-sm transition-all"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </header>

      {/* Main */}
      <main className="flex items-start justify-center min-h-[calc(100vh-65px)] p-6 pt-16">
        <div className="w-full max-w-lg space-y-6">
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-slate-400 text-sm mb-1">Welcome back,</p>
            <h1 className="text-2xl font-extrabold text-white">{seller.fullName}</h1>
            <p className="text-slate-500 text-sm mt-0.5">{seller.storeName}</p>
          </motion.div>

          {/* Status card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className={`rounded-2xl border ${cfg.borderColor} ${cfg.bgColor} p-6 space-y-4`}
          >
            <div className="flex items-center gap-4">
              <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${cfg.gradientFrom} ${cfg.gradientTo} flex items-center justify-center shadow-lg flex-shrink-0`}>
                <StatusIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.badgeColor} mb-1.5`}>
                  <Activity className="h-3 w-3" /> {cfg.badge}
                </span>
                <h2 className="text-lg font-bold text-white leading-tight">{cfg.title}</h2>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed">{cfg.desc}</p>

            {seller.sellerStatus === "pending_verification" && (
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Timeline</p>
                {[
                  { label: "Application submitted", done: true },
                  { label: "Document verification", done: false },
                  { label: "Account activation", done: false },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? "bg-violet-500" : "border border-white/15 bg-white/5"}`}>
                      {step.done && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>
                    <p className={`text-sm ${step.done ? "text-white font-medium" : "text-slate-500"}`}>
                      {step.label}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {seller.sellerStatus === "approved" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-center gap-2 text-sm text-emerald-300"
              >
                <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                Redirecting you to the seller dashboard…
              </motion.div>
            )}
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            {seller.sellerStatus === "approved" && (
              <Link href="/seller/dashboard"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20">
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Link href="/"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 text-sm transition-all">
              <Home className="h-4 w-4" /> Back to Home
            </Link>
          </motion.div>

          {/* Applied on */}
          <p className="text-center text-xs text-slate-700">
            Application submitted on{" "}
            {new Date(seller.createdAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>
      </main>
    </div>
  );
}
