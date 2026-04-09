"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Package,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const PERKS = [
  { icon: Store, text: "Open your own branded storefront" },
  { icon: Package, text: "Manage inventory with smart tools" },
  { icon: TrendingUp, text: "Reach thousands of local buyers" },
  { icon: BarChart3, text: "Real-time sales analytics dashboard" },
];

export default function SellerSignup() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: "seller" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex lg:flex-row flex-col bg-[#07050f]">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        {/* Radial glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-700/30 via-indigo-800/20 to-transparent" />
        <div className="absolute top-1/4 -left-24 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-64 h-64 rounded-full bg-indigo-600/10 blur-3xl" />

        {/* Logo */}
        <Link
          href="/"
          className="relative flex items-center gap-3 group w-fit"
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow">
            <Store className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            VendorHub
          </span>
        </Link>

        {/* Main copy */}
        <div className="relative space-y-8">
          <div>
            <p className="text-violet-400 uppercase tracking-widest text-xs font-semibold mb-3">
              Seller Account
            </p>
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight">
              Launch your
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                local store.
              </span>
            </h1>
            <p className="mt-4 text-slate-400 text-lg leading-relaxed">
              Join hundreds of local vendors already growing their business
              with VendorHub's powerful selling tools.
            </p>
          </div>

          <ul className="space-y-4">
            {PERKS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="h-9 w-9 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-violet-400" />
                </span>
                <span className="text-slate-300 text-sm">{text}</span>
              </li>
            ))}
          </ul>

          {/* Social proof */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex -space-x-2">
              {["S", "A", "R", "M"].map((letter, i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full border-2 border-[#07050f] bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white"
                >
                  {letter}
                </div>
              ))}
            </div>
            <p className="text-slate-400 text-sm">
              <span className="text-white font-semibold">500+</span> sellers joined this month
            </p>
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="relative text-slate-600 text-xs">
          © {new Date().getFullYear()} VendorHub. Empowering local commerce.
        </p>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <Link
            href="/"
            className="lg:hidden flex items-center gap-2 mb-8 w-fit"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Store className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">VendorHub</span>
          </Link>

          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-violet-400 bg-violet-400/10 border border-violet-400/20 rounded-full px-3 py-1 mb-4">
              <Store className="h-3 w-3" /> Seller Account
            </span>
            <h2 className="text-2xl font-bold text-white">Start selling today</h2>
            <p className="text-slate-500 mt-1 text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-green-500/20 bg-green-500/10 p-8 text-center"
              >
                <CheckCircle2 className="h-14 w-14 text-green-400 mx-auto mb-4" />
                <h3 className="text-white font-bold text-xl mb-2">
                  Your store is ready! 🚀
                </h3>
                <p className="text-slate-400 text-sm">
                  Seller account created. Redirecting you to login…
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Business / Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                    <input
                      id="seller-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      autoComplete="name"
                      placeholder="Alex Johnson"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500/60 focus:bg-violet-500/5 transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Business Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                    <input
                      id="seller-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      placeholder="alex@mystore.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500/60 focus:bg-violet-500/5 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                    <input
                      id="seller-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500/60 focus:bg-violet-500/5 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 pl-1">
                    Use at least 6 characters with letters and numbers.
                  </p>
                </div>

                {/* Terms notice */}
                <p className="text-xs text-slate-600 leading-relaxed">
                  By creating an account you agree to VendorHub's{" "}
                  <span className="text-slate-500 hover:text-violet-400 cursor-pointer transition-colors">
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span className="text-slate-500 hover:text-violet-400 cursor-pointer transition-colors">
                    Seller Policy
                  </span>
                  .
                </p>

                {/* Submit */}
                <motion.button
                  id="seller-signup-submit"
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.015 }}
                  whileTap={{ scale: isLoading ? 1 : 0.985 }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating seller account…
                    </>
                  ) : (
                    <>
                      Create Seller Account
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </motion.button>

                <p className="text-center text-xs text-slate-600 pt-1">
                  Signing up as a buyer?{" "}
                  <Link
                    href="/register/buyer"
                    className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
                  >
                    Buyer signup →
                  </Link>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
