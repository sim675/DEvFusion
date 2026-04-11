"use client";

import { useState } from "react";
import { Layers, Plus, Pencil, Trash2 } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([
    { id: 1, name: "Grocery", subcategories: ["Fruits", "Vegetables", "Dairy"] },
    { id: 2, name: "Electronics", subcategories: ["Mobiles", "Laptops", "Accessories"] },
    { id: 3, name: "Clothing & Fashion", subcategories: ["Men", "Women", "Kids"] }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Categories Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure marketplace categories and item hierarchies.</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                <Layers className="h-5 w-5 text-blue-500" />
                {cat.name}
              </div>
              <div className="flex gap-2 text-slate-400">
                <button className="hover:text-amber-500 transition-colors"><Pencil className="h-4 w-4"/></button>
                <button className="hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4"/></button>
              </div>
            </div>
            <div className="flex-1 space-y-2 mb-4">
              {cat.subcategories.map(sub => (
                <div key={sub} className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg font-medium border border-slate-100 dark:border-slate-800/60">
                  {sub}
                </div>
              ))}
            </div>
            <button className="mt-auto w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
              <Plus className="h-3.5 w-3.5"/> Add Subcategory
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
