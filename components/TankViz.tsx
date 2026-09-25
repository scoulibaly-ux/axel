"use client";

import { productLabel } from "@/lib/format";
import type { Compartment, Tank } from "@/lib/types";

export function TankViz({ tank }: { tank: Tank }) {
  const pct = Math.min(100, (tank.levelL / tank.capacityL) * 100);
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">
            {productLabel[tank.product]}
          </p>
          <p className="text-sm font-black uppercase text-secondary">{tank.name}</p>
        </div>
        <p className="font-mono text-xs text-slate-500">{tank.lastMm} mm</p>
      </div>
      <div className="relative mx-auto h-36 w-20 overflow-hidden rounded-md border-2 border-secondary bg-slate-100">
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary to-orange-300 transition-all duration-700"
          style={{ height: `${pct}%` }}
        />
        <div className="absolute inset-x-0 top-2 text-center text-[10px] font-black text-secondary">
          {Math.round(pct)}%
        </div>
      </div>
      <p className="mt-3 text-center text-sm font-black text-secondary">
        {Math.round(tank.levelL).toLocaleString("fr-FR")} /{" "}
        {tank.capacityL.toLocaleString("fr-FR")} L
      </p>
    </div>
  );
}

export function CiterneViz({ compartments }: { compartments: Compartment[] }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-primary">
        Citerne — {compartments.length} compartiments
      </p>
      <div className="flex h-28 overflow-hidden rounded-xl border-2 border-secondary bg-slate-50">
        {compartments.map((c) => {
          const pct = Math.min(100, (c.probeL / c.capacityL) * 100);
          return (
            <div
              key={c.id}
              className="relative flex-1 border-r border-secondary/20 last:border-r-0"
              title={`C${c.index} ${productLabel[c.product]}`}
            >
              <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary to-orange-300 transition-all duration-700"
                style={{ height: `${pct}%` }}
              />
              <div className="absolute inset-x-0 top-1 text-center text-[9px] font-black text-secondary">
                C{c.index}
              </div>
              <div className="absolute inset-x-0 bottom-1 text-center text-[8px] font-bold text-secondary">
                {Math.round(c.probeL / 100) / 10}k
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {compartments.map((c) => (
          <span
            key={c.id}
            className="rounded-md bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-600"
          >
            C{c.index} {productLabel[c.product]} · {c.probeL.toLocaleString("fr-FR")} L
          </span>
        ))}
      </div>
    </div>
  );
}
