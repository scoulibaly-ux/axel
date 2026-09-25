"use client";

import { IdentifyGate } from "@/components/IdentifyGate";
import { productLabel, when } from "@/lib/format";
import { useApp } from "@/lib/store";

export default function PumpsPage() {
  const ids = useApp((s) => s.visibleStationIds());
  const stations = useApp((s) => s.stations.filter((s) => ids.includes(s.id)));
  const pumps = useApp((s) => s.pumps);
  const readings = useApp((s) => s.pumpReadings);
  const users = useApp((s) => s.users);
  const recordPump = useApp((s) => s.recordPump);
  const can = useApp((s) => s.can("pumps"));

  if (!can) return <p>Accès pompiste / superviseur.</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Relevés journaliers</p>
        <h1 className="text-3xl font-black uppercase tracking-tight text-secondary">Index pompes</h1>
      </div>
      <IdentifyGate place="un relevé d’index">
        {stations.map((st) => (
          <section key={st.id} className="rounded-3xl border border-slate-100 bg-white p-5">
            <h2 className="text-sm font-black uppercase tracking-widest text-secondary">{st.name}</h2>
            <div className="mt-4 divide-y divide-slate-100">
              {pumps
                .filter((p) => p.stationId === st.id)
                .map((p) => (
                  <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <p className="font-black uppercase">{p.name}</p>
                      <p className="text-xs text-slate-500">
                        {productLabel[p.product]} · index {p.index.toLocaleString("fr-FR")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => recordPump(st.id, p.id, "ouverture")}
                        className="rounded-xl bg-blue-900 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white"
                      >
                        Ouverture
                      </button>
                      <button
                        onClick={() => recordPump(st.id, p.id, "cloture")}
                        className="rounded-xl bg-primary px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white"
                      >
                        Clôture
                      </button>
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
                <th className="px-4 py-3">Pompe</th>
                <th className="px-4 py-3">Créneau</th>
                <th className="px-4 py-3">Index</th>
                <th className="px-4 py-3">Agent</th>
              </tr>
            </thead>
            <tbody>
              {readings
                .filter((r) => ids.includes(r.stationId))
                .map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="px-4 py-2">{when(r.at)}</td>
                    <td className="px-4 py-2">{pumps.find((p) => p.id === r.pumpId)?.name}</td>
                    <td className="px-4 py-2 uppercase">{r.slot}</td>
                    <td className="px-4 py-2 font-mono">{r.index.toLocaleString("fr-FR")}</td>
                    <td className="px-4 py-2">{users.find((u) => u.id === r.userId)?.name}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </IdentifyGate>
    </div>
  );
}
