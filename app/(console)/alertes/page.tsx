"use client";

import Link from "next/link";
import { SeverityBadge } from "@/components/Badges";
import { when } from "@/lib/format";
import { useApp } from "@/lib/store";

export default function AlertsPage() {
  const alerts = useApp((s) => s.alerts);
  const mark = useApp((s) => s.markAlertRead);
  const missions = useApp((s) => s.missions);
  const ids = useApp((s) => s.visibleStationIds());
  const list = alerts.filter(
    (a) => !a.stationId || ids.includes(a.stationId) || missions.some((m) => m.id === a.missionId && ids.includes(m.stationId)),
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Intégrité produit</p>
        <h1 className="text-3xl font-black uppercase tracking-tight text-secondary">
          Alertes
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Toute variation de volume hors géofence station remonte ici, avec la position.
        </p>
      </div>
      <div className="space-y-3">
        {list.map((a) => (
          <article
            key={a.id}
            className={`rounded-3xl border bg-white p-5 ${a.read ? "border-slate-100" : "border-primary/30"}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SeverityBadge severity={a.severity} />
              <p className="text-xs text-slate-400">{when(a.at)}</p>
            </div>
            <h2 className="mt-2 font-black uppercase text-secondary">{a.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{a.detail}</p>
            {a.lat && (
              <p className="mt-2 font-mono text-xs text-slate-400">
                {a.lat.toFixed(4)}, {a.lng?.toFixed(4)}
              </p>
            )}
            <div className="mt-3 flex gap-3">
              {a.missionId && (
                <Link href={`/missions/${a.missionId}`} className="text-xs font-bold uppercase tracking-widest text-primary">
                  Ouvrir la mission
                </Link>
              )}
              {!a.read && (
                <button
                  onClick={() => mark(a.id)}
                  className="text-xs font-bold uppercase tracking-widest text-slate-400"
                >
                  Marquer lu
                </button>
              )}
            </div>
          </article>
        ))}
        {list.length === 0 && <p className="text-sm text-slate-400">Aucune alerte.</p>}
      </div>
    </div>
  );
}
