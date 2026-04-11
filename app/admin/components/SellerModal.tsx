"use client";

import { X, CheckCircle2, XCircle, FileText, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  seller: any;
  onUpdateStatus: (id: string, newStatus: string) => void;
  isUpdating: boolean;
}

export default function SellerModal({ isOpen, onClose, seller, onUpdateStatus, isUpdating }: SellerModalProps) {
  if (!isOpen || !seller) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/50">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Seller Application</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">ID: {seller._id}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto max-h-[60vh] space-y-8">
            {/* Status overview */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Current Status:</span>
              <span
                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                  seller.sellerStatus === "approved"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                    : seller.sellerStatus === "rejected"
                    ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                }`}
              >
                {seller.sellerStatus.replace("_", " ")}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  Basic Info
                </h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <dt className="text-slate-500">Full Name</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-200">{seller.fullName}</dd>
                  <dt className="text-slate-500">Email</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-200">{seller.email}</dd>
                  <dt className="text-slate-500">Phone</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-200">{seller.phone}</dd>
                  <dt className="text-slate-500">Store Name</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-200">{seller.storeName}</dd>
                </dl>
              </div>

              {/* Business Details */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  Business Details
                </h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <dt className="text-slate-500">Business Type</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-200 capitalize">{seller.businessType.replace("_", " ")}</dd>
                  <dt className="text-slate-500">Category</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-200">{seller.productCategory}</dd>
                  <dt className="text-slate-500">GST Number</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-200">{seller.gstNumber || "N/A"}</dd>
                  <dt className="text-slate-500">PAN Number</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-200">{seller.panNumber || "N/A"}</dd>
                </dl>
              </div>

              {/* Location & Delivery */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  Location & Delivery
                </h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <dt className="text-slate-500">Shop Address</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-200">{seller.shopAddress}</dd>
                  <dt className="text-slate-500">City / State</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-200">{seller.city}, {seller.state} {seller.pincode}</dd>
                  <dt className="text-slate-500">Precise Location</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-200">{seller.preciseLocation || "N/A"}</dd>
                  <dt className="text-slate-500">Service Radius</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-200">{seller.serviceRadius}</dd>
                  <dt className="text-slate-500">Delivery Type</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-200 capitalize">{seller.deliveryType.replace("_", " ")}</dd>
                  <dt className="text-slate-500">Inventory Type</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-200 capitalize">{seller.inventoryType ? seller.inventoryType.replace("_", " ") : "N/A"}</dd>
                </dl>
              </div>

              {/* Bank & Documents */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  Bank Details
                </h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mb-4">
                  <dt className="text-slate-500">Account Name</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-200">{seller.accountHolderName}</dd>
                  <dt className="text-slate-500">Bank Name</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-200">{seller.bankName}</dd>
                  <dt className="text-slate-500">Account No.</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-200">{seller.accountNumber}</dd>
                  <dt className="text-slate-500">IFSC Code</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-200">{seller.ifscCode}</dd>
                </dl>

                <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 pt-2">
                  Uploaded Documents
                </h3>
                <div className="flex flex-col gap-2 mt-2 font-medium text-sm">
                  {seller.govtIdFile ? (
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400"><FileText className="h-4 w-4"/> Govt ID: {seller.govtIdFile}</div>
                  ) : <div className="text-slate-400">Govt ID: N/A</div>}
                  
                  {seller.businessProofFile ? (
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400"><FileText className="h-4 w-4"/> Business Proof: {seller.businessProofFile}</div>
                  ) : <div className="text-slate-400">Business Proof: N/A</div>}
                  
                  {seller.bankProofFile ? (
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400"><FileText className="h-4 w-4"/> Bank Proof: {seller.bankProofFile}</div>
                  ) : <div className="text-slate-400">Bank Proof: N/A</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-slate-50 dark:bg-slate-950 p-6 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onClose}
              disabled={isUpdating}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
            <div className="flex w-full sm:w-auto items-center gap-3">
              <button
                onClick={() => onUpdateStatus(seller._id, "rejected")}
                disabled={isUpdating || seller.sellerStatus === "rejected"}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${
                  seller.sellerStatus === "rejected"
                    ? "opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700"
                    : "text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-300 dark:bg-red-950/40 dark:hover:bg-red-950/60 border border-red-200 dark:border-red-900/50"
                }`}
              >
                <XCircle className="h-4 w-4" /> Reject
              </button>
              <button
                onClick={() => onUpdateStatus(seller._id, "approved")}
                disabled={isUpdating || seller.sellerStatus === "approved"}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm ${
                  seller.sellerStatus === "approved"
                    ? "opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700 shadow-none"
                    : "text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" /> Approve
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
