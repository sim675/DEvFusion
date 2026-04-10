"use client";

import { useState, useRef, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  CreditCard,
  Upload,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Building2,
  Package,
  Truck,
  ToggleLeft,
  ToggleRight,
  FileText,
  Loader2,
  Navigation,
  AlertCircle,
  Zap,
  Users,
  BarChart3,
  Briefcase,
  Landmark,
  Timer,
  Bike,
  ShoppingBag,
  Globe,
  MapPinned,
} from "lucide-react";
import Link from "next/link";

// ─────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────
interface SellerFormData {
  fullName: string;
  phone: string;
  email: string;
  storeName: string;
  businessType: string;
  productCategory: string;
  gstNumber: string;
  panNumber: string;
  shopAddress: string;
  city: string;
  state: string;
  pincode: string;
  preciseLocation: string;
  serviceRadius: string;
  deliveryTypes: string[];         // multi-select
  deliveryTimeCommitment: string;
  openTime: string;
  closeTime: string;
  inventoryType: string;
  acceptingOrders: boolean;
  pickupAvailable: boolean;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}

interface FileState {
  govtIdFile: File | null;
  businessProofFile: File | null;
  bankProofFile: File | null;
}

// ─────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────
const STEPS = [
  { label: "Basic Info",   icon: User,       desc: "Name, phone, email" },
  { label: "Business",     icon: Briefcase,  desc: "Type, category, GST" },
  { label: "Location",     icon: MapPinned,  desc: "Store & delivery setup" },
  { label: "Operations",   icon: Package,    desc: "Inventory & availability" },
  { label: "Bank",         icon: Landmark,   desc: "Payout details" },
  { label: "Documents",    icon: FileText,   desc: "Identity & bank proof" },
];

const PRODUCT_CATEGORIES = [
  "Grocery & Supermarket","Pharmacy & Healthcare","Electronics & Gadgets",
  "Clothing & Fashion","Food & Restaurant","Home & Furniture","Books & Stationery",
  "Sports & Fitness","Beauty & Personal Care","Automotive","Toys & Games","Other",
];

const INDIA_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa",
  "Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala",
  "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland",
  "Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir",
  "Ladakh","Puducherry","Chandigarh",
];

const GST_REGEX  = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const initial: SellerFormData = {
  fullName: "", phone: "", email: "", storeName: "",
  businessType: "", productCategory: "", gstNumber: "", panNumber: "",
  shopAddress: "", city: "", state: "", pincode: "", preciseLocation: "",
  serviceRadius: "5km",
  deliveryTypes: ["self_delivery"],
  deliveryTimeCommitment: "same_day",
  openTime: "09:00", closeTime: "21:00",
  inventoryType: "", acceptingOrders: true, pickupAvailable: true,
  accountHolderName: "", bankName: "", accountNumber: "", ifscCode: "",
};

// ─────────────────────────────────────────────────────
// Re-usable small components
// ─────────────────────────────────────────────────────
function Field({
  label, required, error, hint, children,
}: { label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
        {label}
        {required && <span className="text-violet-400">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-slate-600 pl-0.5">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-red-400">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

function TextInput({
  icon: Icon, ...props
}: { icon?: React.ElementType } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />}
      <input
        {...props}
        className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-violet-500/5 transition-all ${props.className ?? ""}`}
      />
    </div>
  );
}

function StyledSelect({
  icon: Icon, children, ...props
}: { icon?: React.ElementType; children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none z-10" />}
      <select
        {...props}
        className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-8 py-3 rounded-xl bg-[#12101f] border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all appearance-none cursor-pointer ${props.className ?? ""}`}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
        <svg className="h-4 w-4 text-slate-500" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

/** Horizontal pill-style single-select */
function PillOption({
  options, value, onChange,
}: {
  options: { val: string; label: string; desc?: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.val}
          type="button"
          onClick={() => onChange(opt.val)}
          className={`group flex flex-col items-start px-4 py-2.5 rounded-xl border text-left transition-all ${
            value === opt.val
              ? "border-violet-500/60 bg-violet-500/15 text-white"
              : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-slate-200"
          }`}
        >
          <span className="text-sm font-semibold leading-none">{opt.label}</span>
          {opt.desc && <span className="text-[11px] mt-1 opacity-70 leading-none">{opt.desc}</span>}
        </button>
      ))}
    </div>
  );
}

