"use client";

import { IdentifyGate } from "@/components/IdentifyGate";
import { TankViz } from "@/components/TankViz";
import { liters, mm, when } from "@/lib/format";
import { useApp } from "@/lib/store";

export default function GaugesPage() {
  const ids = useApp((s) => s.visibleStationIds());
  const stations = useApp((s) => s.stations.filter((s) => ids.includes(s.id)));
  const tanks = useApp((s) => s.tanks);
  const gauges = useApp((s) => s.gauges);
  const users = useApp((s) => s.users);
  const recordGauge = useApp((s) => s.recordGauge);
  const can = useApp((s) => s.can("gauges"));

  if (!can) return <p>Accès réservé au superviseur / gérant.</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Automatisation</p>
        <h1 className="text-3xl font-black uppercase tracking-tight text-secondary">Jauges</h1>
        <p className="mt-2 text-sm text-slate-500">
          Ouverture (5–6 h), midi, minuit — la lecture sonde remplace la règle millimétrée.
        </p>
      </div>
      <IdentifyGate place="un relevé de jauge">
        {stations.map((st) => (
          <section key={st.id} className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-secondary">{st.name}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tanks
                .filter((t) => t.stationId === st.id)
                .map((t) => (
                  <div key={t.id} className="space-y-3">
                    <TankViz tank={t} />
                    <div className="flex gap-2">
                      {(["ouverture", "midi", "minuit"] as const).map((slot) => (
                        <button
                          key={slot}
                          onClick={() => recordGauge(st.id, t.id, slot)}
                          className="flex-1 rounded-xl bg-blue-900 px-2 py-2 text-[10px] font-bold uppercase tracking-widest text-white"
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        ))}
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-4 py-3">Quand</th>
                <th className="px-4 py-3">Créneau</th>
                <th className="px-4 py-3">Cuve</th>
                <th className="px-4 py-3">mm</th>
                <th className="px-4 py-3">Litres</th>
                <th className="px-4 py-3">Agent</th>
              </tr>
            </thead>
            <tbody>
              {gauges
                .filter((g) => ids.includes(g.stationId))
                .map((g) => (
                  <tr key={g.id} className="border-t border-slate-100">
                    <td className="px-4 py-2">{when(g.at)}</td>
                    <td className="px-4 py-2 uppercase">{g.slot}</td>
                    <td className="px-4 py-2">{tanks.find((t) => t.id === g.tankId)?.name}</td>
                    <td className="px-4 py-2 font-mono">{mm(g.mm)}</td>
                    <td className="px-4 py-2 font-mono">{liters(g.liters)}</td>
                    <td className="px-4 py-2">{users.find((u) => u.id === g.userId)?.name}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </IdentifyGate>
    </div>
  );
}
