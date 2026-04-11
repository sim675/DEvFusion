"use client";

import { useState } from "react";
import { Settings, Save, Percent, AlertCircle } from "lucide-react";

export default function CommissionSettingsPage() {
  const [commission, setCommission] = useState(10);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Mock save delay
    setTimeout(() => {
      setIsSaving(false);
      alert("Platform commission rate updated successfully!");
    }, 800);
  };

  const samplePrice = 1000;
  const deducted = (samplePrice * commission) / 100;
  const earnings = samplePrice - deducted;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Global Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage global marketplace parameters and revenue splits.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
          <Settings className="h-6 w-6 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Commission Configuration</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Platform Fee Percentage</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={commission}
                  onChange={(e) => setCommission(Number(e.target.value))}
                  className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm dark:text-white"
                />
                <Percent className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
              <p className="text-xs text-slate-500 mt-2 flex items-start gap-1.5"><AlertCircle className="h-4 w-4 shrink-0"/> Global percentage applied automatically to all seller sales during payout.</p>
            </div>

            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-md"
            >
              {isSaving ? "Saving..." : <><Save className="h-5 w-5"/> Apply Changes</>}
            </button>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Live Preview Calculator</h3>
            <div className="space-y-4 font-medium">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                <span>Sample Item Sale</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{samplePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-red-500">
                <span>Platform Commission ({commission}%)</span>
                <span>- ₹{deducted.toFixed(2)}</span>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-700 my-2 w-full"></div>
              <div className="flex justify-between items-center text-lg text-emerald-600 dark:text-emerald-400 font-extrabold">
                <span>Final Seller Earnings</span>
                <span>₹{earnings.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