/** Horizontal card-style multi-select */
function MultiCard({
  options, values, onToggle,
}: {
  options: { val: string; label: string; desc: string; icon: React.ElementType }[];
  values: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map(({ val, label, desc, icon: Icon }) => {
        const active = values.includes(val);
        return (
          <button
            key={val}
            type="button"
            onClick={() => onToggle(val)}
            className={`relative flex items-start gap-3 px-4 py-3 rounded-xl border transition-all min-w-[160px] ${
              active
                ? "border-violet-500/60 bg-violet-500/15 text-white"
                : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-slate-200"
            }`}
          >
            <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${active ? "text-violet-400" : "text-slate-500"}`} />
            <div className="text-left">
              <p className="text-sm font-semibold leading-tight">{label}</p>
              <p className="text-[11px] mt-0.5 opacity-70 leading-snug">{desc}</p>
            </div>
            {active && (
              <span className="absolute top-2 right-2 h-4 w-4 rounded-full bg-violet-500 flex items-center justify-center">
                <CheckCircle2 className="h-3 w-3 text-white" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Business type card (3-up) */
function BusinessCard({
  options, value, onChange,
}: {
  options: { val: string; label: string; desc: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {options.map((opt) => (
        <button
          key={opt.val}
          type="button"
          onClick={() => onChange(opt.val)}
          className={`text-left p-4 rounded-xl border transition-all ${
            value === opt.val
              ? "border-violet-500/60 bg-violet-500/10 text-white"
              : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20"
          }`}
        >
          <p className="text-sm font-semibold">{opt.label}</p>
          <p className="text-[11px] mt-0.5 opacity-70">{opt.desc}</p>
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// STEP 1 – Basic Info
// ─────────────────────────────────────────────────────
function Step1({ data, onChange, errors }: {
  data: SellerFormData;
  onChange: (k: keyof SellerFormData, v: string) => void;
  errors: Partial<Record<string, string>>;
}) {
  return (
    <div className="space-y-5">
      <Field label="Full Name" required error={errors.fullName}>
        <TextInput icon={User} placeholder="e.g. Rajesh Kumar" value={data.fullName}
          onChange={(e) => onChange("fullName", e.target.value)} />
      </Field>
      <Field label="Phone Number" required error={errors.phone}>
        <TextInput icon={Phone} type="tel" placeholder="+91 98765 43210" value={data.phone}
          onChange={(e) => onChange("phone", e.target.value)} />
      </Field>
      <Field label="Email Address" required error={errors.email}>
        <TextInput icon={Mail} type="email" placeholder="you@example.com" value={data.email}
          onChange={(e) => onChange("email", e.target.value)} />
      </Field>
      <Field label="Store Name" required error={errors.storeName}>
        <TextInput icon={Store} placeholder="e.g. Fresh Bazar Kolkata" value={data.storeName}
          onChange={(e) => onChange("storeName", e.target.value)} />
      </Field>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// STEP 2 – Business Details
// ─────────────────────────────────────────────────────
function Step2({ data, onChange, errors }: {
  data: SellerFormData;
  onChange: (k: keyof SellerFormData, v: string) => void;
  errors: Partial<Record<string, string>>;
}) {
  return (
    <div className="space-y-6">
      <Field label="Business Type" required error={errors.businessType}>
        <BusinessCard
          value={data.businessType}
          onChange={(v) => onChange("businessType", v)}
          options={[
            { val: "individual",      label: "Individual",      desc: "Personal seller, no registration" },
            { val: "sole_proprietor", label: "Sole Proprietor", desc: "Single-owner registered business" },
            { val: "shop_owner",      label: "Shop Owner",      desc: "Physical store with registration" },
          ]}
        />
      </Field>
      <Field label="Product Category" required error={errors.productCategory}>
        <StyledSelect icon={Package} value={data.productCategory}
          onChange={(e) => onChange("productCategory", e.target.value)}>
          <option value="">Select a category…</option>
          {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </StyledSelect>
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="GST Number" error={errors.gstNumber} hint="Format: 22AAAAA0000A1Z5">
          <TextInput icon={FileText} placeholder="Optional" value={data.gstNumber}
            onChange={(e) => onChange("gstNumber", e.target.value.toUpperCase())} />
        </Field>
        <Field label="PAN Number" hint="Format: ABCDE1234F">
          <TextInput icon={CreditCard} placeholder="Optional" value={data.panNumber}
            onChange={(e) => onChange("panNumber", e.target.value.toUpperCase())} />
        </Field>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// STEP 3 – Local Store Setup
// ─────────────────────────────────────────────────────
function Step3({ data, onChange, onDeliveryToggle, errors }: {
  data: SellerFormData;
  onChange: (k: keyof SellerFormData, v: string) => void;
  onDeliveryToggle: (val: string) => void;
  errors: Partial<Record<string, string>>;
}) {
  return (
    <div className="space-y-7">

      {/* ── Shop Address ── */}
      <Field label="Shop Address" required error={errors.shopAddress}>
        <TextInput icon={MapPin} placeholder="Street, Area, Landmark" value={data.shopAddress}
          onChange={(e) => onChange("shopAddress", e.target.value)} />
      </Field>

      {/* ── City / State / Pincode ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="City" required error={errors.city}>
          <div className="relative">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
            <input
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-violet-500/5 transition-all"
              placeholder="Kolkata"
              value={data.city}
              onChange={(e) => onChange("city", e.target.value)}
            />
          </div>
        </Field>
        <Field label="State" required error={errors.state}>
          <StyledSelect value={data.state} onChange={(e) => onChange("state", e.target.value)}>
            <option value="">Select state…</option>
            {INDIA_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </StyledSelect>
        </Field>
        <Field label="Pincode" required error={errors.pincode}>
          <div className="relative">
            <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-violet-500/5 transition-all"
              placeholder="700001"
              value={data.pincode}
              onChange={(e) => onChange("pincode", e.target.value.replace(/\D/g, ""))}
            />
          </div>
        </Field>
      </div>

      {/* ── Precise Location ── */}
      <Field label="Precise Location" required error={errors.preciseLocation}
        hint="Paste a Google Maps share link, or enter lat,long — e.g. 22.5726, 88.3639">
        <div className="relative">
          <MapPinned className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
          <textarea
            rows={2}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-violet-500/5 transition-all resize-none"
            placeholder="https://maps.app.goo.gl/... or 22.5726, 88.3639"
            value={data.preciseLocation}
            onChange={(e) => onChange("preciseLocation", e.target.value)}
          />
        </div>
      </Field>

      {/* ── Divider ── */}
      <div className="border-t border-white/5" />

      {/* ── Service Radius ── */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
          Service Radius <span className="text-violet-400">*</span>
        </p>
        <PillOption
          value={data.serviceRadius}
          onChange={(v) => onChange("serviceRadius", v)}
          options={[
            { val: "2km",  label: "2 km",  desc: "Ultra-local · doorstep" },
            { val: "5km",  label: "5 km",  desc: "Neighbourhood · most popular" },
            { val: "10km", label: "10 km", desc: "City zone · wider reach" },
          ]}
        />
      </div>

      {/* ── Delivery Type (multi-select) ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            Delivery Type <span className="text-violet-400">*</span>
          </p>
          <span className="text-[10px] text-slate-500 italic">Select all that apply</span>
        </div>
        <MultiCard
          values={data.deliveryTypes}
          onToggle={onDeliveryToggle}
          options={[
            { val: "self_delivery",      label: "Self Delivery",      desc: "You deliver orders yourself",          icon: Bike },
            { val: "pickup_only",        label: "Pickup Only",         desc: "Customer collects from your shop",     icon: ShoppingBag },
            { val: "platform_delivery",  label: "Platform Delivery",   desc: "VendorHub logistics (coming soon)",    icon: Globe },
          ]}
        />
        {data.deliveryTypes.length === 0 && (
          <p className="flex items-center gap-1 text-[11px] text-red-400 mt-2">
            <AlertCircle className="h-3 w-3" /> Select at least one delivery type.
          </p>
        )}
      </div>

      {/* ── Delivery Time Commitment ── */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
          Delivery Time Commitment <span className="text-violet-400">*</span>
        </p>
        <PillOption
          value={data.deliveryTimeCommitment}
          onChange={(v) => onChange("deliveryTimeCommitment", v)}
          options={[
            { val: "instant",   label: "Instant",   desc: "Within 1–2 hrs" },
            { val: "same_day",  label: "Same Day",   desc: "Before midnight" },
            { val: "next_day",  label: "Next Day",   desc: "Within 24 hrs" },
          ]}
        />
      </div>

      {/* ── Operating Hours ── */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Opening Time" required error={errors.openTime}>
          <div className="relative">
            <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
            <input type="time"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#12101f] border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all"
              value={data.openTime}
              onChange={(e) => onChange("openTime", e.target.value)}
            />
          </div>
        </Field>
        <Field label="Closing Time" required error={errors.closeTime}>
          <div className="relative">
            <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
            <input type="time"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#12101f] border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all"
              value={data.closeTime}
              onChange={(e) => onChange("closeTime", e.target.value)}
            />
          </div>
        </Field>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// STEP 4 – Store Operations
// ─────────────────────────────────────────────────────
function Step4({ data, onChange, onToggle, errors }: {
  data: SellerFormData;
  onChange: (k: keyof SellerFormData, v: string) => void;
  onToggle: (k: "acceptingOrders" | "pickupAvailable") => void;
  errors: Partial<Record<string, string>>;
}) {
  return (
    <div className="space-y-6">
      <Field label="Inventory Type" required error={errors.inventoryType}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { val: "ready_stock",   label: "Ready Stock",    desc: "Products available immediately for dispatch" },
            { val: "made_to_order", label: "Made to Order",  desc: "Prepared fresh after an order is placed" },
          ].map((opt) => (
            <button key={opt.val} type="button" onClick={() => onChange("inventoryType", opt.val)}
              className={`text-left p-4 rounded-xl border transition-all ${
                data.inventoryType === opt.val
                  ? "border-violet-500/60 bg-violet-500/10 text-white"
                  : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20"
              }`}>
              <p className="text-sm font-semibold">{opt.label}</p>
              <p className="text-[11px] mt-0.5 opacity-70">{opt.desc}</p>
            </button>
          ))}
        </div>
      </Field>

      {[
        { key: "acceptingOrders" as const, label: "Accepting Orders", desc: "Turn OFF to temporarily pause new orders from customers" },
        { key: "pickupAvailable" as const, label: "Pickup Available", desc: "Allow customers to collect orders directly from your shop" },
      ].map(({ key, label, desc }) => (
        <div key={key} className="rounded-xl border border-white/10 bg-white/[0.03] p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white">{label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
          </div>
          <button type="button" onClick={() => onToggle(key)} className="flex-shrink-0 transition-colors">
            {data[key]
              ? <ToggleRight className="h-9 w-9 text-violet-400" />
              : <ToggleLeft  className="h-9 w-9 text-slate-600" />}
          </button>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// STEP 5 – Bank
// ─────────────────────────────────────────────────────
function Step5({ data, onChange, errors }: {
  data: SellerFormData;
  onChange: (k: keyof SellerFormData, v: string) => void;
  errors: Partial<Record<string, string>>;
}) {
  return (
    <div className="space-y-5">
      <Field label="Account Holder Name" required error={errors.accountHolderName}>
        <TextInput icon={User} placeholder="Exactly as per bank records" value={data.accountHolderName}
          onChange={(e) => onChange("accountHolderName", e.target.value)} />
      </Field>
      <Field label="Bank Name" required error={errors.bankName}>
        <TextInput icon={Building2} placeholder="e.g. State Bank of India" value={data.bankName}
          onChange={(e) => onChange("bankName", e.target.value)} />
      </Field>
      <Field label="Account Number" required error={errors.accountNumber}>
        <TextInput icon={CreditCard} placeholder="Enter account number" value={data.accountNumber}
          onChange={(e) => onChange("accountNumber", e.target.value)} />
      </Field>
      <Field label="IFSC Code" required error={errors.ifscCode} hint="Format: SBIN0001234">
        <TextInput icon={FileText} placeholder="e.g. SBIN0001234" value={data.ifscCode}
          onChange={(e) => onChange("ifscCode", e.target.value.toUpperCase())} />
      </Field>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// STEP 6 – Documents
// ─────────────────────────────────────────────────────
function Step6({ files, onFileChange, errors }: {
  files: FileState;
  onFileChange: (k: keyof FileState, f: File | null) => void;
  errors: Partial<Record<string, string>>;
}) {
  const govtRef = useRef<HTMLInputElement>(null);
  const bizRef  = useRef<HTMLInputElement>(null);
  const bankRef = useRef<HTMLInputElement>(null);
  const ACCEPTED = ".jpg,.jpeg,.png,.pdf";
  const MAX_MB = 5;

  function Box({ label, required, fileKey, inputRef, hint }: {
    label: string; required?: boolean;
    fileKey: keyof FileState;
    inputRef: React.RefObject<HTMLInputElement | null>;
    hint: string;
  }) {
    const file = files[fileKey];
    const err  = errors[fileKey];
    const handlePick = (e: ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0] ?? null;
      if (f && f.size > MAX_MB * 1024 * 1024) { onFileChange(fileKey, null); return; }
      onFileChange(fileKey, f);
    };
    return (
      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          {label}{required && <span className="text-violet-400 ml-1">*</span>}
        </label>
        <button type="button" onClick={() => inputRef.current?.click()}
          className={`w-full rounded-xl border-2 border-dashed p-5 text-center transition-all ${
            file ? "border-violet-500/40 bg-violet-500/5" : "border-white/10 bg-white/[0.02] hover:border-white/20"
          }`}>
          {file ? (
            <div className="flex items-center justify-center gap-2 text-violet-400">
              <FileText className="h-5 w-5" />
              <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-500">
              <Upload className="h-6 w-6" />
              <span className="text-sm">{hint}</span>
              <span className="text-xs">PDF / JPG / PNG — max {MAX_MB} MB</span>
            </div>
          )}
        </button>
        <input ref={inputRef} type="file" accept={ACCEPTED} className="hidden" onChange={handlePick} />
        {err && <p className="flex items-center gap-1 text-[11px] text-red-400"><AlertCircle className="h-3 w-3" />{err}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3">
        <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-300 leading-relaxed">
          Upload clear, legible documents. Blurry or invalid files will delay verification.
        </p>
      </div>
      <Box label="Government ID" required fileKey="govtIdFile" inputRef={govtRef} hint="Aadhar Card or PAN Card" />
      <Box label="Business Proof" fileKey="businessProofFile" inputRef={bizRef}   hint="GST Certificate (optional)" />
      <Box label="Bank Proof"     required fileKey="bankProofFile" inputRef={bankRef} hint="Cancelled Cheque or Passbook" />
    </div>
  );
}

// ─────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────
function Sidebar({ step, setStep, completedUpTo }: {
  step: number;
  setStep: (i: number) => void;
  completedUpTo: number;
}) {
  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 flex-shrink-0">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 group mb-10">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow">
          <Store className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-bold tracking-tight text-white">VendorHub</span>
      </Link>

      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-4 pl-1">
        Seller Onboarding
      </p>

      <nav className="space-y-1">
        {STEPS.map(({ label, icon: Icon, desc }, i) => {
          const done   = i < completedUpTo;
          const active = i === step;
          const locked = i > completedUpTo;
          return (
            <button
              key={i}
              type="button"
              disabled={locked}
              onClick={() => !locked && setStep(i)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all group ${
                active
                  ? "bg-violet-500/15 border border-violet-500/30 text-white"
                  : done
                  ? "hover:bg-white/5 text-slate-400 hover:text-white cursor-pointer"
                  : "opacity-30 cursor-not-allowed text-slate-600"
              }`}
            >
              {/* Step icon / check */}
              <span className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                active ? "bg-violet-500/30 text-violet-300"
                : done  ? "bg-green-500/15 text-green-400"
                : "bg-white/5 text-slate-600"
              }`}>
                {done && !active
                  ? <CheckCircle2 className="h-4 w-4" />
                  : <Icon className="h-4 w-4" />}
              </span>

              <div className="min-w-0">
                <p className={`text-sm font-semibold leading-none ${active ? "text-white" : ""}`}>
                  {label}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-none">{desc}</p>
              </div>

              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom note */}
      <div className="mt-auto pt-10">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
          {[
            { icon: Zap,     text: "Reach local customers instantly" },
            { icon: Timer,   text: "Deliver in hours, not days" },
            { icon: BarChart3, text: "Real-time sales analytics" },
            { icon: Users,   text: "Build community trust" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5 text-slate-500">
              <Icon className="h-3.5 w-3.5 text-violet-500/70 flex-shrink-0" />
              <span className="text-[11px] leading-tight">{text}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-700 mt-4 pl-1">
          © {new Date().getFullYear()} VendorHub
        </p>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────
export default function BecomeSellerPage() {
  const [step, setStep]           = useState(0);
  const [completedUpTo, setCompleted] = useState(0);
  const [form, setForm]           = useState<SellerFormData>(initial);
  const [files, setFiles]         = useState<FileState>({ govtIdFile: null, businessProofFile: null, bankProofFile: null });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // ── Setters ──
  const handleChange = (k: keyof SellerFormData, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    setFieldErrors((p) => ({ ...p, [k]: undefined }));
  };

  const handleToggle = (k: "acceptingOrders" | "pickupAvailable") =>
    setForm((p) => ({ ...p, [k]: !p[k] }));

  const handleDeliveryToggle = (val: string) => {
    setForm((p) => {
      const has = p.deliveryTypes.includes(val);
      return {
        ...p,
        deliveryTypes: has
          ? p.deliveryTypes.filter((t) => t !== val)
          : [...p.deliveryTypes, val],
      };
    });
  };

  const handleFileChange = (k: keyof FileState, file: File | null) => {
    setFiles((p) => ({ ...p, [k]: file }));
    setFieldErrors((p) => ({ ...p, [k]: undefined }));
  };

  // ── Per-step validation ──
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (step === 0) {
      if (!form.fullName.trim())  errs.fullName  = "Full name is required.";
      if (!form.phone.trim())     errs.phone     = "Phone number is required.";
      if (!form.email.trim())     errs.email     = "Email is required.";
      else if (!/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(form.email)) errs.email = "Enter a valid email.";
      if (!form.storeName.trim()) errs.storeName = "Store name is required.";
    }

    if (step === 1) {
      if (!form.businessType)    errs.businessType    = "Select a business type.";
      if (!form.productCategory) errs.productCategory = "Select a product category.";
      if (form.gstNumber.trim() && !GST_REGEX.test(form.gstNumber.trim()))
        errs.gstNumber = "Invalid GST format. Example: 22AAAAA0000A1Z5";
    }

    if (step === 2) {
      if (!form.shopAddress.trim())    errs.shopAddress    = "Shop address is required.";
      if (!form.preciseLocation.trim()) errs.preciseLocation = "Precise location is required.";
      if (!form.city.trim())           errs.city           = "City is required.";
      if (!form.state)                 errs.state          = "State is required.";
      if (!form.pincode.trim())        errs.pincode        = "Pincode is required.";
      if (form.deliveryTypes.length === 0) errs.deliveryTypes = "Select at least one delivery type.";
      if (!form.openTime)              errs.openTime       = "Opening time is required.";
      if (!form.closeTime)             errs.closeTime      = "Closing time is required.";
    }

    if (step === 3) {
      if (!form.inventoryType) errs.inventoryType = "Select an inventory type.";
    }

    if (step === 4) {
      if (!form.accountHolderName.trim()) errs.accountHolderName = "Account holder name is required.";
      if (!form.bankName.trim())          errs.bankName          = "Bank name is required.";
      if (!form.accountNumber.trim())     errs.accountNumber     = "Account number is required.";
      if (!form.ifscCode.trim())          errs.ifscCode          = "IFSC code is required.";
      else if (!IFSC_REGEX.test(form.ifscCode.trim()))
        errs.ifscCode = "Invalid IFSC format. Example: SBIN0001234";
    }

    if (step === 5) {
      if (!files.govtIdFile)  errs.govtIdFile  = "Government ID is required.";
      if (!files.bankProofFile) errs.bankProofFile = "Bank proof is required.";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    const next = Math.min(step + 1, STEPS.length - 1);
    setStep(next);
    setCompleted((c) => Math.max(c, next));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  // ── Submit ──
  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const fd = new FormData();
      (Object.keys(form) as (keyof SellerFormData)[]).forEach((k) => {
        if (k === "deliveryTypes") {
          fd.append(k, (form[k] as string[]).join(","));
        } else {
          fd.append(k, String(form[k]));
        }
      });
      if (files.govtIdFile)       fd.append("govtIdFile",       files.govtIdFile);
      if (files.businessProofFile) fd.append("businessProofFile", files.businessProofFile);
      if (files.bankProofFile)    fd.append("bankProofFile",    files.bankProofFile);

      const res  = await fetch("/api/seller/register", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setSubmitted(true);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────
  // Success screen
  // ─────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#07050f] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }} className="max-w-lg w-full text-center space-y-6">
          <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-500/30">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Application Submitted!</h1>
            <p className="mt-3 text-slate-400 leading-relaxed">
              Your seller account is under verification. Once approved, you can start selling to customers in your area.
            </p>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-left space-y-2">
            <p className="text-amber-400 text-sm font-semibold">⏳ What happens next?</p>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li>Our team reviews your documents within 24–48 hours.</li>
              <li>You'll receive an email once approved.</li>
              <li>Your seller dashboard activates after approval.</li>
            </ul>
          </div>
          <Link href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20">
            Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Progress (for mobile top bar)
  // ─────────────────────────────────────────────
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-[#07050f] text-white flex">

      {/* ── Sidebar ── */}
      <div className="hidden lg:flex flex-col w-64 xl:w-72 flex-shrink-0 border-r border-white/5 min-h-screen p-6 sticky top-0 h-screen overflow-y-auto">
        <Sidebar step={step} setStep={setStep} completedUpTo={completedUpTo} />
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-h-screen">

        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-40 border-b border-white/5 bg-[#07050f]/90 backdrop-blur-xl">
          <div className="px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Store className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-bold">VendorHub</span>
            </Link>
            <span className="text-xs text-slate-500">Step {step + 1} / {STEPS.length} — {STEPS[step].label}</span>
          </div>
          {/* Progress bar */}
          <div className="h-0.5 bg-white/5">
            <motion.div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500"
              animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
          </div>
        </header>

        {/* Scrollable form area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 sm:px-8 py-10">

            {/* Mobile step pills */}
            <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-6 scrollbar-hide">
              {STEPS.map(({ label }, i) => (
                <div key={i} className="flex items-center gap-1.5 flex-shrink-0">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    i === step ? "bg-violet-500/20 text-violet-300 border-violet-500/40"
                    : i < step  ? "bg-green-500/10  text-green-400  border-green-500/20"
                    : "bg-white/5 text-slate-600 border-white/5"
                  }`}>
                    {i < step ? <CheckCircle2 className="h-3 w-3" /> : <span className="text-[10px]">{i + 1}</span>}
                    {label}
                  </div>
                  {i < STEPS.length - 1 && <div className="h-px w-3 bg-white/10 flex-shrink-0" />}
                </div>
              ))}
            </div>

            {/* Submit error */}
            {submitError && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 flex items-center gap-2 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />{submitError}
              </motion.div>
            )}

            {/* Form card */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] backdrop-blur-sm overflow-hidden">
              {/* Card header */}
              <div className="border-b border-white/5 px-6 py-5">
                <div className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                    {(() => { const Icon = STEPS[step].icon; return <Icon className="h-4.5 w-4.5 text-violet-400" />; })()}
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-none">
                      {step === 0 && "Basic Information"}
                      {step === 1 && "Business Details"}
                      {step === 2 && "Local Store Setup"}
                      {step === 3 && "Store Operations"}
                      {step === 4 && "Bank & Verification"}
                      {step === 5 && "Document Upload"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {step === 0 && "Tell us about yourself and your store"}
                      {step === 1 && "Describe your business type and products you sell"}
                      {step === 2 && "Set your store location, radius and delivery preferences"}
                      {step === 3 && "Configure inventory type and availability"}
                      {step === 4 && "Add bank details for seamless payouts"}
                      {step === 5 && "Upload identity and bank proof for verification"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card body */}
              <div className="px-6 py-7">
                <AnimatePresence mode="wait">
                  <motion.div key={step}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.22 }}>
                    {step === 0 && <Step1 data={form} onChange={handleChange} errors={fieldErrors} />}
                    {step === 1 && <Step2 data={form} onChange={handleChange} errors={fieldErrors} />}
                    {step === 2 && <Step3 data={form} onChange={handleChange} onDeliveryToggle={handleDeliveryToggle} errors={fieldErrors} />}
                    {step === 3 && <Step4 data={form} onChange={handleChange} onToggle={handleToggle} errors={fieldErrors} />}
                    {step === 4 && <Step5 data={form} onChange={handleChange} errors={fieldErrors} />}
                    {step === 5 && <Step6 files={files} onFileChange={handleFileChange} errors={fieldErrors} />}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Card footer – navigation */}
              <div className="border-t border-white/5 px-6 py-5 flex items-center justify-between gap-4">
                <button type="button" onClick={handleBack} disabled={step === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronLeft className="h-4 w-4" />Back
                </button>

                {step < STEPS.length - 1 ? (
                  <motion.button type="button" onClick={handleNext}
                    whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-violet-500/20 transition-all">
                    Continue <ChevronRight className="h-4 w-4" />
                  </motion.button>
                ) : (
                  <motion.button type="button" onClick={handleSubmit} disabled={isSubmitting}
                    whileHover={{ scale: isSubmitting ? 1 : 1.015 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.985 }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-violet-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                    {isSubmitting
                      ? <><Loader2 className="h-4 w-4 animate-spin" />Submitting…</>
                      : <><CheckCircle2 className="h-4 w-4" />Submit Application</>}
                  </motion.button>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
