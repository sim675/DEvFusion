"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Store,
  Zap,
  ShoppingCart,
  Truck,
  User,
  Shield,
  Sparkles,
  Search,
  MessageCircle,
  Mail,
  Share2,
  ExternalLink,
  Shirt,
  Smartphone,
  Monitor,
  Home as HomeIcon,
  Tv,
  Gamepad2,
  Utensils,
  Car,
  Bike,
  Book,
  Armchair,
  Menu,
  X,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Check,
  Navigation,
  TrendingUp,
  Tag,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Package,
} from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import RecommendedSection from "@/components/product/RecommendedSection";

// ─── Types ───────────────────────────────────────────────────────────────────

type Address = {
  _id?: string;
  id?: string;
  name: string;
  phone?: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
};

type HomeProduct = {
  _id: string;
  name: string;
  brand?: string;
  shortDescription?: string;
  price: number;
  discountPrice?: number;
  mrp?: number;
  images?: string[];
  mainImage?: string;
  stock: number;
  rating?: number;
  numReviews?: number;
  deliveryTime?: string;
  distanceMeters?: number;
  category?: { name: string; slug: string };
  vendor?: { storeName: string; city: string; state: string };
};

type GeoState = "idle" | "requesting" | "granted" | "denied" | "unavailable";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatPrice = (price: number) => `\u20B9${price.toLocaleString("en-IN")}`;

const formatDistance = (m?: number) => {
  if (!m) return null;
  return m < 1000 ? `${Math.round(m)}m away` : `${(m / 1000).toFixed(1)}km away`;
};

// ─── Static Data ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: "Fashion", icon: Shirt, slug: "fashion", color: "from-pink-500 to-rose-500" },
  { name: "Mobiles", icon: Smartphone, slug: "mobiles", color: "from-blue-500 to-indigo-500" },
  { name: "Beauty", icon: Sparkles, slug: "beauty", color: "from-purple-500 to-fuchsia-500" },
  { name: "Electronics", icon: Monitor, slug: "electronics", color: "from-cyan-500 to-blue-500" },
  { name: "Home", icon: HomeIcon, slug: "home", color: "from-amber-500 to-orange-500" },
  { name: "Appliances", icon: Tv, slug: "appliances", color: "from-teal-500 to-emerald-500" },
  { name: "Toys", icon: Gamepad2, slug: "toys", color: "from-red-500 to-orange-500" },
  { name: "Food", icon: Utensils, slug: "food", color: "from-green-500 to-lime-500" },
  { name: "Sports", icon: Bike, slug: "sports", color: "from-orange-500 to-amber-500" },
  { name: "Books", icon: Book, slug: "books", color: "from-slate-500 to-slate-600" },
  { name: "Furniture", icon: Armchair, slug: "furniture", color: "from-yellow-600 to-amber-600" },
  { name: "Vehicles", icon: Car, slug: "vehicles", color: "from-gray-600 to-slate-700" },
];

const FEATURES = [
  {
    icon: MapPin,
    title: "Hyperlocal Delivery",
    desc: "Products from sellers in your neighborhood, delivered faster than ever.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: Shield,
    title: "Verified Sellers",
    desc: "Every seller is vetted and approved before listing products on VendorHub.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    desc: "Same-day and instant delivery options from your nearest local stores.",
    color: "from-amber-500 to-orange-500",
  },
];

// ─── Animation Variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

