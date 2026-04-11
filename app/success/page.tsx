"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, Home, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  
  useEffect(() => {
    if (!orderId) {
      router.replace("/");
    }
  }, [orderId, router]);

  if (!orderId) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 text-center shadow-xl border border-slate-200 dark:border-slate-800"
    >
      <div className="h-24 w-24 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
        <CheckCircle className="h-12 w-12 text-emerald-500" />
      </div>
      
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Order Confirmed!</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">
        Thank you for your purchase. We've received your order and the vendor is currently preparing it for delivery.
      </p>

      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-8 text-left border border-slate-100 dark:border-slate-800">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Order ID</p>
        <p className="font-mono font-medium text-slate-900 dark:text-white break-all">{orderId}</p>
      </div>

      <div className="flex flex-col gap-3">
        <Link 
          href="/orders" 
          className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Package className="h-5 w-5" /> View My Orders
        </Link>
        <Link 
          href="/" 
          className="w-full flex items-center justify-center gap-2 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <Home className="h-5 w-5" /> Back to Home
        </Link>
      </div>
    </motion.div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-blue-500" />}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
