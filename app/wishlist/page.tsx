"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, ArrowLeft, Loader2, ShoppingBag, Search } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import ProductCard from "@/components/product/ProductCard";

export default function WishlistPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWishlist() {
      try {
        const res = await fetch("/api/user/wishlist");
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to load wishlist");
        }
        const data = await res.json();
        setWishlist(data.wishlist || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchWishlist();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07050f] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-violet-500" />
        <p className="text-slate-400 font-medium animate-pulse">Loading your favorites...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07050f] text-white">
      {/* Navigation */}
      <div className="sticky top-0 z-50 bg-[#07050f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Back to Market</span>
          </Link>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500 fill-red-500" />
            <h1 className="text-lg font-bold tracking-tight">My Wishlist ({wishlist.length})</h1>
          </div>
          <div className="w-20 lg:block hidden"></div> {/* Spacer */}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {error ? (
          <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl text-center">
            <p className="text-red-500 font-medium">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 text-sm text-slate-400 hover:text-white underline">Try again</button>
          </div>
        ) : wishlist.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 px-6 text-center"
          >
            <div className="h-24 w-24 rounded-[2rem] bg-white/5 flex items-center justify-center mb-8 border border-white/10 shadow-2xl">
              <ShoppingBag className="h-10 w-10 text-slate-500" />
            </div>
            <h2 className="text-3xl font-black text-white italic uppercase mb-4 tracking-tighter">Your wishlist is empty</h2>
            <p className="text-slate-400 max-w-md mb-10 leading-relaxed text-lg">
              Looks like you haven't saved any local gems yet. Browse products from vendors near you and save what you love.
            </p>
            <Link href="/" className="px-10 py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl shadow-xl shadow-violet-500/20 transition-all flex items-center gap-3 active:scale-95 group">
              <Search className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              Start Discovering
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {wishlist.map((product, idx) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
