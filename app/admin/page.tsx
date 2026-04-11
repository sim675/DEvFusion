"use client";

import { useEffect, useState } from "react";
import { Users, Store, Loader2, ShoppingBag, DollarSign } from "lucide-react";

export default function GeneralDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now we will fetch the basic sellers analytics, and mock the others
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/admin/sellers");
        if (res.ok) {
          const json = await res.json();
          setData({
            totalSellers: json.analytics.total,
            pendingApprovals: json.analytics.pending,
            totalSales: "$12,450", // Mock data
            totalOrders: "342", // Mock data
          });
        }
      } catch (err) {
        console.error("Dashboard error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const cards = [
    { title: "Total Sellers", value: data?.totalSellers || 0, icon: Store, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
    { title: "Pending Approvals", value: data?.pendingApprovals || 0, icon: Users, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
    { title: "Total Sales", value: data?.totalSales || "$0", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
    { title: "Total Orders", value: data?.totalOrders || "0", icon: ShoppingBag, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Marketplace Overview</h1>
      
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-5">
            <div className={`p-4 rounded-2xl ${card.bg}`}>
              <card.icon className={`h-7 w-7 ${card.color}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{card.title}</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for future charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-80 flex items-center justify-center">
          <p className="text-slate-400 font-medium">Sales Chart (Coming soon)</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-80 flex items-center justify-center">
          <p className="text-slate-400 font-medium">Top Sellers Pipeline (Coming soon)</p>
        </div>
      </div>
    </div>
  );
}
