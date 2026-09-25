"use client";

import dynamic from "next/dynamic";

export const MapTrackDynamic = dynamic(() => import("./MapTrack"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center rounded-2xl bg-slate-100 text-xs font-bold uppercase tracking-widest text-slate-400">
      Chargement carte…
    </div>
  ),
});
