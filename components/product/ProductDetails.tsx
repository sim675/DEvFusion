"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileText, Settings, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductDetailsProps {
  product: any;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [openSections, setOpenSections] = useState<string[]>(["desc", "specs"]);

  const toggleSection = (id: string) => {
    setOpenSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const sections = [
    {
      id: "desc",
      title: "Detailed Description",
      icon: FileText,
      content: (
        <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
          {product.fullDescription}
        </div>
      )
    },
    {
      id: "specs",
      title: "Specifications",
      icon: Settings,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          {Object.entries(product.specifications || {}).map(([key, value]: [string, any]) => (
            <div key={key} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
              <span className="text-slate-500 text-sm font-medium">{key}</span>
              <span className="text-slate-200 text-sm font-bold">{value}</span>
            </div>
          ))}
          {(!product.specifications || Object.keys(product.specifications).length === 0) && (
            <p className="text-slate-500 italic text-sm">No specifications listed.</p>
          )}
        </div>
      )
    },
    {
      id: "more",
      title: "Additional Information",
      icon: Info,
      content: (
        <div className="space-y-4">
          {product.additionalDetails?.warrantyInfo && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Warranty</h4>
              <p className="text-slate-200 text-sm">{product.additionalDetails.warrantyInfo}</p>
            </div>
          )}
          {product.additionalDetails?.returnPolicy && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Return Policy</h4>
              <p className="text-slate-200 text-sm">{product.additionalDetails.returnPolicy}</p>
            </div>
          )}
          {product.additionalDetails?.boxContents && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">What's in the box?</h4>
              <p className="text-slate-200 text-sm">{product.additionalDetails.boxContents}</p>
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.id} className="bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden transition-all hover:bg-white/[0.03]">
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full flex items-center justify-between p-6 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-violet-600/10 flex items-center justify-center">
                <section.icon className="h-5 w-5 text-violet-400" />
              </div>
              <h3 className="font-bold text-white tracking-tight">{section.title}</h3>
            </div>
            {openSections.includes(section.id) ? (
              <ChevronUp className="h-5 w-5 text-slate-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-500" />
            )}
          </button>
          
          <AnimatePresence>
            {openSections.includes(section.id) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="px-6 pb-8 border-t border-white/5 pt-6">
                  {section.content}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
