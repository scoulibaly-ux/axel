"use client";

import Image from "next/image";

export function BrandMark({
  variant = "light",
  compact = false,
}: {
  variant?: "light" | "dark";
  compact?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/logo.png"
        alt="SUD CONTRACTORS"
        width={compact ? 44 : 64}
        height={compact ? 34 : 50}
        className="object-contain"
        priority
      />
      {!compact && (
        <div className="leading-tight">
          <p
            className={`text-[10px] font-black uppercase tracking-[0.18em] ${
              variant === "dark" ? "text-white/70" : "text-slate-500"
            }`}
          >
            SUD CONTRACTORS
          </p>
          <p
            className={`text-sm font-black tracking-tight ${
              variant === "dark" ? "text-white" : "text-secondary"
            }`}
          >
            Pro<span className="italic text-primary">Fuel</span>
          </p>
        </div>
      )}
    </div>
  );
}
