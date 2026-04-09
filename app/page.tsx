"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
} from "lucide-react";

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {}
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* Navbar Section */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 transition-all">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer">
              <Store className="h-8 w-8 text-blue-600" />
              <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                VendorHub
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors">
                Home
              </a>
              <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors">
                Features
              </a>
              <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors">
                How It Works
              </a>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              {user ? (
                <>
                  <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Hi, {user.name}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      localStorage.removeItem("user");
                      setUser(null);
                      // Additionally hit logout API if you implement cookie dropping
                    }}
                    className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Logout
                  </motion.button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="hidden sm:block px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400 transition-colors"
                    >
                      Log In
                    </motion.button>
                  </Link>
                  <Link href="/register/buyer">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
                    >
                      Sign Up
                    </motion.button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

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
