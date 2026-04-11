"use client";

import { useState, useEffect } from "react";
import { Store, Clock, Map, Truck, Save, Info, MapPin, Loader2, Navigation } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [storeStatus, setStoreStatus] = useState(true);
  const [radius, setRadius] = useState("5");
  const [locationCoords, setLocationCoords] = useState<{lat: number, lng: number} | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [locationStatus, setLocationStatus] = useState<"idle" | "fetching" | "success" | "error">("idle");
  
  // Fulfillment multiple options state
  const [fulfillment, setFulfillment] = useState({
    selfDelivery: true,
    pickup: true,
    platform: false
  });

  useEffect(() => {
    fetch("/api/seller/profile")
      .then(r => r.json())
      .then(data => {
         if (data && !data.error) {
             setStoreStatus(data.acceptingOrders ?? true);
             if (data.serviceRadius) setRadius(data.serviceRadius.replace("km", ""));
             if (data.location?.coordinates && data.location.coordinates.length === 2 && data.location.coordinates[0] !== 0) {
                 setLocationCoords({ lng: data.location.coordinates[0], lat: data.location.coordinates[1] });
             }
             setFulfillment({
                 selfDelivery: data.deliveryType === 'self_delivery',
                 pickup: data.pickupAvailable ?? true,
                 platform: data.deliveryType === 'platform_delivery'
             });
         }
         setIsLoading(false);
      }).catch(() => setIsLoading(false));
  }, []);

  const handleUpdateLocation = () => {
      setLocationStatus("fetching");
      navigator.geolocation.getCurrentPosition(
          (pos) => {
              setLocationCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
              setLocationStatus("success");
          },
          (err) => {
              setLocationStatus("error");
              alert("Could not get location. Make sure you allow location access.");
          }
      );
  };

  const handleSave = async () => {
      setIsSaving(true);
      try {
         const payload: any = {
             acceptingOrders: storeStatus,
             serviceRadius: radius,
             fulfillment
         };
         if (locationCoords) {
             payload.lat = locationCoords.lat;
             payload.lng = locationCoords.lng;
         }
         const res = await fetch("/api/seller/profile", {
             method: "PUT",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify(payload)
         });
         const data = await res.json();
         if (!res.ok) throw new Error(data.error || "Failed to save settings");
         alert("Settings saved successfully!");
      } catch (err: any) {
         alert(err.message);
      } finally {
         setIsSaving(false);
      }
  };

  const handleFulfillmentChange = (type: keyof typeof fulfillment) => {
    setFulfillment(prev => ({
       ...prev,
       [type]: !prev[type]
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Store Settings</h1>
          <p className="text-sm text-slate-400 mt-1">Configure your local presence and fulfillment availability.</p>
        </div>
        <button onClick={handleSave} disabled={isSaving || isLoading} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium transition-all shadow-lg shadow-violet-500/20 w-full sm:w-auto disabled:opacity-50">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="bg-[#0a0714] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/5 space-y-2">
             <div className="flex items-center gap-2">
                 <Store className="h-5 w-5 text-violet-400" />
                 <h2 className="text-lg font-bold">Store Status</h2>
             </div>
             <p className="text-sm text-slate-400">Control if your store is currently visible to nearby customers and accepting new orders.</p>
          </div>
          <div className="p-6 bg-white/[0.02]">
             <div className="flex items-center justify-between">
                 <div>
                     <p className="font-semibold text-white">Accepting Orders</p>
                     <p className="text-xs text-slate-500 mt-1">Turn off if you are overwhelmed or closed for holidays.</p>
                 </div>
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={storeStatus}
                      onChange={() => setStoreStatus(!storeStatus)}
                    />
                    <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                 </label>
             </div>
          </div>
      </div>

      <div className="bg-[#0a0714] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/5 space-y-2">
             <div className="flex items-center gap-2">
                 <Map className="h-5 w-5 text-indigo-400" />
                 <h2 className="text-lg font-bold">Hyperlocal Service Radius</h2>
             </div>
             <p className="text-sm text-slate-400">Define how far you are willing to deliver products from your store location.</p>
          </div>
          <div className="p-6 bg-white/[0.02]">
              <div className="grid grid-cols-3 gap-4">
                  {[
                      { val: "2", label: "2 km", desc: "Neighborhood only" },
                      { val: "5", label: "5 km", desc: "Standard local reach" },
                      { val: "10", label: "10 km", desc: "City wide delivery" }
                  ].map((rad) => (
                      <div 
                         key={rad.val}
                         onClick={() => setRadius(rad.val)}
                         className={`cursor-pointer rounded-xl border p-4 text-center transition-all ${radius === rad.val ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-black/40 border-white/10 hover:border-white/20'}`}
                      >
                         <p className={`font-bold text-lg ${radius === rad.val ? 'text-indigo-400' : 'text-slate-300'}`}>{rad.label}</p>
                         <p className="text-xs text-slate-500 mt-1">{rad.desc}</p>
                      </div>
                  ))}
              </div>
              <div className="mt-4 flex items-start gap-2 bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-lg">
                  <Info className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-indigo-300">Your store will only appear to buyers located within {radius} km of your registered address.</p>
              </div>
          </div>
      </div>

      <div className="bg-[#0a0714] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/5 space-y-2">
             <div className="flex items-center gap-2">
                 <MapPin className="h-5 w-5 text-emerald-400" />
                 <h2 className="text-lg font-bold">Store Coordinates</h2>
             </div>
             <p className="text-sm text-slate-400">Update your store's precise location on the map.</p>
          </div>
          <div className="p-6 bg-white/[0.02] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
             <div>
                 {locationCoords ? (
                     <div className="text-sm text-slate-300">
                         Map Location set: <span className="font-semibold text-white">{locationCoords.lat.toFixed(6)}, {locationCoords.lng.toFixed(6)}</span>
                     </div>
                 ) : (
                     <div className="text-sm text-slate-400">No precise location set. Please update below.</div>
                 )}
                 <p className="text-xs text-slate-500 mt-1">If this is inaccurate, nearby buyers won't be able to find your products.</p>
             </div>
             <button onClick={handleUpdateLocation} disabled={locationStatus === "fetching"} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 font-medium hover:bg-emerald-500/20 transition-all text-sm whitespace-nowrap disabled:opacity-50 border border-emerald-500/20">
                {locationStatus === "fetching" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                {locationStatus === "fetching" ? "Locating..." : "Get Current Location"}
             </button>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0a0714] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-white/5 space-y-2">
                 <div className="flex items-center gap-2">
                     <Truck className="h-5 w-5 text-blue-400" />
                     <h2 className="text-lg font-bold">Fulfillment Types</h2>
                 </div>
              </div>
              <div className="p-6 bg-white/[0.02] space-y-4">
                 <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={fulfillment.selfDelivery} onChange={() => handleFulfillmentChange('selfDelivery')} className="h-4 w-4 accent-blue-500 bg-white/5 border-white/20 rounded" />
                    <div>
                        <p className="font-semibold text-sm">Self Delivery</p>
                        <p className="text-xs text-slate-500">You manage deliveries to buyers directly.</p>
                    </div>
                 </label>
                 <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={fulfillment.pickup} onChange={() => handleFulfillmentChange('pickup')} className="h-4 w-4 accent-blue-500 bg-white/5 border-white/20 rounded" />
                    <div>
                        <p className="font-semibold text-sm">Store Pickup</p>
                        <p className="text-xs text-slate-500">Allow buyers to visit store and collect.</p>
                    </div>
                 </label>
                 <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={fulfillment.platform} onChange={() => handleFulfillmentChange('platform')} className="h-4 w-4 accent-blue-500 bg-white/5 border-white/20 rounded" />
                    <div>
                        <p className="font-semibold text-sm">Platform Delivery</p>
                        <p className="text-xs text-slate-500">Use VendorHub delivery partners.</p>
                    </div>
                 </label>
              </div>
          </div>

          <div className="bg-[#0a0714] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-white/5 space-y-2">
                 <div className="flex items-center gap-2">
                     <Clock className="h-5 w-5 text-amber-400" />
                     <h2 className="text-lg font-bold">Operating Hours</h2>
                 </div>
              </div>
              <div className="p-6 bg-white/[0.02] space-y-4">
                  <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Open Time</label>
                      <input type="time" defaultValue="09:00" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-500/50 transition-colors" />
                  </div>
                  <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Close Time</label>
                      <input type="time" defaultValue="21:00" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-500/50 transition-colors" />
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
