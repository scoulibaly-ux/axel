"use client";

import { CiterneViz } from "@/components/TankViz";
import { useApp } from "@/lib/store";

export default function FleetPage() {
  const trucks = useApp((s) => s.trucks);
  const drivers = useApp((s) => s.drivers);
  const missions = useApp((s) => s.missions);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">ProVision × ProFuel</p>
        <h1 className="text-3xl font-black uppercase tracking-tight text-secondary">Flotte</h1>
      </div>
      {trucks.map((t) => {
        const d = drivers.find((x) => x.truckId === t.id);
        const m = missions.find((x) => x.truckId === t.id && x.status !== "cloturee");
        return (
          <section key={t.id} className="rounded-3xl border border-slate-100 bg-white p-5">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="font-mono text-xl font-black text-secondary">{t.plate}</p>
                <p className="text-sm text-slate-500">
                  {d?.name} · {d?.phone} · {t.compartmentCount} compartiments
                </p>
              </div>
              {m && (
                <a href={`/missions/${m.id}`} className="text-xs font-bold uppercase tracking-widest text-primary">
                  Mission {m.reference}
                </a>
              )}
            </div>
            <CiterneViz compartments={t.compartments} />
          </section>
        );
      })}
    </div>
  );
}
