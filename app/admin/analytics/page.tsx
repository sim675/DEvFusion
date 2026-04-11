"use client";

import { BarChart3, TrendingUp, TrendingDown, Store, MapPin } from "lucide-react";

export default function AnalyticsPage() {
  const metrics = [
    { title: "Revenue (30d)", value: "$24,500", trend: "+12.5%", isUp: true },
    { title: "Average Order Value", value: "$45.20", trend: "-2.1%", isUp: false },
    { title: "Fast Delivery Rate", value: "94.2%", trend: "+5.4%", isUp: true },
  ];

  const topSellers = [
    { name: "Fresh Mart", sales: "$4,200", orders: 142 },
    { name: "Tech Gadgets", sales: "$3,850", orders: 45 },
    { name: "Fashion Hub", sales: "$2,100", orders: 89 },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Platform insights and regional performance mapping.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">{m.title}</h3>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{m.value}</p>
            <div className={`mt-2 flex items-center gap-1 text-sm font-semibold ${m.isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
              {m.isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {m.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Store className="h-5 w-5 text-blue-600" />
            <h2 className="font-bold text-slate-900 dark:text-white">Top Performing Sellers</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 flex-1">
            {topSellers.map((v, i) => (
              <div key={i} className="p-6 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 text-sm">
                    {i + 1}
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white">{v.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-white">{v.sales}</p>
                  <p className="text-xs text-slate-500">{v.orders} orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col items-center justify-center h-80 lg:h-auto">
          <MapPin className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-3" />
          <p className="font-bold text-slate-500 dark:text-slate-400">Regional Heatmap Demo</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs text-center">Interactive tracking of high-demand local grid zones will be populated here.</p>
        </div>
      </div>
    </div>
  );
}
