"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { reRankProducts } from "@/utils/fuzzyQueryCorrector";
import {
  Search,
  MapPin,
  Store,
  SlidersHorizontal,
  X,
  Star,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PackageSearch,
  Navigation,
  Tag,
} from "lucide-react";

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────
type Product = {
  _id: string;
  name: string;
  brand: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  discountPrice?: number;
  mrp?: number;
  images: string[];
  mainImage: string;
  tags: string[];
  keywords: string[];
  stock: number;
  rating: number;
  numReviews: number;
  deliveryTime: string;
  distanceMeters?: number;
  location: { city: string; state: string; pincode: string };
  vendor?: { storeName: string; city: string; state: string };
  category?: { name: string; slug: string; icon: string };
  vendorId?: string;
};

type SearchResponse = {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  results: Product[];
  locationUsed?: boolean;
  outOfRange?: boolean;
  radiusUsedM?: number | null;
  error?: string;
};

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────
const metersToKm = (m: number) =>
  m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`h-3.5 w-3.5 ${
          s <= Math.round(rating)
            ? "fill-amber-400 text-amber-400"
            : "text-slate-300 dark:text-slate-600"
        }`}
      />
    ))}
  </div>
);

// ────────────────────────────────────────────────────────────────────────────
// Product Card
// ────────────────────────────────────────────────────────────────────────────
const ProductCard = ({ product, index }: { product: Product; index: number }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.vendorId && !product.vendor) {
        alert("Cannot add item, missing vendor details.");
        return;
    }
    setIsAdding(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          vendorId: product.vendorId,
          quantity: 1,
          price: product.price,
          image: product.mainImage || (product.images && product.images[0]) || ""
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add to cart");
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsAdding(false);
    }
  };

  return (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.04, duration: 0.35 }}
    whileHover={{ y: -4, transition: { duration: 0.15 } }}
    className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-shadow cursor-pointer"
    onClick={() => window.location.href = `/product/${product._id}`}
  >
    {/* Image */}
    <div className="relative h-44 overflow-hidden bg-gradient-to-br from-slate-100 to-blue-50 dark:from-slate-700 dark:to-slate-900">
      {(product.mainImage || product.images?.[0]) ? (
        <img
          src={product.mainImage || product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <PackageSearch className="h-14 w-14 text-slate-300 dark:text-slate-600" />
        </div>
      )}
      {/* Distance badge */}
      {product.distanceMeters !== undefined && (
        <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Navigation className="h-2.5 w-2.5" />
          {metersToKm(product.distanceMeters)}
        </span>
      )}
      {/* Out of stock overlay */}
      {product.stock === 0 && (
        <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
          <span className="text-white font-semibold text-sm">Out of Stock</span>
        </div>
      )}
    </div>

    {/* Details */}
    <div className="p-4">
      {/* Brand & Category */}
      <div className="flex items-center justify-between gap-2">
        {product.brand && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {product.brand}
          </span>
        )}
        {product.category && (
          <Link
            href={`/category/${product.category.slug}`}
            className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 hover:underline"
          >
            {product.category.name}
          </Link>
        )}
      </div>

      <h3 className="mt-1 font-semibold text-sm text-slate-900 dark:text-white line-clamp-1 leading-snug">
        {product.name}
      </h3>

      {product.shortDescription && (
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
          {product.shortDescription}
        </p>
      )}

      {/* Rating & Delivery */}
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <StarRating rating={product.rating} />
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            ({product.numReviews})
          </span>
        </div>
        {product.deliveryTime && (
          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Tag className="h-2.5 w-2.5" />
            {product.deliveryTime}
          </span>
        )}
      </div>

      {/* Price + Cart */}
      <div className="mt-3 flex items-end justify-between">
        <div className="flex flex-col">
          {product.mrp && product.mrp > product.price && (
            <span className="text-[10px] text-slate-400 line-through">
              ₹{product.mrp.toLocaleString("en-IN")}
            </span>
          )}
          <span className="text-lg font-bold text-slate-900 dark:text-white leading-none">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0 || isAdding || added}
          className="flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isAdding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShoppingCart className="h-3.5 w-3.5" />}
          {isAdding ? "Wait" : added ? "Added" : "Add"}
        </button>
      </div>

      {/* Vendor */}
      {product.vendor?.storeName && (
        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
          <Store className="h-3 w-3" />
          <span className="truncate">Sold by <span className="font-medium text-slate-700 dark:text-slate-300">{product.vendor.storeName}</span></span>
        </div>
      )}
    </div>
  </motion.div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// Main Search Page (inner — reads searchParams)
