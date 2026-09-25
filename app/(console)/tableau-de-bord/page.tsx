"use client";

import Link from "next/link";
import { AlertTriangle, Fuel, MapPinned, Warehouse } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/Badges";
import { TankViz } from "@/components/TankViz";
import { liters } from "@/lib/format";
import { useApp } from "@/lib/store";

export default function DashboardPage() {
  const user = useApp((s) => s.currentUser());
  const stations = useApp((s) => s.stations);
  const tanks = useApp((s) => s.tanks);
  const missions = useApp((s) => s.missions);
  const alerts = useApp((s) => s.alerts);
  const ids = useApp((s) => s.visibleStationIds());
  const network = user?.role === "proprietaire" || user?.role === "adjoint";

  const visStations = stations.filter((s) => ids.includes(s.id));
  const visTanks = tanks.filter((t) => ids.includes(t.stationId));
  const visMissions = missions.filter((m) => ids.includes(m.stationId));
  const visAlerts = alerts.filter(
    (a) => !a.stationId || ids.includes(a.stationId) || visMissions.some((m) => m.id === a.missionId),
  );
  const stock = visTanks.reduce((n, t) => n + t.levelL, 0);
  const inTransit = visMissions.filter((m) => m.status === "en_transit").length;
  const crit = visAlerts.filter((a) => a.severity === "critique" && !a.read).length;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          {network ? "Réseau multi-stations" : visStations[0]?.name ?? "Station"}
        </p>
        <h1 className="mt-1 text-3xl font-black uppercase tracking-tight text-secondary">
          Tableau de <span className="text-primary">bord</span>
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Bonjour {user?.name}. Vue {network ? "globale de toutes les stations" : "limitée à votre station"}.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Stock cuves" value={liters(stock)} icon={Warehouse} hint={`${visTanks.length} cuves`} />
        <KpiCard label="Missions actives" value={String(visMissions.filter((m) => m.status !== "cloturee").length)} icon={MapPinned} />
        <KpiCard label="Citernes en transit" value={String(inTransit)} icon={Fuel} />
        <KpiCard
          label="Alertes critiques"
          value={String(crit)}
          icon={AlertTriangle}
          tone={crit ? "danger" : "ok"}
          hint="Variations hors station"
        />
      </div>

      {network && (
        <section>
          <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-secondary">
            Stations
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {visStations.map((st) => {
              const stTanks = tanks.filter((t) => t.stationId === st.id);
              const level = stTanks.reduce((n, t) => n + t.levelL, 0);
              const cap = stTanks.reduce((n, t) => n + t.capacityL, 0);
              return (
                <Link
                  key={st.id}
                  href={`/stations/${st.id}`}
                  className="rounded-3xl border border-slate-100 bg-white p-5 transition hover:shadow-lg"
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                    {st.city}
                  </p>
                  <p className="mt-1 font-black uppercase text-secondary">{st.name}</p>
                  <p className="mt-4 text-3xl font-black text-primary">{liters(level)}</p>
                  <p className="text-xs font-semibold text-slate-400">
                    sur {liters(cap)} · {Math.round((level / cap) * 100)}%
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-widest text-secondary">
            Missions
          </h2>
          <Link href="/missions" className="text-xs font-bold uppercase tracking-widest text-primary">
            Voir tout
          </Link>
        </div>
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-4 py-3">Référence</th>
                <th className="px-4 py-3">Station</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Bon GESTOCI</th>
              </tr>
            </thead>
            <tbody>
              {visMissions.map((m) => (
                <tr key={m.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <Link href={`/missions/${m.id}`} className="font-bold text-secondary hover:text-primary">
                      {m.reference}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {stations.find((s) => s.id === m.stationId)?.name}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="px-4 py-3 font-mono">{liters(m.gestociBonL)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-secondary">
          Niveaux de cuves
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visTanks.map((t) => (
            <TankViz key={t.id} tank={t} />
          ))}
        </div>
      </section>
    </div>
  );
}
