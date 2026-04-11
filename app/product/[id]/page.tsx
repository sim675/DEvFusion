"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ImageGallery from "@/components/product/ImageGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductDetails from "@/components/product/ProductDetails";
import ReviewsSection from "@/components/product/ReviewsSection";
import { Loader2, ArrowLeft, Share2, Heart, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [reviewsData, setReviewsData] = useState<any>({ reviews: [], stats: { average: 0, total: 0, breakdown: {} } });

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);
        // 1. Fetch Product & Seller
        const pRes = await fetch(`/api/products/${id}`);
        const pData = await pRes.json();

        if (!pRes.ok) {
          throw new Error(pData.error || "Product not found");
        }

        setData(pData);

        // 2. Fetch Reviews
        const rRes = await fetch(`/api/reviews/${id}`);
        if (rRes.ok) {
          const rData = await rRes.json();
          setReviewsData(rData);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchAll();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07050f] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-violet-500" />
        <p className="text-slate-400 font-medium animate-pulse">Loading product details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#07050f] flex flex-col items-center justify-center p-6 text-center">
        <div className="h-20 w-20 rounded-3xl bg-red-500/10 flex items-center justify-center mb-6">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">{error || "Product Not Found"}</h1>
        <p className="text-slate-400 max-w-md mb-8">
          The product you're looking for might have been removed or is temporarily unavailable from the seller.
        </p>
        <Link href="/" className="px-8 py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-all">
          Back to Home
        </Link>
      </div>
    );
  }

  const { product, seller } = data;

  return (
    <div className="min-h-screen bg-[#07050f] text-white pb-20">
      {/* Top Navigation */}
      <div className="sticky top-0 z-50 bg-[#07050f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Back</span>
          </Link>
          <div className="flex items-center gap-3">
            <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all">
              <Share2 className="h-5 w-5" />
            </button>
            <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all">
              <Heart className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 pt-8 space-y-16">
        {/* Top Section: Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Gallery */}
          <div className="lg:col-span-7">
            <ImageGallery images={product.images} />
          </div>

          {/* Right: Product Info */}
          <div className="lg:col-span-5">
            <ProductInfo product={product} seller={seller} reviewStats={reviewsData.stats} />
          </div>
        </div>

        {/* Mid Section: Description & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-white/5 pt-16">
          <div className="lg:col-span-2">
            <ProductDetails product={product} />
          </div>
          <div className="space-y-8">
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-violet-600 to-indigo-700 shadow-2xl shadow-violet-500/20">
              <h3 className="text-xl font-black text-white mb-4 italic">HYPERLOCAL FAST</h3>
              <p className="text-violet-100 text-sm leading-relaxed mb-6">
                Get this item delivered from <span className="font-bold text-white">{seller.shopName}</span> in your city. Support local business!
              </p>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="text-lg font-black text-white">⚡</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-violet-200 uppercase">Estimated</p>
                  <p className="text-sm font-black text-white">{product.deliveryTime} Delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Reviews */}
        <div className="border-t border-white/5 pt-16">
          <ReviewsSection productId={product._id} reviews={reviewsData.reviews} stats={reviewsData.stats} />
        </div>
      </main>
    </div>
  );
}
