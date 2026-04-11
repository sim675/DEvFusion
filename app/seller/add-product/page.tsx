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
  Layers, 
  Info, 
  Image as ImageIcon,
  Truck,
  CheckCircle2
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
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    deliveryTime: "Same Day",
    availability: "true",
    pickupAvailable: "false",
  });
  
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("stock", formData.stock);
    data.append("categoryName", selectedCategory);
    data.append("subcategory", selectedSubcategory);
    data.append("deliveryTime", formData.deliveryTime);
    data.append("availability", formData.availability);
    data.append("pickupAvailable", formData.pickupAvailable);
    
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

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const steps = [
    { id: 1, name: "Category", icon: LayoutGrid },
    { id: 2, name: "Details", icon: Info },
    { id: 3, name: "Images", icon: ImageIcon },
    { id: 4, name: "Additional", icon: Truck },
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
            <p className="text-sm text-slate-400">List your product for nearby customers</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-12 bg-[#0a0714] p-4 rounded-2xl border border-white/10">
          {steps.map((s, idx) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
                  step >= s.id ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20" : "bg-white/5 text-slate-500"
                }`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  step >= s.id ? "text-violet-400" : "text-slate-600"
                }`}>{s.name}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`h-px flex-1 mx-4 transition-all ${
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
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => {
                          setSelectedCategory(cat.name);
                          nextStep();
                        }}
                        className={`p-6 rounded-2xl border transition-all text-center flex flex-col items-center gap-4 hover:scale-105 active:scale-95 ${
                          selectedCategory === cat.name 
                            ? "bg-violet-600/20 border-violet-500 text-violet-400 shadow-xl shadow-violet-500/10" 
                            : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:bg-white/10"
                        }`}
                      >
                        <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center">
                          <Package className="h-6 w-6" />
                        </div>
                        <span className="font-semibold">{cat.name}</span>
                      </button>
                    ))}
                    {/* Add fallback categories if none fetched */}
                    {categories.length === 0 && (
                      ['Electronics', 'Grocery', 'Fashion', 'Pharmacy', 'Other'].map(name => (
                        <button
                          key={name}
                          onClick={() => {
                            setSelectedCategory(name);
                            nextStep();
                          }}
                          className="p-6 rounded-2xl border border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10 transition-all text-center flex flex-col items-center gap-4"
                        >
                          <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center">
                            <Package className="h-6 w-6" />
                          </div>
                          <span className="font-semibold">{name}</span>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Product Name</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Organic Wild Honey"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Category (Selected)</label>
                      <input 
                        type="text" 
                        value={selectedCategory}
                        disabled
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-500 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Subcategory</label>
                      <input 
                        type="text" 
                        value={selectedSubcategory}
                        onChange={(e) => setSelectedSubcategory(e.target.value)}
                        placeholder="e.g. Food & Beverages"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Price (₹)</label>
                        <input 
                          type="number" 
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          placeholder="0.00"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Stock</label>
                        <input 
                          type="number" 
                          name="stock"
                          value={formData.stock}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-slate-300">Description</label>
                      <textarea 
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Describe your product details, quality, and features..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-slate-300">Delivery Time</label>
                      <div className="grid grid-cols-3 gap-4">
                        {['Instant', 'Same Day', 'Next Day'].map((time) => (
                          <button
                            key={time}
                            onClick={() => setFormData(prev => ({ ...prev, deliveryTime: time }))}
                            className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                              formData.deliveryTime === time 
                                ? "bg-violet-600/20 border-violet-500 text-violet-400" 
                                : "bg-black/40 border-white/10 text-slate-400 hover:bg-white/5"
                            }`}
                          >
                            {time} {time === 'Instant' && '(1-2h)'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl p-12 hover:border-violet-500/50 transition-colors bg-white/[0.02]">
                    <div className="h-16 w-16 rounded-2xl bg-violet-600/10 flex items-center justify-center mb-4">
                      <Upload className="h-8 w-8 text-violet-500" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Upload Product Images</h3>
                    <p className="text-sm text-slate-500 mb-6">Drag and drop or click to browse files</p>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden" 
                      id="image-upload" 
                    />
                    <label 
                      htmlFor="image-upload"
                      className="px-6 py-3 bg-violet-600 hover:bg-violet-700 rounded-xl font-medium transition-all cursor-pointer shadow-lg shadow-violet-500/20"
                    >
                      Browse Images
                    </label>
                  </div>

                  {previews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {previews.map((preview, idx) => (
                        <div key={idx} className="group relative aspect-square rounded-2xl border border-white/10 overflow-hidden bg-black">
                          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                          <button 
                            onClick={() => removeImage(idx)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {step === 4 && (
                <motion.div 
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                      <div className="flex items-center gap-3 text-slate-200">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        <span className="font-semibold">Availability Status</span>
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, availability: "true" }))}
                          className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                            formData.availability === "true" 
                              ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" 
                              : "bg-black/40 border-white/10 text-slate-400"
                          }`}
                        >
                          In Stock
                        </button>
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, availability: "false" }))}
                          className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                            formData.availability === "false" 
                              ? "bg-red-500/10 border-red-500/50 text-red-400" 
                              : "bg-black/40 border-white/10 text-slate-400"
                          }`}
                        >
                          Out of Stock
                        </button>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                      <div className="flex items-center gap-3 text-slate-200">
                        <Store className="h-5 w-5 text-blue-500" />
                        <span className="font-semibold">Pickup Options</span>
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, pickupAvailable: "true" }))}
                          className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                            formData.pickupAvailable === "true" 
                              ? "bg-blue-500/10 border-blue-500/50 text-blue-400" 
                              : "bg-black/40 border-white/10 text-slate-400"
                          }`}
                        >
                          Yes, Available
                        </button>
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, pickupAvailable: "false" }))}
                          className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                            formData.pickupAvailable === "false" 
                              ? "bg-black/40 border-white/10 text-slate-400" 
                              : "bg-black/40 border-white/10 text-slate-400 opacity-50"
                          }`}
                        >
                          No Pickup
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-violet-600/5 border border-violet-500/20 p-6 rounded-2xl">
                    <h4 className="text-violet-400 font-semibold mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4" /> Final Review
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                      <li className="flex justify-between">
                        <span>Product Name</span>
                        <span className="text-slate-200">{formData.name || 'Not specified'}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Category</span>
                        <span className="text-slate-200">{selectedCategory}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Price</span>
                        <span className="text-slate-200">₹{formData.price || '0'}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Images</span>
                        <span className="text-slate-200">{images.length} uploaded</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Navigation */}
          <div className="p-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={step === 1 || loading}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                step === 1 ? "opacity-0 cursor-default" : "hover:bg-white/5 text-slate-400"
              }`}
            >
              <ChevronRight className="h-4 w-4 rotate-180" /> Back
            </button>
            
            {step < 4 ? (
              <button
                onClick={nextStep}
                disabled={step === 1 && !selectedCategory}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg ${
                  (step === 1 && !selectedCategory) 
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
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Adding...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" /> Add Product
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
