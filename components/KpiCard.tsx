"use client";

import type { LucideIcon } from "lucide-react";

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "default" | "danger" | "ok";
}) {
  const color =
    tone === "danger"
      ? "text-red-600"
      : tone === "ok"
        ? "text-emerald-600"
        : "text-primary";
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          {label}
        </p>
      </div>
      <p className={`text-3xl font-black leading-none ${color}`}>{value}</p>
      {hint && (
        <p className="mt-2 text-xs font-medium text-slate-500">{hint}</p>
      )}
    </div>
  );
}
