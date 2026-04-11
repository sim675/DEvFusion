"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Store,
  Zap,
  ShoppingCart,
  Truck,
  User,
  TrendingUp,
  Shield,
  Sparkles,
  Search,
  DollarSign,
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
} from "lucide-react";

type Address = { 
  _id?: string; 
  id?: string; // for compatibility
  name: string; 
  phone?: string; 
  street: string; 
  city: string; 
  state: string; 
  pincode: string; 
  isDefault?: boolean;
};

const categories = [
  { name: "Fashion", icon: Shirt, slug: "fashion" },
  { name: "Mobiles", icon: Smartphone, slug: "mobiles" },
  { name: "Beauty", icon: Sparkles, slug: "beauty" },
  { name: "Electronics", icon: Monitor, slug: "electronics" },
  { name: "Home", icon: HomeIcon, slug: "home" },
  { name: "Appliances", icon: Tv, slug: "appliances" },
  { name: "Toys", icon: Gamepad2, slug: "toys" },
  { name: "Food", icon: Utensils, slug: "food" },
  { name: "Auto", icon: Car, slug: "auto" },
  { name: "Sports", icon: Bike, slug: "sports" },
  { name: "Books", icon: Book, slug: "books" },
  { name: "Furniture", icon: Armchair, slug: "furniture" },
];

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Multiple addresses state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [activeAddressId, setActiveAddressId] = useState<string | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [modalView, setModalView] = useState<"list" | "form">("list");
  const [formData, setFormData] = useState<Address>({ name: "", street: "", city: "", state: "", pincode: "", phone: "" });

  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- SEARCH ---
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    // Build search URL — include active address coords if available
    const activeAddr = addresses.find(a => (a._id || a.id) === activeAddressId);
    const params = new URLSearchParams({ q });
    // If the active address has coordinates stored (future enhancement), pass them.
    // For now we navigate with just the keyword; the /search page will
    // request the user's browser geolocation for hyperlocal results.
    router.push(`/search?${params.toString()}`);
  };

  const fetchAddresses = async () => {
    if (!user) return;
    setIsAddressLoading(true);
    try {
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses);
        // Set active address as the one where isDefault is true
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
  };

  useEffect(() => {
    if (user) {
      fetchAddresses();
    } else {
      setAddresses([]);
      setActiveAddressId(null);
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
        alert(errorData.error || "Failed to save address. Please check all fields.");
      }
    } catch (err) {
      console.error("Error saving address:", err);
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
      if (res.ok) {
        await fetchAddresses();
      }
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
      router.push("/");
      return;
    }
    setModalView(addresses.length > 0 ? "list" : "form");
    if (addresses.length === 0) {
      setFormData({ name: "", street: "", city: "", state: "", pincode: "", phone: "" });
    }
    setIsLocationModalOpen(true);
  };

  const activeAddress = addresses.find(a => (a._id || a.id) === activeAddressId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) { }
    }
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (user?.role === "seller") {
        await fetch("/api/seller/logout", { method: "POST" });
      } else {
        await fetch("/api/auth/logout", { method: "POST" });
      }
    } catch (_) {
      // best-effort – still clear client state
    } finally {
      localStorage.removeItem("user");
      setUser(null);
      setIsLoggingOut(false);
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* Navbar Section */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 transition-all font-sans">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-6">
              <div className="flex items-center gap-2">
                <button
                  aria-label="Toggle mobile menu"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden mr-2 rounded-md p-1 text-slate-600 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-400 transition-colors"
                >
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
                <div 
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => router.push("/")}
                >
                  <Store className="h-8 w-8 text-blue-600" />
                  <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    VendorHub
                  </span>
                </div>
              </div>

              {/* Desktop Location Selector */}
              <div 
                onClick={openAddressModal}
                className="hidden lg:flex items-center gap-1.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-1.5 rounded-lg transition-colors"
              >
                <MapPin className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                <div className="flex flex-col">
                  <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 leading-tight">Deliver to {activeAddress?.name || ""}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {activeAddress ? `${activeAddress.city} ${activeAddress.pincode}`.trim() : "Select Location"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-1 mx-4 hidden md:flex">
              <form onSubmit={handleSearch} className="w-full">
                <div className="w-full relative">
                  <input
                    id="desktop-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for Products, Brands and More"
                    className="w-full rounded-full border border-slate-300 px-5 py-2 pl-10 pr-20 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <button
                    type="submit"
                    className="absolute right-2 top-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => router.push("/cart")}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-full dark:text-slate-300 dark:hover:bg-slate-800 transition"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="hidden sm:block">Cart</span>
              </button>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:block">
                    {user ? `Hi, ${user.name}` : "Login"}
                  </span>
                </button>

                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white/90 backdrop-blur-md shadow-lg dark:border-slate-800 dark:bg-slate-950/90 py-2 z-50 overflow-hidden"
                  >
                    {user ? (
                      user.role === "seller" ? (
                        // ── Seller dropdown ──────────────────────
                        <>
                          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Seller Account</p>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{user.storeName}</p>
                          </div>
                          <Link
                            href="/seller/status"
                            onClick={() => setIsDropdownOpen(false)}
                            className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                          >
                            Check Status
                          </Link>
                          <Link
                            href="/seller/dashboard"
                            onClick={() => setIsDropdownOpen(false)}
                            className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                          >
                            My Store
                          </Link>
                          <button
                            onClick={() => { setIsDropdownOpen(false); handleLogout(); }}
                            disabled={isLoggingOut}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 disabled:opacity-50 transition-colors"
                          >
                            {isLoggingOut ? "Signing out…" : "Logout"}
                          </button>
                        </>
                      ) : (
                        <>
                          <Link href="/profile" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
                            Profile
                          </Link>
                          <Link href="/wishlist" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
                            Wishlist
                          </Link>
                          <Link href="/orders" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
                            Orders
                          </Link>
                          <button
                            onClick={() => { setIsDropdownOpen(false); handleLogout(); }}
                            disabled={isLoggingOut}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 disabled:opacity-50 transition-colors"
                          >
                            {isLoggingOut ? "Signing out…" : "Logout"}
                          </button>
                        </>
                      )
                    ) : (
                      <>
                        <Link href="/login" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
                          Login
                        </Link>
                        <Link href="/register/buyer" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
                          Sign Up
                        </Link>
                        <Link href="/register/seller" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
                          Become a Seller
                        </Link>
                      </>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Category Bar */}
        <div className="hidden md:block bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex overflow-x-auto py-2.5 gap-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className="flex flex-col items-center gap-1 min-w-max group outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md"
                  aria-label={`Go to ${category.name} category`}
                >
                  <div className="transition-transform group-hover:-translate-y-1">
                    <category.icon className="h-5 w-5 text-slate-500 group-hover:text-blue-600 dark:text-slate-400 dark:group-hover:text-blue-400 transition-colors" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 group-hover:text-blue-600 dark:text-slate-400 dark:group-hover:text-blue-400 transition-colors tracking-wide">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 backdrop-blur-xl dark:bg-slate-950/95 overflow-y-auto max-h-[calc(100vh-64px)] shadow-2xl"
          >
            <div className="px-4 py-4 space-y-6">
              {/* Mobile Location Selector */}
              <div 
                onClick={() => { openAddressModal(); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div className="flex flex-col flex-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-none">Deliver to {activeAddress?.name || ""}</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                    {activeAddress ? `${activeAddress.city} ${activeAddress.pincode}`.trim() : "Select your location"}
                  </span>
                </div>
              </div>

              {/* Mobile Search */}
              <form onSubmit={(e) => { handleSearch(e); setIsMobileMenuOpen(false); }} className="w-full">
                <div className="w-full relative">
                  <input
                    id="mobile-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full rounded-full border border-slate-300 px-5 py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white shadow-sm"
                  />
                  <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                  <button
                    type="submit"
                    className="absolute right-3 top-2.5 rounded-full bg-blue-600 p-1.5 text-white hover:bg-blue-700 transition-colors"
                    aria-label="Submit search"
                  >
                    <Search className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>

              {/* Mobile Categories Grid */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 px-1">
                  Shop by Category
                </h3>
                <div className="grid grid-cols-4 gap-x-2 gap-y-6">
                  {categories.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/category/${category.slug}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex flex-col items-center gap-2 group outline-none"
                    >
                      <div className="p-3 rounded-2xl bg-slate-50 group-hover:bg-blue-50 dark:bg-slate-800/50 dark:group-hover:bg-blue-900/50 transition-colors shadow-sm border border-slate-100 dark:border-slate-800">
                        <category.icon className="h-5 w-5 text-slate-600 group-hover:text-blue-600 dark:text-slate-400 dark:group-hover:text-blue-400 transition-colors" />
                      </div>
                      <span className="text-[10px] font-semibold text-center text-slate-500 group-hover:text-blue-600 dark:text-slate-400 dark:group-hover:text-blue-400 leading-tight">
                        {category.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </nav>

      {/* Location Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {modalView === "list" ? "Select Delivery Location" : formData.id ? "Edit Address" : "Add New Address"}
              </h2>
              <button 
                onClick={() => setIsLocationModalOpen(false)} 
                className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {modalView === "list" ? (
              <div className="space-y-4">
                <div className="max-h-60 overflow-y-auto space-y-3 pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {addresses.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm">
                      No saved addresses. Please add one.
                    </div>
                  ) : (
                    addresses.map((addr) => (
                      <div 
                        key={addr._id || addr.id}
                        onClick={() => handleSelectAddress((addr._id || addr.id) as string)}
                        className={`relative p-4 rounded-xl border cursor-pointer transition-all ${
                          activeAddressId === (addr._id || addr.id)
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800/50"
                        }`}
                      >
                        {activeAddressId === (addr._id || addr.id) && (
                          <div className="absolute top-3 right-3 text-blue-600 dark:text-blue-400">
                            <Check className="h-5 w-5" />
                          </div>
                        )}
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-1 pr-6">{addr.name}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{addr.street}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{addr.city}, {addr.state} {addr.pincode}</p>
                        {addr.phone && <p className="text-[11px] text-slate-500 mt-1">📞 {addr.phone}</p>}
                        
                        <div className="flex gap-2 mt-3 text-sm">
                          <button 
                            onClick={(e) => startEditAddress(e, addr)}
                            disabled={isAddressLoading}
                            className="flex items-center gap-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
                          >
                            <Pencil className="h-3 w-3" /> Edit
                          </button>
                          <span className="text-slate-300 dark:text-slate-600">|</span>
                          <button 
                            onClick={(e) => handleDeleteAddress(e, (addr._id || addr.id) as string)}
                            disabled={isAddressLoading}
                            className="flex items-center gap-1 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
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
                  disabled={isAddressLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-all disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" /> Add New Address
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveAddress} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone (Optional)</label>
                    <input
                      type="text"
                      value={formData.phone || ""}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                      placeholder="9876543210"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                    placeholder="123 Main St, Apt 4B"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                      placeholder="Mumbai"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                      placeholder="MH"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pincode</label>
                    <input
                      type="text"
                      required
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                      placeholder="400001"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    disabled={isAddressLoading}
                    onClick={() => addresses.length > 0 ? setModalView("list") : setIsLocationModalOpen(false)}
                    className="flex-1 rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAddressLoading}
                    className="flex-1 rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:bg-blue-400 flex items-center justify-center gap-2"
                  >
                    {isAddressLoading ? (
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : null}
                    {formData._id || formData.id ? "Update Address" : "Save Address"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-32 pb-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10" />
        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Empowering Local Sellers,{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Connecting Nearby Buyers
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300 sm:text-xl md:max-w-3xl md:mx-auto">
              Discover products from local vendors near you with AI-powered
              recommendations
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl"
              >
                Start Shopping
              </motion.button>
              <Link href="/register/seller">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full border-2 border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-900 shadow-lg transition-all hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                >
                  Become a Seller
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Floating Card Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[
              { name: "Fresh Organic Produce", price: "$12.99", vendor: "Local Farm" },
              { name: "Handcrafted Jewelry", price: "$45.00", vendor: "Artisan Studio" },
              { name: "Homemade Cookies", price: "$8.50", vendor: "Sweet Treats" },
            ].map((product, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -8 }}
                className="rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800"
              >
                <div className="mb-4 h-32 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900" />
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {product.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {product.vendor}
                </p>
                <p className="mt-2 text-lg font-bold text-blue-600 dark:text-blue-400">
                  {product.price}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Why Choose VendorHub?
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Everything you need for a seamless local shopping experience
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: ShoppingBag,
                title: "Multi-Vendor Marketplace",
                description:
                  "Shop from hundreds of local sellers in one convenient platform",
              },
              {
                icon: Sparkles,
                title: "AI Smart Recommendations",
                description:
                  "Get personalized product suggestions based on your preferences",
              },
              {
                icon: Zap,
                title: "Fast Hyperlocal Delivery",
                description:
                  "Quick delivery from sellers in your neighborhood",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="rounded-2xl bg-white p-8 shadow-lg transition-all dark:bg-slate-800"
              >
                <div className="mb-4 inline-flex rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 p-4 text-white">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Three simple steps to get what you need
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: ShoppingCart,
                step: "Step 1",
                title: "Browse Products",
                description:
                  "Explore a wide range of products from local vendors in your area",
              },
              {
                icon: ShoppingCart,
                step: "Step 2",
                title: "Add to Cart",
                description:
                  "Select your favorite items and add them to your cart",
              },
              {
                icon: Truck,
                step: "Step 3",
                title: "Fast Delivery",
                description:
                  "Get your products delivered quickly from nearby sellers",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="rounded-2xl bg-white p-8 shadow-lg dark:bg-slate-800">
                  <div className="mb-4 inline-flex rounded-full bg-gradient-to-br from-blue-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white">
                    {item.step}
                  </div>
                  <div className="mb-4 inline-flex rounded-2xl bg-slate-100 p-4 dark:bg-slate-700">
                    <item.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-slate-600 dark:text-slate-400">
                    {item.description}
                  </p>
                </div>
                {index < 2 && (
                  <div className="hidden md:absolute left-1/2 top-1/2 -translate-y-1/2 translate-x-8 text-slate-300 dark:text-slate-600">
                    <Zap className="h-6 w-6" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-Based Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Built for Everyone
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Whether you're buying, selling, or managing
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: User,
                title: "Buyer",
                description:
                  "Shop easily with smart filters, real-time tracking, and secure payments",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: TrendingUp,
                title: "Seller",
                description:
                  "Manage products, track orders, and grow your revenue with analytics",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: Shield,
                title: "Admin",
                description:
                  "Control the platform, monitor performance, and access detailed analytics",
                color: "from-purple-500 to-pink-500",
              },
            ].map((role, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="rounded-2xl bg-white p-8 shadow-lg transition-all dark:bg-slate-800"
              >
                <div className={`mb-4 inline-flex rounded-2xl bg-gradient-to-br ${role.color} p-4 text-white`}>
                  <role.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {role.title}
                </h3>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                  {role.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Highlight Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20" />
        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="mb-4 inline-flex rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white">
              <Sparkles className="mr-2 h-4 w-4" />
              Powered by Smart AI
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Intelligence at Your Fingertips
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Our AI makes shopping smarter and selling easier
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: "Personalized Recommendations",
                description:
                  "AI learns your preferences to suggest products you'll love",
              },
              {
                icon: Search,
                title: "Smart Search",
                description:
                  "Fuzzy matching and intelligent search find what you need instantly",
              },
              {
                icon: DollarSign,
                title: "Price Suggestions",
                description:
                  "Get competitive pricing insights to maximize your sales",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-xl dark:bg-slate-800/80"
              >
                <div className="mb-4 inline-flex rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 p-4 text-white">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-12 text-center shadow-2xl"
          >
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Join VendorHub Today
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Start your journey with the future of local commerce
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/register/buyer">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full bg-white px-8 py-4 text-base font-semibold text-blue-600 shadow-lg transition-all hover:bg-blue-50"
                >
                  Sign Up
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-full border-2 border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                Explore Marketplace
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-12 dark:border-slate-800 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2">
                <Store className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  VendorHub
                </span>
              </div>
              <p className="mt-4 text-slate-600 dark:text-slate-400">
                Empowering local sellers and connecting nearby buyers through
                AI-powered commerce.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Quick Links
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Follow Us
              </h3>
              <div className="mt-4 flex gap-4">
                {[
                  { icon: MessageCircle, href: "#", label: "Chat" },
                  { icon: Mail, href: "#", label: "Email" },
                  { icon: Share2, href: "#", label: "Share" },
                  { icon: ExternalLink, href: "#", label: "External" },
                ].map((social, index) => (
                  <motion.a
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    href={social.href}
                    aria-label={social.label}
                    className="rounded-full bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-blue-100 hover:text-blue-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-blue-900 dark:hover:text-blue-400"
                  >
                    <social.icon className="h-5 w-5" />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-slate-200 pt-8 text-center text-slate-600 dark:border-slate-800 dark:text-slate-400">
            <p>&copy; 2026 VendorHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}