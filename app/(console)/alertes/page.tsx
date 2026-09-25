"use client";

import Link from "next/link";
import { useMemo } from "react";
import { SeverityBadge } from "@/components/Badges";
import { when } from "@/lib/format";
import { useApp } from "@/lib/store";

export default function AlertsPage() {
  const alerts = useApp((s) => s.alerts);
  const mark = useApp((s) => s.markAlertRead);
  const missions = useApp((s) => s.missions);
  const currentUserId = useApp((s) => s.currentUserId);
  const users = useApp((s) => s.users);
  const stations = useApp((s) => s.stations);
  const drivers = useApp((s) => s.drivers);
  
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
  
  const list = alerts.filter(
    (a) => !a.stationId || ids.includes(a.stationId) || missions.some((m) => m.id === a.missionId && ids.includes(m.stationId)),
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Contrôle temps réel</p>
        <h1 className="text-3xl font-black uppercase tracking-tight text-secondary">
          Alertes
        </h1>
      </div>

      <div className="space-y-3">
        {list.length === 0 && (
          <p className="rounded-xl border border-slate-100 bg-slate-50 px-6 py-4 text-sm text-slate-500">
            Aucune alerte récente.
          </p>
        )}
        {list.map((a) => (
          <div
            key={a.id}
            className={`overflow-hidden rounded-3xl border p-6 ${
              a.read ? "border-slate-100 bg-white" : "border-primary/20 bg-primary/5"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <SeverityBadge severity={a.severity} />
                  <p className="text-xs text-slate-500">{when(a.at)}</p>
                </div>
                <h3 className="mt-2 text-lg font-bold text-secondary">{a.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{a.detail}</p>
                {a.missionId && (
                  <Link
                    href={`/missions/${a.missionId}`}
                    className="mt-2 inline-block text-xs font-bold uppercase tracking-widest text-primary hover:underline"
                  >
                    Voir mission
                  </Link>
                )}
              </div>
              {!a.read && (
                <button
                  onClick={() => mark(a.id)}
                  className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-orange-600"
                >
                  Marquer lu
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
