"use client";

import { useMemo } from "react";
import { IdentifyGate } from "@/components/IdentifyGate";
import { productLabel, when } from "@/lib/format";
import { useApp } from "@/lib/store";

export default function GaugesPage() {
  const currentUserId = useApp((s) => s.currentUserId);
  const users = useApp((s) => s.users);
  const stations = useApp((s) => s.stations);
  const missions = useApp((s) => s.missions);
  const drivers = useApp((s) => s.drivers);
  const tanks = useApp((s) => s.tanks);
  const gauges = useApp((s) => s.gauges);
  const record = useApp((s) => s.recordGauge);
  
  const ids = useMemo(() => {
    const u = users.find((user) => user.id === currentUserId);
    if (!u) return [];
    if (u.role === "proprietaire" || u.role === "adjoint") {
      return stations.map((st) => st.id);
    }
    if (u.stationId) return [u.stationId];
    if (u.role === "chauffeur") {
      return missions.filter((m) => {
        const d = drivers.find((x) => x.id === m.driverId);
        return d?.truckId === u.truckId;
      }).map((m) => m.stationId);
    }
    return [];
  }, [currentUserId, users, stations, missions, drivers]);

  const list = tanks.filter((t) => ids.includes(t.stationId));

  return (
    <IdentifyGate place="un relevé de jauge">
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Relevés manuels</p>
        <h1 className="text-3xl font-black uppercase tracking-tight text-secondary">
          Jauges cuves
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {list.map((tank) => {
          const st = stations.find((s) => s.id === tank.stationId);
          const last = gauges
            .filter((g) => g.tankId === tank.id)
            .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())[0];
          return (
            <div key={tank.id} className="overflow-hidden rounded-3xl border border-slate-100 bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">{st?.name}</p>
              <h3 className="text-2xl font-black text-secondary">{tank.name}</h3>
              <p className="mt-1 text-sm text-slate-600">
                {productLabel[tank.product]} • {tank.lastMm} mm • {tank.levelL.toLocaleString()} L
              </p>

              {last && (
                <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs">
                  <p className="font-semibold text-slate-700">Dernier relevé {last.slot}</p>
                  <p className="text-slate-500">{when(last.at)} • {last.mm} mm • {last.liters.toLocaleString()} L</p>
                </div>
              )}

              <div className="mt-4 grid grid-cols-3 gap-2">
                <button
                  onClick={() => record(tank.stationId, tank.id, "ouverture")}
                  className="rounded-xl bg-blue-900 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white"
                >
                  Ouv.
                </button>
                <button
                  onClick={() => record(tank.stationId, tank.id, "midi")}
                  className="rounded-xl bg-primary px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white"
                >
                  Midi
                </button>
                <button
                  onClick={() => record(tank.stationId, tank.id, "minuit")}
                  className="rounded-xl bg-blue-900 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white"
                >
                  Minuit
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </IdentifyGate>
  );
}
