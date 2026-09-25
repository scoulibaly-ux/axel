"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";

export function Hydrate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const result = useApp.persist.rehydrate();
    Promise.resolve(result).then(() => setReady(true));
  }, []);
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary text-white">
        <p className="text-xs font-black uppercase tracking-widest text-primary">
          SUD CONTRACTORS · ProFuel
        </p>
      </div>
    );
  }
  return <>{children}</>;
}
