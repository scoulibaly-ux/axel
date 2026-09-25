"use client";

import { useMemo } from "react";
import { IdentifyGate } from "@/components/IdentifyGate";
import { productLabel, when } from "@/lib/format";
import { useApp } from "@/lib/store";

export default function PumpsPage() {
  const currentUserId = useApp((s) => s.currentUserId);
  const users = useApp((s) => s.users);
  const stations = useApp((s) => s.stations);
  const missions = useApp((s) => s.missions);
  const drivers = useApp((s) => s.drivers);
  const pumps = useApp((s) => s.pumps);
  const tanks = useApp((s) => s.tanks);
  const readings = useApp((s) => s.pumpReadings);
  const record = useApp((s) => s.recordPump);
  
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

  const list = pumps.filter((p) => ids.includes(p.stationId));

  return (
    <IdentifyGate place="un relevé d’index">
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Index pompes station</p>
        <h1 className="text-3xl font-black uppercase tracking-tight text-secondary">
          Index pompes
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {list.map((pump) => {
          const tank = tanks.find((t) => t.id === pump.tankId);
          const st = stations.find((s) => s.id === pump.stationId);
          const last = readings
            .filter((r) => r.pumpId === pump.id)
            .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())[0];
          return (
            <div key={pump.id} className="overflow-hidden rounded-3xl border border-slate-100 bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">{st?.name}</p>
              <h3 className="text-2xl font-black text-secondary">{pump.name}</h3>
              <p className="mt-1 text-sm text-slate-600">
                {tank && productLabel[tank.product]} • {pump.index.toLocaleString()} L
              </p>

              {last && (
                <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs">
                  <p className="font-semibold text-slate-700">Dernier relevé {last.slot}</p>
                  <p className="text-slate-500">{when(last.at)} • {last.index.toLocaleString()} L</p>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => record(pump.stationId, pump.id, "ouverture")}
                  className="flex-1 rounded-xl bg-blue-900 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white"
                >
                  Ouverture
                </button>
                <button
                  onClick={() => record(pump.stationId, pump.id, "cloture")}
                  className="flex-1 rounded-xl bg-primary px-4 py-2 text-xs font-bold uppercase tracking-widest text-white"
                >
                  Clôture
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
