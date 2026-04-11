"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, CreditCard, ChevronLeft, Package, CheckCircle2, ShieldCheck, Truck, Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  
  const [cart, setCart] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCheckoutData() {
      try {
        const [cartRes, addressRes] = await Promise.all([
          fetch("/api/cart"),
          fetch("/api/addresses")
        ]);

        if (cartRes.status === 401) {
          router.push("/login?redirect=/checkout");
          return;
        }

        const cartData = await cartRes.json();
        const addressData = addressRes.ok ? await addressRes.json() : { addresses: [] };

        if (!cartData.cart || cartData.cart.items.length === 0) {
          router.push("/cart");
          return;
        }

        setCart(cartData.cart);
        setAddresses(addressData.addresses || []);

        const defaultAddress = addressData.addresses?.find((a: any) => a.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress._id || defaultAddress.id);
        } else if (addressData.addresses?.length > 0) {
          setSelectedAddressId(addressData.addresses[0]._id || addressData.addresses[0].id);
        }

      } catch (err: any) {
        setError("Failed to load checkout data.");
      } finally {
        setLoading(false);
      }
    }
    loadCheckoutData();
  }, [router]);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert("Please select or add a delivery address.");
      return;
    }
    
    setPlacingOrder(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: selectedAddressId,
          paymentMethod
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }
      
      router.push(`/success?orderId=${data.orderId}`);
      
    } catch (err: any) {
      alert(err.message);
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center dark:bg-slate-950">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
  const deliveryFee = 40;
  const total = subtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/cart" className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </Link>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Secure Checkout</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Address & Payment */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Address Selection */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" /> Delivery Address
              </h2>
              
              {addresses.length === 0 ? (
                <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center">
                  <p className="text-sm text-slate-500 mb-3">You have no saved addresses.</p>
                  <Link href="/" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                    Go home to add an address in the top nav »
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => {
                    const id = addr._id || addr.id;
                    const isSelected = selectedAddressId === id;
                    return (
                      <div 
                        key={id}
                        onClick={() => setSelectedAddressId(id)}
                        className={`relative p-4 rounded-2xl border cursor-pointer transition-all ${
                          isSelected 
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800/50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{addr.name}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{addr.street}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{addr.city}, {addr.state} {addr.pincode}</p>
                            {addr.phone && <p className="text-xs text-slate-500 mt-1">📞 {addr.phone}</p>}
                          </div>
                          {isSelected && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Payment Selection */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-600" /> Payment Method
              </h2>
              
              <div className="space-y-3">
                <div 
                  onClick={() => setPaymentMethod("COD")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === "COD" 
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" 
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white">Cash on Delivery (COD)</span>
                    {paymentMethod === "COD" && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Pay with cash or UPI scanner upon delivery.</p>
                </div>

                <div 
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20 cursor-not-allowed opacity-60"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white">Credit/Debit Card</span>
                    <span className="text-[10px] font-bold uppercase bg-slate-200 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded-full">Coming Soon</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                {items.map((item: any, idx: number) => {
                  const product = item.productId;
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                        <img src={item.image || "/placeholder.jpg"} alt="item" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {product?.name || "Product"}
                        </p>
                        <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="font-semibold text-sm text-slate-900 dark:text-white">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-white">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                  <span>Hyperlocal Delivery Fee</span>
                  <span className="font-semibold text-emerald-500">₹{deliveryFee}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white text-lg">Total</span>
                <span className="text-2xl font-black text-blue-600 dark:text-white">₹{total.toLocaleString()}</span>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={placingOrder || !selectedAddressId}
                className="w-full mt-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {placingOrder ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Package className="h-5 w-5" /> Place Order
                  </>
                )}
              </button>

              <div className="mt-6 flex flex-col gap-2">
                <p className="text-xs text-slate-500 flex items-center gap-1.5 justify-center">
                  <ShieldCheck className="h-4 w-4" /> Secure SSL Checkout
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 justify-center">
                  <Truck className="h-4 w-4" /> Hyperlocal Instant Delivery
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