// ─── Skeleton Components ──────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
      <div className="aspect-[4/3] animate-pulse bg-slate-100" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-16 animate-pulse rounded-full bg-slate-100" />
        <div className="h-4 w-3/4 animate-pulse rounded-full bg-slate-100" />
        <div className="h-3 w-full animate-pulse rounded-full bg-slate-100" />
        <div className="h-5 w-20 animate-pulse rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-3">
      <div className="h-20 w-20 flex-shrink-0 animate-pulse rounded-2xl bg-slate-100" />
      <div className="flex-1 space-y-3 py-2">
        <div className="h-3 w-24 animate-pulse rounded-full bg-slate-100" />
        <div className="h-4 w-3/4 animate-pulse rounded-full bg-slate-100" />
        <div className="h-4 w-16 animate-pulse rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Home() {
  const router = useRouter();

  // Auth
  const [user, setUser] = useState<any>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [activeAddressId, setActiveAddressId] = useState<string | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [modalView, setModalView] = useState<"list" | "form">("list");
  const [formData, setFormData] = useState<Address>({
    name: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  // Geolocation
  const [geoState, setGeoState] = useState<GeoState>("idle");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoCity, setGeoCity] = useState<string>("");

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Products
  const [homeProducts, setHomeProducts] = useState<HomeProduct[]>([]);
  const [homeProductsLoading, setHomeProductsLoading] = useState(true);
  const [homeProductsError, setHomeProductsError] = useState("");
  const [locationUsed, setLocationUsed] = useState(false);
  const [outOfRange, setOutOfRange] = useState(false);

  // Fallback products (shown in hero when out of range)
  const [fallbackProducts, setFallbackProducts] = useState<HomeProduct[]>([]);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const activeAddress = addresses.find((a) => (a._id || a.id) === activeAddressId);
  const locationLabel = activeAddress
    ? `${activeAddress.city}, ${activeAddress.pincode}`
    : geoCity
    ? geoCity
    : "Set Location";

  // ── Geolocation ──────────────────────────────────────────────────────────────
  const requestGeolocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setGeoState("unavailable");
      return;
    }
    setGeoState("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        setGeoState("granted");
        // Reverse geocode for display label
        fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`
        )
          .then((r) => r.json())
          .then((d) => {
            const city =
              d.address?.city ||
              d.address?.town ||
              d.address?.village ||
              d.address?.county ||
              "";
            if (city) setGeoCity(city);
          })
          .catch(() => {});
      },
      (err) => {
        setGeoState(err.code === 1 ? "denied" : "unavailable");
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  // ── Fetch fallback (all products, no filter) ──────────────────────────────
  const fetchFallbackProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products?limit=24");
      const data = await res.json();
      if (res.ok && data.success) setFallbackProducts(data.results || []);
    } catch (_) {}
  }, []);

  // ── Fetch hyperlocal or all products ─────────────────────────────────────
  const fetchHomeProducts = useCallback(
    async (coords: { lat: number; lng: number } | null) => {
      try {
        setHomeProductsLoading(true);
        setHomeProductsError("");
        setOutOfRange(false);

        let url = "/api/products?limit=24";
        if (coords) {
          url += `&lat=${coords.lat}&lng=${coords.lng}&radius=10000`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to load products.");
        }

        const results: HomeProduct[] = data.results || [];
        setHomeProducts(results);
        setLocationUsed(!!data.locationUsed);

        if (!!coords && results.length === 0) {
          setOutOfRange(true);
          fetchFallbackProducts();
        }
      } catch (error: any) {
        setHomeProducts([]);
        setHomeProductsError(error.message || "Failed to load products.");
      } finally {
        setHomeProductsLoading(false);
      }
    },
    [fetchFallbackProducts]
  );

  // ── Address helpers ───────────────────────────────────────────────────────
  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    setIsAddressLoading(true);
    try {
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses);
        const defaultAddr = data.addresses.find((a: Address) => a.isDefault);
        if (defaultAddr) {
          setActiveAddressId(defaultAddr._id || defaultAddr.id || null);
        } else if (data.addresses.length > 0) {
          setActiveAddressId(data.addresses[0]._id || data.addresses[0].id || null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
    } finally {
      setIsAddressLoading(false);
    }
  }, [user]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsAddressLoading(true);
    const addressId = formData._id || formData.id;
    const url = addressId ? `/api/addresses/${addressId}` : "/api/addresses";
    const method = addressId ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        await fetchAddresses();
        setModalView("list");
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to save address.");
      }
    } catch (err) {
      alert("A network error occurred. Please try again.");
    } finally {
      setIsAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!user) return;
    setIsAddressLoading(true);
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      if (res.ok) await fetchAddresses();
    } catch (err) {
      console.error("Error deleting address:", err);
    } finally {
      setIsAddressLoading(false);
    }
  };

  const startEditAddress = (e: React.MouseEvent, address: Address) => {
    e.stopPropagation();
    setFormData(address);
    setModalView("form");
  };

  const handleSelectAddress = async (id: string) => {
    if (!user) return;
    setIsAddressLoading(true);
    try {
      const res = await fetch(`/api/addresses/${id}/default`, { method: "PATCH" });
      if (res.ok) {
        await fetchAddresses();
        setIsLocationModalOpen(false);
      }
    } catch (err) {
      console.error("Error selecting address:", err);
    } finally {
      setIsAddressLoading(false);
    }
  };

  const openAddressModal = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setModalView(addresses.length > 0 ? "list" : "form");
    if (addresses.length === 0) {
      setFormData({ name: "", street: "", city: "", state: "", pincode: "", phone: "" });
    }
    setIsLocationModalOpen(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (user?.role === "seller") {
        await fetch("/api/seller/logout", { method: "POST" });
      } else {
        await fetch("/api/auth/logout", { method: "POST" });
      }
    } catch (_) {}
    finally {
      localStorage.removeItem("user");
      setUser(null);
      setIsLoggingOut(false);
      router.push("/");
    }
  };

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch (_) {}
    }
    requestGeolocation();
  }, [requestGeolocation]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    } else {
      setAddresses([]);
      setActiveAddressId(null);
    }
  }, [user, fetchAddresses]);

  useEffect(() => {
    fetchHomeProducts(userCoords);
  }, [userCoords, fetchHomeProducts]);

  // ── Derived product slices ─────────────────────────────────────────────────
  const heroProducts     = outOfRange ? fallbackProducts : homeProducts;
  const nearbyProducts   = heroProducts.slice(0, 4);
  const featuredProducts = homeProducts.slice(0, 8);
  const trendingProducts =
    homeProducts.slice(4, 12).length > 0
      ? homeProducts.slice(4, 12)
      : homeProducts.slice(0, 8);
  const dealProducts     = homeProducts.filter((p) => (p.mrp ?? p.price) > p.price).slice(0, 8);
  const exploreProducts  =
    homeProducts.slice(8, 20).length > 0
      ? homeProducts.slice(8, 20)
      : homeProducts.slice(0, 8);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">

      {/* ─── NAVBAR ───────────────────────────────────────────────────────── */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl">
        {/* Top bar */}
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          {/* Mobile hamburger */}
          <button
            aria-label="Toggle mobile menu"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            className="shrink-0 rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 md:hidden"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Logo */}
          <div
            className="flex shrink-0 cursor-pointer items-center gap-2"
            onClick={() => router.push("/")}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-md">
              <Store className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Vendor<span className="text-indigo-600">Hub</span>
            </span>
          </div>

          {/* Location pill - desktop */}
          <button
            onClick={openAddressModal}
            className="hidden shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm transition hover:border-indigo-300 hover:bg-indigo-50 lg:flex"
          >
            <MapPin className="h-3.5 w-3.5 text-indigo-600" />
            <span className="max-w-[140px] truncate font-medium text-slate-700">
              {locationLabel}
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden flex-1 md:block">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="desktop-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands, categories..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-24 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
              >
                Search
              </button>
            </div>
          </form>

          {/* Right controls */}
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => router.push("/cart")}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden sm:block">Cart</span>
            </button>

            {/* User dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen((v) => !v)}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:block">
                  {user ? `Hi, ${user.name?.split(" ")[0]}` : "Login"}
                </span>
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
                  >
                    {user ? (
                      user.role === "seller" ? (
                        <>
                          <div className="border-b border-slate-100 px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Seller</p>
                            <p className="truncate text-sm font-semibold text-slate-800">{user.storeName}</p>
                          </div>
                          <Link href="/seller/status" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50">Check Status</Link>
                          <Link href="/seller/dashboard" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50">My Store</Link>
                          <button onClick={() => { setIsDropdownOpen(false); handleLogout(); }} disabled={isLoggingOut} className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-50">
                            {isLoggingOut ? "Signing out..." : "Logout"}
                          </button>
                        </>
                      ) : (
                        <>
                          <Link href="/profile" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50">Profile</Link>
                          <Link href="/wishlist" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50">Wishlist</Link>
                          <Link href="/orders" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50">Orders</Link>
                          <div className="border-t border-slate-100" />
                          <button onClick={() => { setIsDropdownOpen(false); handleLogout(); }} disabled={isLoggingOut} className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-50">
                            {isLoggingOut ? "Signing out..." : "Logout"}
                          </button>
                        </>
                      )
                    ) : (
                      <>
                        <Link href="/login" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50">Login</Link>
                        <Link href="/register/buyer" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50">Sign Up as Buyer</Link>
                        <div className="border-t border-slate-100" />
                        <Link href="/register/seller" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50">Become a Seller</Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Category strip */}
        <div className="border-t border-slate-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex gap-1 overflow-x-auto py-2.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/search?category=${cat.slug}`}
                  className="group flex shrink-0 items-center gap-2 rounded-full border border-transparent px-4 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${cat.color}`}
                  >
                    <cat.icon className="h-3 w-3 text-white" />
                  </div>
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-slate-100 bg-white"
            >
              <div className="space-y-4 p-4">
                {/* Mobile location chip */}
                <button
                  onClick={() => { openAddressModal(); setIsMobileMenuOpen(false); }}
                  className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                >
                  <MapPin className="h-4 w-4 text-indigo-600" />
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Deliver to</span>
                    <span className="font-semibold text-slate-800">{locationLabel}</span>
                  </div>
                </button>

                {/* Mobile search */}
                <form onSubmit={(e) => { handleSearch(e); setIsMobileMenuOpen(false); }}>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="mobile-search-input"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </form>

                {/* Mobile categories */}
                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Categories</p>
                  <div className="grid grid-cols-4 gap-3">
                    {CATEGORIES.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/search?category=${cat.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex flex-col items-center gap-2 text-center"
                      >
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${cat.color} shadow-sm`}
                        >
                          <cat.icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-[10px] font-medium text-slate-600">{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── LOCATION MODAL ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {isLocationModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 16 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <h2 className="text-lg font-bold text-slate-900">
                  {modalView === "list"
                    ? "Delivery Location"
                    : formData._id || formData.id
                    ? "Edit Address"
                    : "Add New Address"}
                </h2>
                <button
                  onClick={() => setIsLocationModalOpen(false)}
                  className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6">
                {modalView === "list" ? (
                  <div className="space-y-4">
                    {/* Use GPS option */}
                    <button
                      onClick={() => {
                        requestGeolocation();
                        setIsLocationModalOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-2xl border-2 border-indigo-200 bg-indigo-50 px-4 py-3.5 text-sm font-semibold text-indigo-700 transition hover:border-indigo-400 hover:bg-indigo-100"
                    >
                      <Navigation className="h-5 w-5 shrink-0" />
                      <div className="flex flex-col items-start">
                        <span>Use Current Location</span>
                        {geoState === "requesting" && (
                          <span className="text-[11px] font-normal text-indigo-500">Detecting...</span>
                        )}
                        {geoState === "granted" && geoCity && (
                          <span className="text-[11px] font-normal text-indigo-500">
                            {"\uD83D\uDCCD"} {geoCity}
                          </span>
                        )}
                        {geoState === "denied" && (
                          <span className="text-[11px] font-normal text-red-500">Location permission denied</span>
                        )}
                      </div>
                    </button>

                    {/* Saved addresses */}
                    <div className="max-h-64 space-y-3 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden">
                      {addresses.length === 0 ? (
                        <p className="py-4 text-center text-sm text-slate-500">No saved addresses yet.</p>
                      ) : (
                        addresses.map((addr) => (
                          <div
                            key={addr._id || addr.id}
                            onClick={() => handleSelectAddress((addr._id || addr.id) as string)}
                            className={`relative cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                              activeAddressId === (addr._id || addr.id)
                                ? "border-indigo-500 bg-indigo-50"
                                : "border-slate-200 bg-slate-50 hover:border-slate-300"
                            }`}
                          >
                            {activeAddressId === (addr._id || addr.id) && (
                              <div className="absolute right-3 top-3 rounded-full bg-indigo-600 p-0.5">
                                <Check className="h-3.5 w-3.5 text-white" />
                              </div>
                            )}
                            <p className="pr-6 font-semibold text-slate-900">{addr.name}</p>
                            <p className="mt-0.5 text-sm text-slate-500">{addr.street}</p>
                            <p className="text-sm text-slate-500">
                              {addr.city}, {addr.state} {addr.pincode}
                            </p>
                            <div className="mt-3 flex gap-3 text-xs">
                              <button
                                onClick={(e) => startEditAddress(e, addr)}
                                className="flex items-center gap-1 font-medium text-slate-500 transition hover:text-indigo-600"
                              >
                                <Pencil className="h-3 w-3" /> Edit
                              </button>
                              <span className="text-slate-300">|</span>
                              <button
                                onClick={(e) =>
                                  handleDeleteAddress(e, (addr._id || addr.id) as string)
                                }
                                className="flex items-center gap-1 font-medium text-slate-500 transition hover:text-red-500"
                              >
                                <Trash2 className="h-3 w-3" /> Delete
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setFormData({ name: "", street: "", city: "", state: "", pincode: "", phone: "" });
                        setModalView("form");
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600"
                    >
                      <Plus className="h-4 w-4" /> Add New Address
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSaveAddress} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
                        <input
                          type="text"
                          value={formData.phone || ""}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="9876543210"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Street Address</label>
                      <input
                        type="text"
                        required
                        value={formData.street}
                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="123 Main Street, Apt 4B"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "City", key: "city", placeholder: "Mumbai" },
                        { label: "State", key: "state", placeholder: "MH" },
                        { label: "Pincode", key: "pincode", placeholder: "400001" },
                      ].map(({ label, key, placeholder }) => (
                        <div key={key}>
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
                          <input
                            type="text"
                            required
                            value={(formData as any)[key]}
                            onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            placeholder={placeholder}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() =>
                          addresses.length > 0
                            ? setModalView("list")
                            : setIsLocationModalOpen(false)
                        }
                        className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isAddressLoading}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                      >
                        {isAddressLoading && (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        )}
                        {formData._id || formData.id ? "Update Address" : "Save Address"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-[120px] pb-8 sm:pt-[128px]">
        {/* Background blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-100/60 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-purple-100/60 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
            {/* Hero copy */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex flex-col justify-center"
            >
              {/* Location status pill */}
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-700">
                {geoState === "granted" ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]" />
                    Showing products near {geoCity || "you"}
                  </>
                ) : geoState === "requesting" ? (
                  <>
                    <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
                    Detecting your location...
                  </>
                ) : (
                  <>
                    <MapPin className="h-3.5 w-3.5" />
                    Hyperlocal marketplace
                  </>
                )}
              </div>

              <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl lg:text-6xl">
                Shop local.{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Delivered fast.
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Discover products from verified sellers near you. Real-time hyperlocal filtering means
                you only see what can actually reach your door.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/40"
                >
                  <Search className="h-4 w-4" /> Explore Products
                </Link>
                {geoState !== "granted" && (
                  <button
                    onClick={requestGeolocation}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50"
                  >
                    <Navigation className="h-4 w-4 text-indigo-600" />
                    {geoState === "requesting" ? "Detecting..." : "Enable Location"}
                  </button>
                )}
                <Link
                  href="/register/seller"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50"
                >
                  <Store className="h-4 w-4 text-indigo-600" /> Become a Seller
                </Link>
              </div>

              {/* Stats row */}
              <div className="mt-10 flex flex-wrap gap-6">
                {[
                  { label: "Live Products", value: `${homeProducts.length}+` },
                  { label: "Local Sellers", value: "Verified" },
                  { label: "Delivery", value: "Same Day" },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col">
                    <span className="text-2xl font-extrabold text-slate-900">{stat.value}</span>
                    <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Spotlight product cards */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="grid grid-cols-2 gap-4"
            >
              {homeProductsLoading && !outOfRange
                ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
                : nearbyProducts.map((p) => <ProductCard key={p._id} product={p} />)}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── LOCATION BANNER ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {(locationUsed || geoState === "granted") && !outOfRange && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-4 mb-4 sm:mx-6 lg:mx-8"
          >
            <div className="mx-auto max-w-7xl">
              <div className="flex items-center justify-between rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
                    <MapPin className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-indigo-900">
                      Showing products near {geoCity || activeAddress?.city || "your location"}
                    </p>
                    <p className="text-xs text-indigo-600">
                      within 10km radius &middot; only from verified local sellers
                    </p>
                  </div>
                </div>
                <button
                  onClick={requestGeolocation}
                  className="ml-4 shrink-0 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-700"
                >
                  Refresh
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── OUT-OF-RANGE STATE ────────────────────────────────────────────── */}
      <AnimatePresence>
        {outOfRange && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="mx-4 mb-6 sm:mx-6 lg:mx-8"
          >
            <div className="mx-auto max-w-7xl">
              <div className="overflow-hidden rounded-3xl border border-amber-200 bg-amber-50">
                <div className="p-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                    <AlertCircle className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold text-amber-900">No sellers near you yet</h3>
                  <p className="mt-2 text-amber-700">
                    We could not find any sellers within 10km of your current location. Try expanding
                    your search or browse all products.
                  </p>
                  <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                    <button
                      onClick={() => fetchHomeProducts(null)}
                      className="flex items-center gap-2 rounded-2xl bg-amber-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-amber-700"
                    >
                      <Package className="h-4 w-4" /> Browse All Products
                    </button>
                    <button
                      onClick={requestGeolocation}
                      className="flex items-center gap-2 rounded-2xl border-2 border-amber-300 px-6 py-3 text-sm font-bold text-amber-800 transition hover:bg-amber-100"
                    >
                      <RefreshCw className="h-4 w-4" /> Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── MAIN CONTENT ─────────────────────────────────────────────────── */}
      {!outOfRange && (
        <div className="mx-auto max-w-7xl space-y-12 px-4 pb-12 sm:px-6 lg:px-8">

          {/* Error state */}
          {homeProductsError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700">
              {homeProductsError}
            </div>
          )}

          {/* ── Featured Products ── */}
          <section>
            <div className="mb-6 flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {locationUsed && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                      <MapPin className="h-3 w-3" /> Near You
                    </span>
                  )}
                  <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                    {locationUsed ? "Fresh from Local Sellers" : "Featured Products"}
                  </h2>
                </div>
                <p className="mt-1.5 text-sm text-slate-500">
                  {locationUsed
                    ? `Newly added by sellers near ${geoCity || "you"}`
                    : "Newest additions across all categories"}
                </p>
              </div>
              <Link
                href="/search"
                className="flex items-center gap-1 text-sm font-bold text-indigo-600 transition hover:text-indigo-800"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {homeProductsLoading
                ? Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)
                : featuredProducts.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </section>

          {/* ── AI Recommendations (from remote) ── */}
          {user && (
            <RecommendedSection
              userId={user._id || user.id}
              title="Recommended for You"
              limit={8}
            />
          )}

          {/* ── Category Showcase ── */}
          <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-8 shadow-xl sm:p-10">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Shop by Category</h2>
              <p className="mt-2 text-indigo-200">Explore our full range of local product categories</p>
            </div>
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
              {CATEGORIES.map((cat, i) => (
                <motion.div
                  key={cat.slug}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <Link
                    href={`/search?category=${cat.slug}`}
                    className="group flex flex-col items-center gap-3 rounded-2xl p-4 transition hover:bg-white/10"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 shadow-lg ring-1 ring-white/20 transition group-hover:bg-white/25">
                      <cat.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-center text-xs font-semibold text-white/90">{cat.name}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── Trending & Deals ── */}
          <div className="grid gap-8 lg:grid-cols-2">
            {[
              {
                IconComp: TrendingUp,
                color: "text-rose-500",
                title: "Trending Near Buyers",
                sub: "Most popular products from local seller listings",
                products: trendingProducts,
              },
              {
                IconComp: Tag,
                color: "text-amber-500",
                title: "Best Deals Today",
                sub: "Discounted picks with great value pricing",
                products: dealProducts.length > 0 ? dealProducts : featuredProducts,
              },
            ].map((section) => (
              <section
                key={section.title}
                className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <section.IconComp className={`h-5 w-5 ${section.color}`} />
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900">{section.title}</h2>
                      <p className="text-xs text-slate-500">{section.sub}</p>
                    </div>
                  </div>
                  <Link
                    href="/search"
                    className="text-xs font-bold text-indigo-600 transition hover:text-indigo-800"
                  >
                    See more
                  </Link>
                </div>
                <div className="space-y-3">
                  {homeProductsLoading
                    ? Array.from({ length: 4 }).map((_, i) => <ListSkeleton key={i} />)
                    : section.products.slice(0, 5).map((p) => (
                        <Link
                          key={p._id}
                          href={`/product/${p._id}`}
                          className="group flex gap-4 rounded-2xl border border-slate-100 p-3 transition hover:border-indigo-200 hover:bg-indigo-50/50"
                        >
                          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-indigo-50">
                            {p.mainImage || p.images?.[0] ? (
                              <img
                                src={p.mainImage || p.images![0]}
                                alt={p.name}
                                className="h-full w-full object-cover transition group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <ShoppingBag className="h-7 w-7 text-slate-300" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1 py-1">
                            <p className="line-clamp-1 text-sm font-bold text-slate-900">{p.name}</p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {p.category?.name || p.brand || "General"}
                            </p>
                            <div className="mt-2 flex items-center justify-between">
                              <p className="text-sm font-bold text-indigo-600">{formatPrice(p.price)}</p>
                              {p.distanceMeters !== undefined ? (
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                                  {formatDistance(p.distanceMeters)}
                                </span>
                              ) : (
                                p.deliveryTime && (
                                  <span className="text-[10px] text-slate-400">{p.deliveryTime}</span>
                                )
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                </div>
              </section>
            ))}
          </div>

          {/* ── Explore More ── */}
          <section>
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Explore More</h2>
                <p className="mt-1.5 text-sm text-slate-500">
                  Discover more products from trusted local sellers
                </p>
              </div>
              <Link
                href="/search"
                className="flex items-center gap-1 text-sm font-bold text-indigo-600 transition hover:text-indigo-800"
              >
                Browse all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {homeProductsLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm"
                    >
                      <div className="aspect-[16/10] animate-pulse bg-slate-100" />
                      <div className="space-y-3 p-5">
                        <div className="h-3 w-24 animate-pulse rounded-full bg-slate-100" />
                        <div className="h-5 w-4/5 animate-pulse rounded-full bg-slate-100" />
                        <div className="h-3 w-full animate-pulse rounded-full bg-slate-100" />
                        <div className="h-5 w-28 animate-pulse rounded-full bg-slate-100" />
                      </div>
                    </div>
                  ))
                : exploreProducts.map((p) => (
                    <Link
                      key={p._id}
                      href={`/product/${p._id}`}
                      className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
                    >
                      <div className="aspect-[16/10] overflow-hidden bg-gradient-to-br from-slate-100 to-indigo-50">
                        {p.mainImage || p.images?.[0] ? (
                          <img
                            src={p.mainImage || p.images![0]}
                            alt={p.name}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <ShoppingBag className="h-12 w-12 text-slate-300" />
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[11px] font-bold uppercase tracking-wide text-indigo-600">
                            {p.category?.name || p.brand || "Seller Product"}
                          </span>
                          {p.distanceMeters !== undefined ? (
                            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600">
                              {formatDistance(p.distanceMeters)}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">
                              {p.deliveryTime || "Same Day"}
                            </span>
                          )}
                        </div>
                        <h3 className="mt-2 line-clamp-1 text-base font-bold text-slate-900">{p.name}</h3>
                        <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-slate-500">
                          {p.shortDescription ||
                            "Click to view full details, seller info, and buying options."}
                        </p>
                        <div className="mt-4 flex items-end justify-between">
                          <div>
                            <p className="text-xl font-extrabold text-slate-900">
                              {formatPrice(p.price)}
                            </p>
                            {(p.mrp ?? p.price) > p.price && (
                              <p className="text-xs text-slate-400 line-through">
                                {formatPrice(p.mrp!)}
                              </p>
                            )}
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                              p.stock > 0
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                          </span>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                          <span className="truncate">{p.vendor?.storeName || "VendorHub Seller"}</span>
                          <span>{p.vendor?.city || "Local"}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
            </div>
          </section>
        </div>
      )}

      {/* ─── FEATURES (always visible) ────────────────────────────────────── */}
      <section className="border-t border-slate-100 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Why VendorHub?</h2>
            <p className="mt-3 text-lg text-slate-500">The smarter way to shop from your neighborhood</p>
          </motion.div>

          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                className="group rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition hover:border-indigo-200 hover:shadow-lg"
              >
                <div
                  className={`mb-5 inline-flex rounded-2xl bg-gradient-to-br ${f.color} p-4 shadow-md`}
                >
                  <f.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-500">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="bg-[#f8fafc] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">How It Works</h2>
            <p className="mt-3 text-lg text-slate-500">
              Three simple steps to get what you need, locally
            </p>
          </motion.div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                icon: Navigation,
                title: "Set Your Location",
                desc: "Share your location or add a delivery address to discover sellers near you.",
              },
              {
                step: "02",
                icon: ShoppingCart,
                title: "Browse & Add to Cart",
                desc: "Only products that can deliver to your area are shown — no surprises.",
              },
              {
                step: "03",
                icon: Truck,
                title: "Fast Local Delivery",
                desc: "Your order ships from the nearest verified seller, often same-day.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className="relative rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
                  <span className="mb-4 inline-block text-5xl font-extrabold text-slate-100">
                    {item.step}
                  </span>
                  <div className="mb-4 inline-flex rounded-2xl bg-indigo-50 p-3.5">
                    <item.icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-500">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-12 text-center shadow-2xl"
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
              <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full border border-white/10" />
              <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full border border-white/10" />
            </div>
            <div className="relative">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Join VendorHub Today</h2>
              <p className="mt-3 text-lg text-indigo-200">
                The future of local commerce is here. Start shopping or start selling.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link href="/register/buyer">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="rounded-2xl bg-white px-8 py-4 text-sm font-bold text-indigo-700 shadow-lg transition hover:bg-indigo-50"
                  >
                    Sign Up as Buyer
                  </motion.button>
                </Link>
                <Link href="/register/seller">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="rounded-2xl border-2 border-white/30 bg-white/10 px-8 py-4 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
                  >
                    Start Selling
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600">
                  <Store className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">
                  Vendor<span className="text-indigo-600">Hub</span>
                </span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-7 text-slate-500">
                Empowering local sellers and connecting nearby buyers through AI-powered hyperlocal
                commerce.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Quick Links</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {["About", "Contact", "Privacy Policy", "Terms of Service"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-slate-500 transition hover:text-indigo-600">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Connect</h3>
              <div className="mt-4 flex gap-3">
                {[
                  { icon: MessageCircle, label: "Chat" },
                  { icon: Mail, label: "Email" },
                  { icon: Share2, label: "Share" },
                  { icon: ExternalLink, label: "External" },
                ].map(({ icon: Icon, label }) => (
                  <motion.a
                    key={label}
                    whileHover={{ scale: 1.1 }}
                    href="#"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-indigo-100 hover:text-indigo-600"
                  >
                    <Icon className="h-4 w-4" />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-10 border-t border-slate-100 pt-8 text-center text-sm text-slate-400">
            &copy; 2026 VendorHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
