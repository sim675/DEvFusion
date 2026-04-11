"use client";

import { useEffect, useState } from "react";
import { User, Store, MapPin, Briefcase, CreditCard, FileText, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SellerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SellerProfileModal({ isOpen, onClose }: SellerProfileModalProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    
    async function fetchProfile() {
      setLoading(true);
      try {
        const res = await fetch("/api/seller/profile");
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        setProfile(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [isOpen]);

  if (!isOpen) return null;

  const sections = profile ? [
    {
      title: "Personal Information",
      icon: User,
      color: "text-violet-400",
      fields: [
        { label: "Full Name", value: profile.fullName },
        { label: "Phone Number", value: profile.phone },
        { label: "Email", value: profile.email },
      ]
    },
    {
      title: "Business Details",
      icon: Briefcase,
      color: "text-amber-400",
      fields: [
        { label: "Store Name", value: profile.storeName },
        { label: "Business Type", value: profile.businessType?.replace('_', ' ')?.toUpperCase() },
        { label: "Category", value: profile.productCategory },
      ]
    },
    {
      title: "Location",
      icon: MapPin,
      color: "text-emerald-400",
      fields: [
        { label: "Address", value: profile.shopAddress },
        { label: "State", value: profile.state },
        { label: "Pincode", value: profile.pincode },
      ]
    },
    {
      title: "Banking",
      icon: CreditCard,
      color: "text-blue-400",
      fields: [
        { label: "Holder Name", value: profile.accountHolderName },
        { label: "A/C Number", value: profile.accountNumber ? "••••" + String(profile.accountNumber).slice(-4) : "—" },
        { label: "Bank Name", value: profile.bankName },
      ]
    }
  ] : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0a0714] border-l border-white/10 z-50 shadow-2xl flex flex-col overflow-y-auto"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0a0714] z-10">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 bg-violet-600/20 rounded-full flex items-center justify-center text-violet-400 border border-violet-500/30">
                    <Store className="h-5 w-5" />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Seller Profile</h2>
                    <p className="text-xs text-slate-400">Onboarding Data</p>
                 </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 flex-1">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                  <p className="text-sm text-slate-400">Loading secure profile...</p>
                </div>
              ) : error ? (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center text-sm">
                  {error}
                </div>
              ) : profile ? (
                <div className="space-y-6">
                  {sections.map((sec, idx) => (
                    <div key={idx} className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
                       <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2 bg-white/[0.02]">
                           <sec.icon className={`h-4 w-4 ${sec.color}`} />
                           <h3 className="font-semibold text-slate-200 text-sm">{sec.title}</h3>
                       </div>
                       <div className="p-4 space-y-4">
                          {sec.fields.map((field, fIdx) => (
                             <div key={fIdx} className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-0.5">{field.label}</span>
                                <span className="text-sm text-slate-200 font-medium break-words">{field.value || "—"}</span>
                             </div>
                          ))}
                       </div>
                    </div>
                  ))}
                  
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
                       <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2 bg-white/[0.02]">
                           <FileText className="h-4 w-4 text-indigo-400" />
                           <h3 className="font-semibold text-slate-200 text-sm">Document Status</h3>
                       </div>
                       <div className="p-4 flex flex-col gap-3">
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-400">Govt ID</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${profile.govtIdFile ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'}`}>{profile.govtIdFile ? 'Verified' : 'Missing'}</span>
                           </div>
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-400">Business Proof</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${profile.businessProofFile ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>{profile.businessProofFile ? 'Verified' : 'Optional'}</span>
                           </div>
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-400">Bank Proof</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${profile.bankProofFile ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'}`}>{profile.bankProofFile ? 'Verified' : 'Missing'}</span>
                           </div>
                       </div>
                  </div>
                </div>
              ) : null}
            </div>
            
            <div className="p-6 border-t border-white/10">
               <button onClick={onClose} className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium transition-all text-sm">
                  Close Profile
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
