"use client";

import { AlertTriangle, PackageSearch, ArrowUpCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function InventoryPage() {
  const lowStockItems = [
    { name: "Whole Wheat Artisanal Bread", stock: 2, threshold: 5, lastRestocked: "2 days ago" },
    { name: "Local Strawberries (Box)", stock: 0, threshold: 10, lastRestocked: "1 week ago" },
    { name: "Raw Honeycomb", stock: 1, threshold: 3, lastRestocked: "1 month ago" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Inventory Alerts</h1>
        <p className="text-sm text-slate-400 mt-1">Monitor low stock products and prevent lost sales.</p>
      </div>

      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="h-16 w-16 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
             <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <div>
              <h2 className="text-xl font-bold text-red-400 mb-1">Critical Stock Warning</h2>
              <p className="text-red-300/80 text-sm">You have {lowStockItems.length} products running extremely low or completely out of stock. Please restock immediately to avoid losing your top placement in local search results.</p>
          </div>
      </div>

      <div className="bg-[#0a0714] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/5 flex items-center gap-2 bg-white/[0.02]">
            <PackageSearch className="h-5 w-5 text-slate-400" />
            <h3 className="font-semibold text-slate-200">Needs Attention</h3>
        </div>
        <div className="divide-y divide-white/5">
            {lowStockItems.map((item, idx) => (
                <div key={idx} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                    <div>
                        <h4 className="font-bold text-slate-200">{item.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">Alert threshold: {item.threshold} <span className="mx-2">•</span> Last stocked: {item.lastRestocked}</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                           <span className={`inline-flex items-center justify-center px-3 py-1 rounded text-sm font-bold ${item.stock === 0 ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
                               Only {item.stock} left
                           </span>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-all">
                            <ArrowUpCircle className="h-4 w-4" /> Restock
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
