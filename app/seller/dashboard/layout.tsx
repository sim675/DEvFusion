"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SellerDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/seller/status");
        if (!res.ok) {
          router.replace("/seller/status");
          return;
        }
        const data = await res.json();
        
        // Ensure only fully approved sellers access the dashboard
        if (data.sellerStatus !== "approved") {
          router.replace("/seller/status");
          return;
        }
        
        setAuthorized(true);
      } catch (err) {
        console.error(err);
        router.replace("/seller/status");
      }
    }
    checkAuth();
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#07050f] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return <>{children}</>;
}
