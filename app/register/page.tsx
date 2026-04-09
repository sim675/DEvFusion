"use client";

import { motion, Variants } from "framer-motion";
import { ShoppingBag, Store, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const BUYER_PERKS = [
  "Browse local vendors near you",
  "AI-powered recommendations",
  "Same-day local delivery",
  "Exclusive community deals",
];

const SELLER_PERKS = [
  "Open your own storefront",
  "Manage inventory & orders",
  "Reach thousands of buyers",
  "Real-time analytics",
];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function RegisterSelect() {
  return (
    <div className="min-h-screen bg-[#0a0a12] flex flex-col items-center justify-center px-4 py-16">
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-amber-500/8 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-violet-600/8 blur-3xl" />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link href="/" className="flex items-center gap-2.5 mb-12 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-violet-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow">
            <Store className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">VendorHub</span>
        </Link>
      </motion.div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-extrabold text-white">
          How do you want to join?
        </h1>
        <p className="text-slate-500 mt-3 text-base">
          Choose your account type to get started — you can always create both.
        </p>
      </motion.div>

      {/* Cards */}
      <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
        {/* Buyer card */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Link
            id="register-as-buyer"
            href="/register/buyer"
            className="group relative flex flex-col h-full rounded-2xl border border-white/8 bg-white/3 hover:border-amber-500/30 hover:bg-amber-500/5 p-8 transition-all duration-300 overflow-hidden"
          >
            {/* Glow on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-amber-500/8 to-transparent rounded-2xl" />

            <div className="relative">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/35 transition-shadow">
                <ShoppingBag className="h-7 w-7 text-white" />
              </div>

              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-2.5 py-0.5 mb-3">
                Buyer
              </span>

              <h2 className="text-xl font-bold text-white mb-2">
                Shop Local Products
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Discover and buy products from local vendors in your
                neighbourhood with fast, community-powered delivery.
              </p>

              <ul className="space-y-2.5 mb-8">
                {BUYER_PERKS.map((perk) => (
                  <li key={perk} className="flex items-center gap-2.5 text-sm text-slate-400">
                    <CheckCircle2 className="h-4 w-4 text-amber-400 flex-shrink-0" />
                    {perk}
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex items-center gap-1.5 text-sm font-semibold text-amber-400 group-hover:gap-3 transition-all">
                Create buyer account <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Seller card */}
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Link
            id="register-as-seller"
            href="/register/seller"
            className="group relative flex flex-col h-full rounded-2xl border border-white/8 bg-white/3 hover:border-violet-500/30 hover:bg-violet-500/5 p-8 transition-all duration-300 overflow-hidden"
          >
            {/* Glow on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-violet-600/8 to-transparent rounded-2xl" />

            {/* Popular badge */}
            <span className="absolute top-5 right-5 text-xs font-bold uppercase tracking-widest text-violet-300 bg-violet-500/20 border border-violet-500/30 rounded-full px-2.5 py-1">
              Popular
            </span>

            <div className="relative">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/35 transition-shadow">
                <Store className="h-7 w-7 text-white" />
              </div>

              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-violet-400 bg-violet-400/10 border border-violet-400/20 rounded-full px-2.5 py-0.5 mb-3">
                Seller
              </span>

              <h2 className="text-xl font-bold text-white mb-2">
                Open Your Storefront
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                List your products, manage orders, and grow your local
                business with VendorHub's powerful seller tools.
              </p>

              <ul className="space-y-2.5 mb-8">
                {SELLER_PERKS.map((perk) => (
                  <li key={perk} className="flex items-center gap-2.5 text-sm text-slate-400">
                    <CheckCircle2 className="h-4 w-4 text-violet-400 flex-shrink-0" />
                    {perk}
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex items-center gap-1.5 text-sm font-semibold text-violet-400 group-hover:gap-3 transition-all">
                Create seller account <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 text-sm text-slate-600"
      >
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-slate-400 hover:text-white font-medium transition-colors"
        >
          Sign in →
        </Link>
      </motion.p>
    </div>
  );
}
