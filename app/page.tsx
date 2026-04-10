"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProviderStore } from "@/lib/stores/providers";

export default function Home() {
  const router = useRouter();
  const hasAnyConnected = useProviderStore((s) => s.providers.some((p) => p.connected));

  useEffect(() => {
    router.replace(hasAnyConnected ? "/dashboard" : "/connect");
  }, [hasAnyConnected, router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-4xl italic text-text-900">mirkayk</h1>
        <p className="font-body text-text-500 mt-2">loading...</p>
      </div>
    </main>
  );
}
