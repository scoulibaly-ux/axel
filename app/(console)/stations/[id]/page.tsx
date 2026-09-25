"use client";

import { use } from "react";
import Link from "next/link";
import { TankViz } from "@/components/TankViz";
import { liters } from "@/lib/format";
import { useApp } from "@/lib/store";

export default function StationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const station = useApp((s) => s.stations.find((x) => x.id === id));
  const tanks = useApp((s) => s.tanks.filter((t) => t.stationId === id));
  const pumps = useApp((s) => s.pumps.filter((p) => p.stationId === id));
  const missions = useApp((s) => s.missions.filter((m) => m.stationId === id));
  const users = useApp((s) => s.users);

  if (!station) return <p>Station inconnue.</p>;
  const stock = tanks.reduce((n, t) => n + t.levelL, 0);
  const cap = tanks.reduce((n, t) => n + t.capacityL, 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">{station.city}</p>
        <h1 className="text-3xl font-black uppercase tracking-tight text-secondary">{station.name}</h1>
        <p className="mt-2 text-sm text-slate-500">
          Gérant : {users.find((u) => u.id === station.managerUserId)?.name} · stock {liters(stock)} / {liters(cap)}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tanks.map((t) => (
          <TankViz key={t.id} tank={t} />
        ))}
      </div>
      <div className="rounded-3xl border border-slate-100 bg-white p-5">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-primary">Pompes</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {pumps.map((p) => (
            <li key={p.id} className="flex justify-between">
              <span className="font-bold">{p.name}</span>
              <span className="font-mono text-slate-500">{p.index.toLocaleString("fr-FR")}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-3xl border border-slate-100 bg-white p-5">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-primary">Missions liées</h2>
        <ul className="mt-3 space-y-2">
          {missions.map((m) => (
            <li key={m.id}>
              <Link className="font-bold hover:text-primary" href={`/missions/${m.id}`}>
                {m.reference}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
