"use client";

import { RotateCcw, Search, CheckCircle, XCircle } from "lucide-react";

export default function RefundsPage() {
  const dummyRefunds = [
    { id: "REF-98A1B", orderId: "ORD-5541", buyer: "John Doe", seller: "Fresh Mart", amount: "$24.50", reason: "Item missing", status: "pending" },
    { id: "REF-21C4X", orderId: "ORD-9912", buyer: "Sarah Smith", seller: "Tech Gadgets", amount: "$120.00", reason: "Defective item", status: "approved" },
    { id: "REF-00P9Z", orderId: "ORD-1120", buyer: "Mike Ross", seller: "Fashion Hub", amount: "$45.00", reason: "Wrong size", status: "rejected" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Refund Requests</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review and manage buyer dispute claims.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Order ID..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm dark:text-white"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-950/50 uppercase text-xs font-bold text-slate-500 dark:text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Request ID</th>
                <th className="px-6 py-4">Order / Buyer</th>
                <th className="px-6 py-4">Seller</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {dummyRefunds.map((ref) => (
                <tr key={ref.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <RotateCcw className="h-4 w-4 text-slate-400" /> {ref.id}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900 dark:text-white">{ref.orderId}</p>
                    <p className="text-xs">{ref.buyer}</p>
                  </td>
                  <td className="px-6 py-4 font-medium">{ref.seller}</td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{ref.amount}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full ${
                        ref.status === "approved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                        : ref.status === "rejected" ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                      }`}
                    >
                      {ref.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {ref.status === "pending" ? (
                      <div className="flex justify-end gap-2">
                        <button className="text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-500/10 dark:hover:bg-red-500/20 p-1.5 rounded-lg transition-colors">
                          <XCircle className="h-5 w-5" />
                        </button>
                        <button className="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 p-1.5 rounded-lg transition-colors">
                          <CheckCircle className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
