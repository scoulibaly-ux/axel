"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { liters } from "@/lib/format";
import { useApp } from "@/lib/store";

export default function ReportsPage() {
  const ids = useApp((s) => s.visibleStationIds());
  const stations = useApp((s) => s.stations.filter((s) => ids.includes(s.id)));
  const tanks = useApp((s) => s.tanks);
  const missions = useApp((s) => s.missions.filter((m) => ids.includes(m.stationId)));
  const gauges = useApp((s) => s.gauges.filter((g) => ids.includes(g.stationId)));
  const readings = useApp((s) => s.pumpReadings.filter((r) => ids.includes(r.stationId)));
  const can = useApp((s) => s.can("reports"));

  if (!can) return <p>Rapports réservés au gérant / propriétaire.</p>;

  const data = stations.map((st) => {
    const stTanks = tanks.filter((t) => t.stationId === st.id);
    return {
      name: st.city,
      stock: Math.round(stTanks.reduce((n, t) => n + t.levelL, 0)),
    };
  });

  const lost = missions.reduce((n, m) => {
    if (m.gestociProbeL == null) return n;
    const current = useApp
      .getState()
      .trucks.find((t) => t.id === m.truckId)
      ?.compartments.reduce((s, c) => s + c.probeL, 0) ?? 0;
    const after = m.unloadedL || current;
    return n + Math.max(0, m.gestociProbeL - (m.arrivalProbeL ?? after));
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Pilotage</p>
        <h1 className="text-3xl font-black uppercase tracking-tight text-secondary">Rapports</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-slate-900 p-5 text-white">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pertes trajet détectées</p>
          <p className="mt-2 text-3xl font-black text-primary">{liters(lost)}</p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Jauges enregistrées</p>
          <p className="mt-2 text-3xl font-black text-secondary">{gauges.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Index pompes</p>
          <p className="mt-2 text-3xl font-black text-secondary">{readings.length}</p>
        </div>
      </div>
      <div className="h-72 rounded-3xl border border-slate-100 bg-white p-4">
        <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-primary">Stock par ville</p>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={data}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => liters(Number(v))} />
            <Bar dataKey="stock" fill="#FF7900" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