// ────────────────────────────────────────────────────────────────────────────
function SearchPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [inputValue, setInputValue] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "fetching" | "granted" | "denied">("idle");
  const [radius, setRadius] = useState(5000); // 5 km default for localized search
  const [showFilters, setShowFilters] = useState(false);
  const [locationUsed, setLocationUsed] = useState(true);
  const [outOfRange, setOutOfRange] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "");
  const [subcategoryFilter, setSubcategoryFilter] = useState(searchParams.get("subcategory") || "");
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);

  const LIMIT = 20;

  // ── Grab browser geolocation once on mount ────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    setLocationStatus("fetching");
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus("granted");
      },
      () => setLocationStatus("denied"),
      { timeout: 8000 }
    );
  }, []);

  // ── Fetch Available Categories ────────────────────────────────────────────
  useEffect(() => {
    async function fetchCats() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setAvailableCategories(data);
        }
      } catch (err) { console.error("Cat fetch failed", err); }
    }
    fetchCats();
  }, []);

  // ── Log search to self-learning engine (fire-and-forget) ──────────────────
  const logSearch = (q: string, resultCount: number) => {
    if (!q) return;
    fetch("/api/search/learn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ originalQuery: q, correctedQuery: q, resultCount }),
    }).catch(() => {}); // never let logging break the UI
  };

  // ── Fetch results ─────────────────────────────────────────────────────────
  const fetchResults = useCallback(
    async (q: string, pg: number) => {
      if (!q && !userCoords && !categoryFilter) return;

      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (userCoords) {
          params.set("lat", userCoords.lat.toString());
          params.set("lng", userCoords.lng.toString());
          params.set("radius", radius.toString());
        }
        if (categoryFilter) params.set("category", categoryFilter);
        if (subcategoryFilter) params.set("subcategory", subcategoryFilter);
        params.set("page", pg.toString());
        params.set("limit", LIMIT.toString());

        const res = await fetch(`/api/products/search?${params.toString()}`);
        const data: SearchResponse = await res.json();

        if (!res.ok || !data.success) {
          setError(data.error || "Search failed. Please try again.");
          setResults([]);
        } else {
          setResults(reRankProducts(data.results, q)); // re-rank by relevance
          setTotal(data.total);
          setTotalPages(data.totalPages);
          setLocationUsed(data.locationUsed ?? false);
          setOutOfRange(data.outOfRange ?? false);
          // Log to self-learning engine
          logSearch(q, data.total);
        }
      } catch {
        setError("Network error. Please check your connection.");
      } finally {
        setLoading(false);
      }
    },
    [userCoords, radius, categoryFilter, subcategoryFilter]
  );

  // Sync state with searchParams (handles external links like Home -> Search)
  useEffect(() => {
    const q = searchParams.get("q") || "";
    const cat = searchParams.get("category") || "";
    const sub = searchParams.get("subcategory") || "";
    
    setQuery(q);
    setInputValue(q);
    setCategoryFilter(cat);
    setSubcategoryFilter(sub);
  }, [searchParams]);

  // Run search whenever query, coords, or radius changes
  useEffect(() => {
    setPage(1);
    fetchResults(query, 1);
  }, [query, userCoords, radius, categoryFilter, subcategoryFilter, fetchResults]);

  // Sync page changes
  useEffect(() => {
    if (page > 1) fetchResults(query, page);
  }, [page]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = inputValue.trim();
    setQuery(q);
    setPage(1);
    // Update the URL so the page is bookmarkable
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categoryFilter) params.set("category", categoryFilter);
    if (subcategoryFilter) params.set("subcategory", subcategoryFilter);
    router.replace(`/search?${params.toString()}`, { scroll: false });
  };

  const radiusOptions = [
    { label: "5 km",  value: 5000 },
    { label: "10 km", value: 10000 },
    { label: "25 km", value: 25000 },
    { label: "50 km", value: 50000 },
    { label: "100 km", value: 100000 },
    { label: "Any",   value: 500000 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">

      {/* ── Sticky Header / Search Bar ─────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex-shrink-0 rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Search form */}
          <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                id="search-page-input"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search products, brands, keywords..."
                className="w-full rounded-full border border-slate-300 dark:border-slate-700 pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {inputValue && (
                <button
                  type="button"
                  onClick={() => { setInputValue(""); setQuery(""); }}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`rounded-full border px-3 py-2 text-sm transition-colors ${
                showFilters
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              aria-label="Toggle filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* ── Filter Panel ──────────────────────────────────────────────────── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap gap-6 items-start">
                {/* Location status */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    📍 Your Location
                  </p>
                  <div className="flex items-center gap-2">
                    <MapPin className={`h-4 w-4 ${locationStatus === "granted" ? "text-green-500" : "text-slate-400"}`} />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {locationStatus === "fetching" && "Getting location…"}
                      {locationStatus === "granted" && `Lat ${userCoords?.lat.toFixed(4)}, Lng ${userCoords?.lng.toFixed(4)}`}
                      {locationStatus === "denied" && "Location access denied — keyword search only"}
                      {locationStatus === "idle" && "Location not requested yet"}
                    </span>
                  </div>
                </div>

                {/* Radius selector */}
                {locationStatus === "granted" && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Search Radius
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {radiusOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setRadius(opt.value)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
                            radius === opt.value
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Category & Subcategory Navigation ─────────────────────────────── */}
      <div className="bg-white/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 backdrop-blur-sm overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
               onClick={() => { setCategoryFilter(""); setSubcategoryFilter(""); }}
               className={`whitespace-nowrap rounded-full px-5 py-2 text-xs font-bold transition-all ${
                 !categoryFilter 
                   ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                   : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
               }`}
            >
              All Categories
            </button>
            {availableCategories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => { setCategoryFilter(cat.slug); setSubcategoryFilter(""); }}
                className={`whitespace-nowrap rounded-full px-5 py-2 text-xs font-bold transition-all border ${
                  categoryFilter === cat.slug 
                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20" 
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-400"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Subcategories */}
          {categoryFilter && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1"
            >
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2 shrink-0">Sub:</span>
               <button
                 onClick={() => setSubcategoryFilter("")}
                 className={`whitespace-nowrap px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                   !subcategoryFilter 
                     ? "bg-slate-900 dark:bg-white text-white dark:text-black" 
                     : "text-slate-500 hover:text-blue-500"
                 }`}
               >
                 All
               </button>
               {availableCategories.find(c => c.slug === categoryFilter)?.subcategories.map((sub: string) => (
                 <button
                   key={sub}
                   onClick={() => setSubcategoryFilter(sub)}
                   className={`whitespace-nowrap px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                     subcategoryFilter === sub 
                       ? "bg-slate-900 dark:bg-white text-white dark:text-black shadow-md" 
                       : "text-slate-500 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                   }`}
                 >
                   {sub}
                 </button>
               ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Results meta-line */}
        {!loading && (query || userCoords) && (
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            {query && (
              <span className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full font-medium">
                <Tag className="h-3.5 w-3.5" />
                &ldquo;{query}&rdquo;
              </span>
            )}
            {locationStatus === "granted" && (
              <span className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full font-medium">
                <MapPin className="h-3.5 w-3.5" />
                Within {metersToKm(radius)}
              </span>
            )}
            <span className="ml-auto text-slate-500 dark:text-slate-400">
              {total} result{total !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-slate-500 dark:text-slate-400">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <p className="text-sm font-medium">Finding products near you…</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <X className="h-10 w-10 text-red-400" />
            <p className="text-base font-semibold text-slate-700 dark:text-slate-300">{error}</p>
            <button
              onClick={() => fetchResults(query, page)}
              className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state — out of range: location was used but found nothing */}
        {!loading && !error && results.length === 0 && outOfRange && (
          <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
            <div className="h-20 w-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <MapPin className="h-10 w-10 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">
                No products found within {metersToKm(radius)}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
                There are no sellers listing{query ? ` &ldquo;${query}&rdquo;` : " products"} near your location yet.
                Try widening your search area:
              </p>
            </div>
            {/* Quick radius-expand buttons */}
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              {radiusOptions
                .filter((o) => o.value > radius)
                .slice(0, 4)
                .map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setRadius(opt.value)}
                    className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-sm font-semibold transition-colors"
                  >
                    Try {opt.label}
                  </button>
                ))}
            </div>
            {/* Fallback: search without location */}
            <button
              onClick={() => setUserCoords(null)}
              className="text-sm text-slate-500 dark:text-slate-400 underline underline-offset-2 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              Remove location filter and search everywhere
            </button>
          </div>
        )}

        {/* Empty state — generic: no location filter, just no matches */}
        {!loading && !error && results.length === 0 && !outOfRange && (query || userCoords) && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <PackageSearch className="h-16 w-16 text-slate-300 dark:text-slate-600" />
            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">No products found</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              Try a different keyword or browse categories.
            </p>
            <Link
              href="/"
              className="rounded-full border-2 border-slate-300 dark:border-slate-700 px-6 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        )}

        {/* Initial prompt (nothing searched yet) */}
        {!loading && !error && results.length === 0 && !query && !userCoords && (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <Search className="h-16 w-16 text-slate-300 dark:text-slate-600" />
            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">What are you looking for?</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Type a keyword above and hit Search, or enable location for hyperlocal results.
            </p>
          </div>
        )}

        {/* ── Product Grid ─────────────────────────────────────────────────── */}
        {!loading && results.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>

            {/* ── Pagination ──────────────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="flex items-center gap-1 rounded-full border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </button>

                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                  className="flex items-center gap-1 rounded-full border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Exported page — wraps inner in Suspense (required for useSearchParams)
// ────────────────────────────────────────────────────────────────────────────
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <SearchPageInner />
    </Suspense>
  );
}
