"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Package, 
  ArrowLeft, 
  ChevronRight, 
  Upload, 
  X, 
  Check, 
  Loader2, 
  Store, 
  LayoutGrid, 
  Info, 
  Image as ImageIcon,
  Truck,
  Plus,
  Trash2,
  DollarSign,
  ClipboardList,
  Layers,
  Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Category {
  _id: string;
  name: string;
  icon?: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    shortDescription: "",
    fullDescription: "",
    price: "",
    discountPrice: "",
    mrp: "",
    stock: "",
    categoryName: "",
    subcategory: "",
    deliveryTime: "Same Day",
    availability: "true",
    pickupAvailable: "false",
    mainImageIndex: 0,
    warrantyInfo: "",
    returnPolicy: "",
    boxContents: "",
  });

  // Dynamic Specifications
  const [specifications, setSpecifications] = useState<{ key: string; value: string }[]>([
    { key: "", value: "" }
  ]);

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    }
    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSpecChange = (index: number, field: "key" | "value", value: string) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);
  };

  const addSpec = () => setSpecifications([...specifications, { key: "", value: "" }]);
  const removeSpec = (index: number) => setSpecifications(specifications.filter((_, i) => i !== index));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles]);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    if (formData.mainImageIndex === index) {
      setFormData(prev => ({ ...prev, mainImageIndex: 0 }));
    } else if (formData.mainImageIndex > index) {
      setFormData(prev => ({ ...prev, mainImageIndex: prev.mainImageIndex - 1 }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    
    // Basic fields
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value.toString());
    });

    // Specifications as JSON
    const specsObj: Record<string, string> = {};
    specifications.forEach(s => {
      if (s.key && s.value) specsObj[s.key] = s.value;
    });
    data.append("specifications", JSON.stringify(specsObj));

    // Additional Details as JSON
    data.append("additionalDetails", JSON.stringify({
      warrantyInfo: formData.warrantyInfo,
      returnPolicy: formData.returnPolicy,
      boxContents: formData.boxContents
    }));

    // Images
    images.forEach(image => {
      data.append("images", image);
    });

    try {
      const res = await fetch("/api/seller/products/add", {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        router.push("/seller/dashboard/products");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to add product");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const steps = [
    { id: 1, name: "Category", icon: LayoutGrid },
    { id: 2, name: "Info", icon: Info },
    { id: 3, name: "Pricing", icon: DollarSign },
    { id: 4, name: "Media", icon: ImageIcon },
    { id: 5, name: "Specs & More", icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-[#07050f] text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Add New Product</h1>
            <p className="text-sm text-slate-400">List your product with full details for buyers</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-12 bg-[#0a0714] p-4 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
          {steps.map((s, idx) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2 min-w-[60px]">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
                  step >= s.id ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20" : "bg-white/5 text-slate-500"
                }`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider text-center ${
                  step >= s.id ? "text-violet-400" : "text-slate-600"
                }`}>{s.name}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`h-px flex-1 mx-2 transition-all min-w-[20px] ${
                  step > s.id ? "bg-violet-600" : "bg-white/10"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="bg-[#0a0714] rounded-3xl border border-white/10 shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
          <div className="p-6 md:p-10 flex-1">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-10"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <LayoutGrid className="h-5 w-5 text-violet-500" />
                        Choose a Category
                      </h3>
                      <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold bg-white/5 px-3 py-1 rounded-full border border-white/10">
                        Step 1 of 5
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {categories.map((cat) => (
                        <button
                          key={cat._id}
                          onClick={() => setFormData(prev => ({ ...prev, categoryName: cat.name }))}
                          className={`relative p-6 rounded-3xl border transition-all flex flex-col items-center gap-4 group ${
                            formData.categoryName === cat.name 
                              ? "bg-violet-600 border-violet-500 text-white shadow-2xl shadow-violet-600/20 scale-[1.02]" 
                              : "bg-white/[0.03] border-white/5 text-slate-400 hover:border-white/20 hover:bg-white/5"
                          }`}
                        >
                          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all ${
                            formData.categoryName === cat.name ? "bg-white/20" : "bg-white/5 group-hover:bg-white/10"
                          }`}>
                            <Package className={`h-7 w-7 ${formData.categoryName === cat.name ? "text-white" : "text-violet-500/70"}`} />
                          </div>
                          <span className="font-bold text-sm tracking-tight">{cat.name}</span>
                          
                          {formData.categoryName === cat.name && (
                            <div className="absolute top-3 right-3 h-5 w-5 bg-white rounded-full flex items-center justify-center">
                              <Check className="h-3 w-3 text-violet-600" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/5">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-300 flex items-center justify-between">
                        <span>Subcategory <span className="text-slate-500 text-[10px] font-normal italic ml-1">(Optional)</span></span>
                      </label>
                      <div className="relative group">
                        <Layers className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-violet-500 transition-colors" />
                        <input 
                          type="text" 
                          name="subcategory"
                          value={formData.subcategory}
                          onChange={handleInputChange}
                          placeholder="e.g. Smartphones, T-shirts, Spices..."
                          className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-black/60 transition-all placeholder:text-slate-600"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 ml-1">You can leave this blank and add it later if needed.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Product Name</label>
                      <input 
                        type="text" name="name" value={formData.name} onChange={handleInputChange}
                        placeholder="e.g. iPhone 15 Pro"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Brand Name</label>
                      <input 
                        type="text" name="brand" value={formData.brand} onChange={handleInputChange}
                        placeholder="e.g. Apple"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-slate-300">Short Description (1-2 lines)</label>
                      <input 
                        type="text" name="shortDescription" value={formData.shortDescription} onChange={handleInputChange}
                        placeholder="Catchy summary of the product..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-slate-300">Full Description</label>
                      <textarea 
                        name="fullDescription" value={formData.fullDescription} onChange={handleInputChange}
                        rows={6}
                        placeholder="Detailed product features, benefits, and information..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Price (Selling Price)</label>
                      <input 
                        type="number" name="price" value={formData.price} onChange={handleInputChange}
                        placeholder="0.00"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Discount Price (Optional)</label>
                      <input 
                        type="number" name="discountPrice" value={formData.discountPrice} onChange={handleInputChange}
                        placeholder="0.00"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">MRP (Original Price)</label>
                      <input 
                        type="number" name="mrp" value={formData.mrp} onChange={handleInputChange}
                        placeholder="0.00"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                    <div className="space-y-4">
                      <label className="text-sm font-medium text-slate-300">Inventory</label>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                          <input 
                            type="number" name="stock" value={formData.stock} onChange={handleInputChange}
                            placeholder="Stock Quantity"
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                          />
                          <button
                            onClick={() => setFormData(prev => ({ ...prev, availability: prev.availability === "true" ? "false" : "true" }))}
                            className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                              formData.availability === "true" 
                                ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" 
                                : "bg-red-500/10 border-red-500/50 text-red-400"
                            }`}
                          >
                            {formData.availability === "true" ? "In Stock" : "Out of Stock"}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-sm font-medium text-slate-300">Delivery & Logistics</label>
                      <div className="grid grid-cols-1 gap-4">
                        <select 
                          name="deliveryTime" value={formData.deliveryTime} onChange={handleInputChange}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                        >
                          <option value="Instant">Instant (1-2 hours)</option>
                          <option value="Same Day">Same Day</option>
                          <option value="Next Day">Next Day</option>
                        </select>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                          <span className="text-sm text-slate-300">Pickup Available</span>
                          <button
                            onClick={() => setFormData(prev => ({ ...prev, pickupAvailable: prev.pickupAvailable === "true" ? "false" : "true" }))}
                            className={`w-12 h-6 rounded-full transition-all relative ${
                              formData.pickupAvailable === "true" ? "bg-violet-600" : "bg-slate-700"
                            }`}
                          >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                              formData.pickupAvailable === "true" ? "left-7" : "left-1"
                            }`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div 
                  key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl p-10 hover:border-violet-500/50 transition-colors bg-white/[0.02]">
                    <Upload className="h-8 w-8 text-violet-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-1">Upload Product Images</h3>
                    <p className="text-xs text-slate-500 mb-6">PNG, JPG up to 10MB</p>
                    <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" id="img-upload" />
                    <label htmlFor="img-upload" className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 rounded-xl font-bold transition-all cursor-pointer shadow-lg shadow-violet-500/20">
                      Choose Files
                    </label>
                  </div>

                  {previews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {previews.map((p, idx) => (
                        <div key={idx} className={`group relative aspect-square rounded-2xl border overflow-hidden bg-black transition-all ${
                          formData.mainImageIndex === idx ? "border-violet-500 ring-2 ring-violet-500/50" : "border-white/10"
                        }`}>
                          <img src={p} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                            <button 
                              onClick={() => setFormData(prev => ({ ...prev, mainImageIndex: idx }))}
                              className={`p-1.5 rounded-lg transition-colors ${formData.mainImageIndex === idx ? "bg-violet-600 text-white" : "bg-white/10 text-white hover:bg-violet-500"}`}
                              title="Set as Main Image"
                            >
                              <Star className="h-4 w-4" fill={formData.mainImageIndex === idx ? "currentColor" : "none"} />
                            </button>
                            <button onClick={() => removeImage(idx)} className="p-1.5 bg-red-500 rounded-lg text-white hover:bg-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          {formData.mainImageIndex === idx && (
                            <div className="absolute bottom-0 left-0 right-0 bg-violet-600 text-[10px] font-bold text-center py-1 uppercase tracking-tighter">
                              Main Image
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {step === 5 && (
                <motion.div 
                  key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-violet-400" /> Specifications
                      </label>
                      <button onClick={addSpec} className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 bg-violet-400/10 px-3 py-1.5 rounded-lg border border-violet-400/20">
                        <Plus className="h-3 w-3" /> Add Row
                      </button>
                    </div>
                    <div className="space-y-3">
                      {specifications.map((s, idx) => (
                        <div key={idx} className="flex gap-3">
                          <input 
                            placeholder="Key (e.g. Battery)" value={s.key} onChange={(e) => handleSpecChange(idx, "key", e.target.value)}
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-violet-500/50"
                          />
                          <input 
                            placeholder="Value (e.g. 5000 mAh)" value={s.value} onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-violet-500/50"
                          />
                          <button onClick={() => removeSpec(idx)} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 border border-red-500/20">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-white/5">
                    <label className="text-sm font-medium text-slate-300">Additional Details (Optional)</label>
                    <div className="grid grid-cols-1 gap-4">
                      <input 
                        type="text" name="warrantyInfo" value={formData.warrantyInfo} onChange={handleInputChange}
                        placeholder="Warranty Information"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-violet-500/50"
                      />
                      <input 
                        type="text" name="returnPolicy" value={formData.returnPolicy} onChange={handleInputChange}
                        placeholder="Return Policy"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-violet-500/50"
                      />
                      <input 
                        type="text" name="boxContents" value={formData.boxContents} onChange={handleInputChange}
                        placeholder="What's in the box?"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-violet-500/50"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={step === 1 || loading}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                step === 1 ? "opacity-0 pointer-events-none" : "hover:bg-white/5 text-slate-400"
              }`}
            >
              <ChevronRight className="h-4 w-4 rotate-180" /> Back
            </button>
            
            {step < 5 ? (
              <button
                onClick={nextStep}
                disabled={
                  (step === 1 && !formData.categoryName) ||
                  (step === 2 && (!formData.name || !formData.brand || !formData.shortDescription || !formData.fullDescription)) ||
                  (step === 3 && (!formData.price || !formData.stock)) ||
                  (step === 4 && images.length === 0)
                }
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg ${
                  ((step === 1 && !formData.categoryName) ||
                  (step === 2 && (!formData.name || !formData.brand || !formData.shortDescription || !formData.fullDescription)) ||
                  (step === 3 && (!formData.price || !formData.stock)) ||
                  (step === 4 && images.length === 0))
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                    : "bg-violet-600 hover:bg-violet-700 text-white shadow-violet-500/20"
                }`}
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Adding Product...</>
                ) : (
                  <><Check className="h-5 w-5" /> Add Product</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
