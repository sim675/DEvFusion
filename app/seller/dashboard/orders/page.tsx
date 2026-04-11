"use client";

import { ShoppingBag, MapPin, CheckCircle2, Clock, Truck, ChevronRight } from "lucide-react";

export default function OrdersPage() {
  const mockOrders = [
    { 
        id: "#ORD-8839", buyer: "Rohan K.", product: "Organic Local Honey", qty: 2, 
        distance: "1.2 km away", status: "Placed", time: "10 mins ago", urgent: true 
    },
    { 
        id: "#ORD-8838", buyer: "Anjali S.", product: "Whole Wheat Artisanal Bread", qty: 1, 
        distance: "3.5 km away", status: "Confirmed", time: "1 hr ago", urgent: false 
    },
    { 
        id: "#ORD-8837", buyer: "Vikram R.", product: "Farm Fresh Eggs (1 Dozen)", qty: 3, 
        distance: "2.0 km away", status: "Shipped", time: "3 hrs ago", urgent: false 
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-sm text-slate-400 mt-1">Process and fulfill incoming local orders.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
              {mockOrders.map((order) => (
                  <div key={order.id} className="bg-[#0a0714] border border-white/10 rounded-2xl p-5 hover:border-violet-500/30 transition-all shadow-xl">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex gap-4">
                              <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0 border border-violet-500/20">
                                  <ShoppingBag className="h-5 w-5 text-violet-400" />
                              </div>
                              <div>
                                  <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-bold text-white">{order.id}</h3>
                                      <span className="text-xs text-slate-500 font-medium">{order.time}</span>
                                      {order.urgent && (
                                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 uppercase tracking-widest border border-amber-500/30">Urgent</span>
                                      )}
                                  </div>
                                  <p className="font-medium text-slate-200">{order.qty}x {order.product}</p>
                                  <div className="flex items-center gap-3 mt-2 text-sm text-slate-400">
                                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-500"/> {order.distance}</span>
                                      <span className="text-slate-600">•</span>
                                      <span>Buyer: {order.buyer}</span>
                                  </div>
                              </div>
                          </div>
                          
                          <div className="flex flex-col items-end justify-between min-h-full">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                  order.status === 'Placed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                                  order.status === 'Confirmed' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              }`}>
                                {order.status === 'Placed' && <Clock className="h-3 w-3" />}
                                {order.status === 'Confirmed' && <CheckCircle2 className="h-3 w-3" />}
                                {order.status === 'Shipped' && <Truck className="h-3 w-3" />}
                                {order.status}
                              </span>

                              <button className="mt-4 flex items-center text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors">
                                  Manage <ChevronRight className="h-4 w-4 ml-0.5" />
                              </button>
                          </div>
                      </div>
                  </div>
              ))}
          </div>

          <div className="md:col-span-1 space-y-4">
              <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
                  <h3 className="font-bold mb-4">Order Flow Tracker</h3>
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                      {[
                          { step: "Placed", desc: "Awaiting confirmation" },
                          { step: "Confirmed", desc: "Preparing for dispatch" },
                          { step: "Shipped", desc: "Out for delivery" },
                          { step: "Delivered", desc: "Order complete" }
                      ].map((s, i) => (
                          <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white/20 bg-[#07050f] text-slate-500">
                                  <div className="h-2 w-2 rounded-full bg-slate-500"></div>
                              </div>
                              <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3 rounded-lg border border-white/5 bg-white/[0.02]">
                                  <h4 className="text-sm font-bold">{s.step}</h4>
                                  <p className="text-xs text-slate-400">{s.desc}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
