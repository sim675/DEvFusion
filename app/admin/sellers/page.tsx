"use client";

import { useEffect, useState } from "react";
import { Store, ShieldBan, ShieldCheck, Loader2, Search, ArrowRight } from "lucide-react";

export default function ActiveSellersPage() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchSellers = async () => {
    try {
      const res = await fetch("/api/admin/sellers");
      if (res.ok) {
        const json = await res.json();
        // Since this is the active sellers tab, only keep approved ones initially
        setSellers(json.sellers.filter((s: any) => s.sellerStatus === "approved" || s.sellerStatus === "suspended"));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleToggleStatus = async (sellerId: string, currentStatus: string) => {
    // "suspended" means disabled. 
    const newStatus = currentStatus === "suspended" ? "approved" : "suspended";
    
    try {
      // Re-using the update-status API. It might need to accept 'suspended' state
      const res = await fetch("/api/admin/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, status: newStatus }),
      });
      if (res.ok) {
        setSellers((prev) =>
          prev.map((v) => (v._id === sellerId ? { ...v, sellerStatus: newStatus } : v))
        );
      } else {
        alert("Action failed. Update API might not support suspension yet.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const filtered = sellers.filter(
    (v) =>
      v.storeName.toLowerCase().includes(search.toLowerCase()) ||
      v.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Active Sellers</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage approved marketplace sellers</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search stores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-950/50 uppercase text-xs font-bold text-slate-500 dark:text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Store Profile</th>
                <th className="px-6 py-4">Owner Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No active sellers found.
                  </td>
                </tr>
              ) : (
                filtered.map((seller) => (
                  <tr key={seller._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <Store className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{seller.storeName}</p>
                          <p className="text-xs text-slate-500">{seller.productCategory}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{seller.fullName}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full ${
                          seller.sellerStatus === "suspended"
                            ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                        }`}
                      >
                        {seller.sellerStatus === "suspended" ? "Disabled" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3 items-center">
                        <button
                          onClick={() => handleToggleStatus(seller._id, seller.sellerStatus)}
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                            seller.sellerStatus === "suspended"
                              ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20"
                              : "text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-500/10 dark:hover:bg-red-500/20"
                          }`}
                        >
                          {seller.sellerStatus === "suspended" ? <ShieldCheck className="h-4 w-4"/> : <ShieldBan className="h-4 w-4"/>}
                          {seller.sellerStatus === "suspended" ? "Enable" : "Disable"}
                        </button>
                        <button className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30">
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
