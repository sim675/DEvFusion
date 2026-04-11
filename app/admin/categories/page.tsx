"use client";

import { useState, useEffect } from "react";
import { Layers, Plus, Pencil, Trash2, Loader2, X, AlertTriangle } from "lucide-react";

type Category = {
  _id: string;
  name: string;
  slug: string;
  subcategories: string[];
};

type ModalState = 
  | { type: "NONE" }
  | { type: "ADD_CATEGORY" }
  | { type: "EDIT_CATEGORY"; category: Category }
  | { type: "ADD_SUBCATEGORY"; category: Category }
  | { type: "DELETE_CATEGORY"; category: Category }
  | { type: "EDIT_SUBCATEGORY"; category: Category; oldSubName: string }
  | { type: "DELETE_SUBCATEGORY"; category: Category; oldSubName: string };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modal, setModal] = useState<ModalState>({ type: "NONE" });
  const [modalInput, setModalInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch Categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const result = await res.json();
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Failed to load categories", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const closeModal = () => {
    setModal({ type: "NONE" });
    setModalInput("");
    setIsSubmitting(false);
  };

  // 2. Add Category HTTP Execute
  const executeAddCategory = async () => {
    if (!modalInput.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: modalInput.trim() })
      });
      const result = await res.json();
      if (result.success) {
        setCategories([result.data, ...categories]);
        closeModal();
      } else {
        alert(result.error);
        setIsSubmitting(false);
      }
    } catch (error) {
      alert("Something went wrong");
      setIsSubmitting(false);
    }
  };

  // 3. Edit Category HTTP Execute
  const executeEditCategory = async (cat: Category) => {
    if (!modalInput.trim() || modalInput === cat.name) return closeModal();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/categories/${cat._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: modalInput.trim() })
      });
      const result = await res.json();
      if (result.success) {
        setCategories(categories.map(c => c._id === cat._id ? result.data : c));
        closeModal();
      } else {
        alert(result.error);
        setIsSubmitting(false);
      }
    } catch (error) {
      alert("Edit failed");
      setIsSubmitting(false);
    }
  };

  // 4. Add Subcategory HTTP Execute
  const executeAddSubcategory = async (cat: Category) => {
    if (!modalInput.trim()) return;
    setIsSubmitting(true);
    const newSubcategories = [...(cat.subcategories || []), modalInput.trim()];

    try {
      const res = await fetch(`/api/admin/categories/${cat._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subcategories: newSubcategories })
      });
      const result = await res.json();
      if (result.success) {
        setCategories(categories.map(c => c._id === cat._id ? result.data : c));
        closeModal();
      } else {
        alert(result.error);
        setIsSubmitting(false);
      }
    } catch (error) {
      alert("Failed to add subcategory");
      setIsSubmitting(false);
    }
  };

  // 5. Delete Category HTTP Execute
  const executeDeleteCategory = async (cat: Category) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/categories/${cat._id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        setCategories(categories.filter(c => c._id !== cat._id));
        closeModal();
      } else {
        alert(result.error);
        setIsSubmitting(false);
      }
    } catch (error) {
      alert("Failed to delete");
      setIsSubmitting(false);
    }
  };

  // 6. Edit Subcategory HTTP Execute
  const executeEditSubcategory = async (cat: Category, oldSubName: string) => {
    if (!modalInput.trim() || modalInput === oldSubName) return closeModal();
    setIsSubmitting(true);
    const newSubcategories = (cat.subcategories || []).map(sub => sub === oldSubName ? modalInput.trim() : sub);
    try {
      const res = await fetch(`/api/admin/categories/${cat._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subcategories: newSubcategories })
      });
      const result = await res.json();
      if (result.success) {
        setCategories(categories.map(c => c._id === cat._id ? result.data : c));
        closeModal();
      } else {
        alert(result.error);
        setIsSubmitting(false);
      }
    } catch (error) {
      alert("Edit failed");
      setIsSubmitting(false);
    }
  };

  // 7. Delete Subcategory HTTP Execute
  const executeDeleteSubcategory = async (cat: Category, oldSubName: string) => {
    setIsSubmitting(true);
    const newSubcategories = (cat.subcategories || []).filter(sub => sub !== oldSubName);
    try {
      const res = await fetch(`/api/admin/categories/${cat._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subcategories: newSubcategories })
      });
      const result = await res.json();
      if (result.success) {
        setCategories(categories.map(c => c._id === cat._id ? result.data : c));
        closeModal();
      } else {
        alert(result.error);
        setIsSubmitting(false);
      }
    } catch (error) {
      alert("Failed to delete");
      setIsSubmitting(false);
    }
  };

  // Unified Request Router
  const handleModalSubmit = () => {
    if (modal.type === "ADD_CATEGORY") executeAddCategory();
    if (modal.type === "EDIT_CATEGORY") executeEditCategory(modal.category);
    if (modal.type === "ADD_SUBCATEGORY") executeAddSubcategory(modal.category);
    if (modal.type === "DELETE_CATEGORY") executeDeleteCategory(modal.category);
    if (modal.type === "EDIT_SUBCATEGORY") executeEditSubcategory(modal.category, modal.oldSubName);
    if (modal.type === "DELETE_SUBCATEGORY") executeDeleteSubcategory(modal.category, modal.oldSubName);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Categories Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure marketplace categories and item hierarchies.</p>
        </div>
        <button 
          onClick={() => setModal({ type: "ADD_CATEGORY" })}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          No categories found. Click "Add Category" to start building your marketplace structure.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat._id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                  <Layers className="h-5 w-5 text-blue-500" />
                  {cat.name}
                </div>
                <div className="flex gap-2 text-slate-400">
                  <button 
                    onClick={() => {
                        setModalInput(cat.name);
                        setModal({ type: "EDIT_CATEGORY", category: cat });
                    }} 
                    className="hover:text-amber-500 transition-colors" title="Edit"
                  >
                    <Pencil className="h-4 w-4"/>
                  </button>
                  <button 
                    onClick={() => setModal({ type: "DELETE_CATEGORY", category: cat })} 
                    className="hover:text-red-500 transition-colors" title="Delete"
                  >
                    <Trash2 className="h-4 w-4"/>
                  </button>
                </div>
              </div>
              
              <div className="flex-1 space-y-2 mb-4">
                {(cat.subcategories || []).map((sub, idx) => (
                  <div key={idx} className="group flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-lg font-medium border border-slate-100 dark:border-slate-800/60 mb-2 transition-colors hover:border-slate-300 dark:hover:border-slate-700">
                    <span>{sub}</span>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                         onClick={() => {
                           setModalInput(sub);
                           setModal({ type: "EDIT_SUBCATEGORY", category: cat, oldSubName: sub });
                         }}
                         className="text-slate-400 hover:text-amber-500 p-1"
                         title="Edit Subcategory"
                      >
                         <Pencil className="h-3 w-3" />
                      </button>
                      <button 
                         onClick={() => setModal({ type: "DELETE_SUBCATEGORY", category: cat, oldSubName: sub })}
                         className="text-slate-400 hover:text-red-500 p-1"
                         title="Delete Subcategory"
                      >
                         <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => setModal({ type: "ADD_SUBCATEGORY", category: cat })}
                className="mt-auto w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="h-3.5 w-3.5"/> Add Subcategory
              </button>
            </div>
          ))}
        </div>
      )}

      {/* --- Global Modal Wrapper --- */}
      {modal.type !== "NONE" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
             
             <button 
                onClick={closeModal} 
                disabled={isSubmitting}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-50"
             >
                <X className="h-5 w-5" />
             </button>

             {(modal.type === "DELETE_CATEGORY" || modal.type === "DELETE_SUBCATEGORY") ? (
                // Delete Flow
                <div className="space-y-6">
                    <div className="flex items-center gap-4 text-red-500">
                        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                           {modal.type === "DELETE_CATEGORY" ? "Delete Category" : "Remove Subcategory"}
                        </h2>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                      {modal.type === "DELETE_CATEGORY" 
                        ? `Are you sure you want to permanently delete ${modal.category.name}? This action cannot be undone and will remove all nested subcategories.`
                        : `Are you sure you want to remove "${modal.oldSubName}" from ${modal.category.name}?`
                      }
                    </p>
                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={closeModal}
                        disabled={isSubmitting}
                        className="flex-1 py-2.5 rounded-xl font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleModalSubmit}
                        disabled={isSubmitting}
                        className="flex-1 py-2.5 rounded-xl font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 flex items-center justify-center"
                      >
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Delete"}
                      </button>
                    </div>
                </div>
             ) : (
                // Input Flow (Add/Edit)
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-1">
                        {modal.type === "ADD_CATEGORY" && "Create New Category"}
                        {modal.type === "EDIT_CATEGORY" && "Edit Category Name"}
                        {modal.type === "ADD_SUBCATEGORY" && `Add Subcategory to ${modal.category.name}`}
                        {modal.type === "EDIT_SUBCATEGORY" && "Edit Subcategory Name"}
                    </h2>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {(modal.type === "ADD_SUBCATEGORY" || modal.type === "EDIT_SUBCATEGORY") ? "Subcategory Name" : "Category Name"}
                        </label>
                        <input 
                            autoFocus
                            type="text" 
                            disabled={isSubmitting}
                            value={modalInput}
                            onChange={(e) => setModalInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleModalSubmit()}
                            placeholder="e.g. Smartwatches"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={closeModal}
                        disabled={isSubmitting}
                        className="flex-1 py-2.5 rounded-xl font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleModalSubmit}
                        disabled={!modalInput.trim() || isSubmitting}
                        className="flex-1 py-2.5 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 flex items-center justify-center"
                      >
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Changes"}
                      </button>
                    </div>
                </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
