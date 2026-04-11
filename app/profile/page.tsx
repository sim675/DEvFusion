"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, ArrowLeft, Save, Loader2, CheckCircle2, AlertCircle, Pencil, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to load profile");
        }
        const data = await res.json();
        setFormData({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);
    
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      // Update local storage too to keep it in sync
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        user.name = data.user.name;
        user.email = data.user.email;
        user.phone = data.user.phone;
        localStorage.setItem("user", JSON.stringify(user));
      }

      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07050f] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-violet-500" />
        <p className="text-slate-400 font-medium animate-pulse">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07050f] text-white">
      {/* Navigation */}
      <div className="sticky top-0 z-50 bg-[#07050f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Back to Market</span>
          </Link>
          <h1 className="text-lg font-bold tracking-tight">Your Profile</h1>
          <div className="w-20"></div> {/* Spacer */}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
        >
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-violet-600/10 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full" />

          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-10">
              <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-xl shadow-violet-500/20">
                <User className="h-10 w-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Profile Details</h2>
                <p className="text-slate-400 text-sm">View and manage your buyer account information.</p>
              </div>
            </div>

            {!isEditing ? (
              <div className="space-y-5">
                <div className="grid gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl bg-violet-500/10 p-3 text-violet-400">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Full Name</p>
                        <p className="mt-1 text-lg font-semibold text-white">{formData.name || "Not set"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-400">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Email Address</p>
                        <p className="mt-1 text-lg font-semibold text-white break-all">{formData.email || "Not set"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-400">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Phone Number</p>
                        <p className="mt-1 text-lg font-semibold text-white">{formData.phone || "Not added yet"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setSuccess(false);
                      setIsEditing(true);
                    }}
                    className="w-full flex items-center justify-center gap-3 bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-violet-500/20 active:scale-[0.98] transition-all"
                  >
                    <Pencil className="h-5 w-5" />
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                  <div className="group relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors">
                      <User className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                  <div className="group relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                  <div className="group relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors">
                      <Phone className="h-5 w-5" />
                    </div>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                      placeholder="e.g. +91 98765-43210"
                    />
                  </div>
                </div>

                <div className="grid gap-3 pt-4 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setSuccess(false);
                      setIsEditing(false);
                    }}
                    className="w-full flex items-center justify-center gap-3 border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl transition-all"
                  >
                    <X className="h-5 w-5" />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-3 bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-violet-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {saving ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Save className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-emerald-400 text-sm font-medium"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Profile updated successfully!
                </motion.div>
              )}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-500 text-sm font-medium"
                >
                  <AlertCircle className="h-5 w-5" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="mt-8 flex justify-center">
            <Link href="/orders" className="text-slate-500 hover:text-white transition-colors text-sm font-medium underline underline-offset-4 decoration-white/20">
                View My Orders History
            </Link>
        </div>
      </main>
    </div>
  );
}
