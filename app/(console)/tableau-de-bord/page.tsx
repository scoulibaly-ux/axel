"use client";

import Link from "next/link";
import { useMemo } from "react";
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
  const currentUserId = useApp((s) => s.currentUserId);
  const users = useApp((s) => s.users);
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

  const visible = stations.filter((s) => ids.includes(s.id));
  const recentMissions = missions.filter((m) => ids.includes(m.stationId)).slice(0, 5);
  const criticalAlerts = alerts.filter((a) => !a.read && a.severity === "critique");

  const totalCapacity = tanks
    .filter((t) => ids.includes(t.stationId))
    .reduce((s, t) => s + t.capacityL, 0);
  const totalStock = tanks
    .filter((t) => ids.includes(t.stationId))
    .reduce((s, t) => s + t.levelL, 0);
  const fillPercent = totalCapacity > 0 ? (totalStock / totalCapacity) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Contrôle des flux carburant</p>
        <h1 className="text-3xl font-black uppercase tracking-tight text-secondary">
          Tableau de bord
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={Warehouse}
          label="Stations réseau"
          value={String(visible.length)}
        />
        <KpiCard
          icon={Fuel}
          label="Stock total"
          value={liters(Math.round(totalStock))}
          hint={`${fillPercent.toFixed(0)}% capacité`}
        />
        <KpiCard
          icon={MapPinned}
          label="Missions actives"
          value={String(recentMissions.filter((m) => m.status !== "cloturee").length)}
        />
        <KpiCard
          icon={AlertTriangle}
          label="Alertes critiques"
          value={String(criticalAlerts.length)}
          tone={criticalAlerts.length ? "danger" : "ok"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {visible.map((st) => {
          const stTanks = tanks.filter((t) => t.stationId === st.id);
          const stMissions = missions.filter((m) => m.stationId === st.id && m.status !== "cloturee");
          return (
            <Link key={st.id} href={`/stations/${st.id}`} className="group">
              <div className="h-full overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 transition hover:border-primary hover:shadow-primary-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Station</p>
                    <h3 className="text-2xl font-black text-secondary">{st.name}</h3>
                    <p className="mt-1 text-xs text-slate-500">{st.city}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-500">Missions</p>
                    <p className="text-2xl font-black text-secondary">{stMissions.length}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {stTanks.map((tk) => (
                    <TankViz key={tk.id} tank={tk} />
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white">
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-secondary">
            Missions récentes
          </h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <tr>
              <th className="px-6 py-3">Réf.</th>
              <th className="px-6 py-3">Station</th>
              <th className="px-6 py-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {recentMissions.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-slate-400">
                  Aucune mission récente
                </td>
              </tr>
            ) : (
              recentMissions.map((m) => (
                <tr key={m.id} className="border-t border-slate-100">
                  <td className="px-6 py-3">
                    <Link className="font-bold hover:text-primary" href={`/missions/${m.id}`}>
                      {m.reference}
                    </Link>
                  </td>
                  <td className="px-6 py-3">{stations.find((s) => s.id === m.stationId)?.name}</td>
                  <td className="px-6 py-3">
                    <StatusBadge status={m.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}