"use client";

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { Sparkles, Loader2, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface RecommendedSectionProps {
  userId?: string;
  currentProductId?: string;
  title?: string;
  limit?: number;
}

export default function RecommendedSection({ 
  userId, 
  currentProductId, 
  title = "Recommended for You",
  limit = 8
}: RecommendedSectionProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (userId) params.append("userId", userId);
        if (currentProductId) params.append("productId", currentProductId);
        params.append("limit", limit.toString());

        // Attempt to get geolocation for hyperlocal boost
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition((position) => {
            params.append("lng", position.coords.longitude.toString());
            params.append("lat", position.coords.latitude.toString());
            fetchData(params);
          }, () => {
            fetchData(params);
          });
        } else {
          fetchData(params);
        }
      } catch (err) {
        console.error("Failed to fetch recommendations", err);
        setLoading(false);
      }
    }

    async function fetchData(params: URLSearchParams) {
      try {
        const res = await fetch(`/api/recommendations?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error("Fetch error", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [userId, currentProductId, limit]);

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-slate-500 text-sm font-medium">Curating your recommendations...</p>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-blue-600/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Based on your interests</p>
          </div>
        </div>
        <Link href="/search" className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
          View All <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="relative group">
        <div className="flex overflow-x-auto gap-6 pb-8 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
          {products.map((product, idx) => (
            <motion.div 
              key={product._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="min-w-[280px] sm:min-w-[300px] snap-start"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
