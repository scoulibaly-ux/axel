"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { StatusBadge } from "@/components/Badges";
import { liters } from "@/lib/format";
import { useApp } from "@/lib/store";

export default function MissionsPage() {
  const missions = useApp((s) => s.missions);
  const stations = useApp((s) => s.stations);
  const trucks = useApp((s) => s.trucks);
  const drivers = useApp((s) => s.drivers);
  const currentUserId = useApp((s) => s.currentUserId);
  const users = useApp((s) => s.users);
  
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
  
  const canCreate = useApp((s) => s.can("createMission"));
  const createMission = useApp((s) => s.createMission);
  const [open, setOpen] = useState(false);
  const [stationId, setStationId] = useState(ids[0] ?? "");
  const [truckId, setTruckId] = useState(trucks[1]?.id ?? trucks[0]?.id ?? "");
  const [driverId, setDriverId] = useState(drivers[1]?.id ?? drivers[0]?.id ?? "");
  const [bonL, setBonL] = useState(42000);

  const list = missions.filter((m) => ids.includes(m.stationId));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Chaîne de livraison</p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-secondary">
            Missions
          </h1>
        </div>
        {canCreate && (
          <button
            onClick={() => setOpen(true)}
            className="rounded-xl bg-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-primary-sm"
          >
            Nouvelle commande
          </button>
        )}
      </div>

      {open && (
        <form
          className="rounded-3xl border border-slate-100 bg-white p-6"
          onSubmit={(e) => {
            e.preventDefault();
            const id = createMission({ stationId, truckId, driverId, bonL });
            setOpen(false);
            window.location.href = `/missions/${id}`;
          }}
        >
          <h2 className="text-sm font-black uppercase tracking-widest text-secondary">
            Commande carburant
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="text-xs font-black uppercase tracking-wider text-secondary">
              Station
              <select
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium"
                value={stationId}
                onChange={(e) => setStationId(e.target.value)}
              >
                {stations
                  .filter((s) => ids.includes(s.id))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </label>
            <label className="text-xs font-black uppercase tracking-wider text-secondary">
              Camion
              <select
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium"
                value={truckId}
                onChange={(e) => setTruckId(e.target.value)}
              >
                {trucks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.plate} · {t.compartmentCount} comp.
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-black uppercase tracking-wider text-secondary">
              Chauffeur
              <select
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium"
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
              >
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-black uppercase tracking-wider text-secondary">
              Volume bon GESTOCI (L)
              <input
                type="number"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium"
                value={bonL}
                onChange={(e) => setBonL(Number(e.target.value))}
              />
            </label>
          </div>
          <div className="mt-4 flex gap-3">
            <button className="rounded-xl bg-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-white">
              Créer
            </button>
            <button type="button" onClick={() => setOpen(false)} className="rounded-xl bg-blue-900 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white">
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <tr>
              <th className="px-4 py-3">Réf.</th>
              <th className="px-4 py-3">Station</th>
              <th className="px-4 py-3">Camion</th>
              <th className="px-4 py-3">Chauffeur</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Bon</th>
            </tr>
          </thead>
          <tbody>
            {list.map((m) => (
              <tr key={m.id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  <Link className="font-bold hover:text-primary" href={`/missions/${m.id}`}>
                    {m.reference}
                  </Link>
                </td>
                <td className="px-4 py-3">{stations.find((s) => s.id === m.stationId)?.name}</td>
                <td className="px-4 py-3 font-mono">{trucks.find((t) => t.id === m.truckId)?.plate}</td>
                <td className="px-4 py-3">{drivers.find((d) => d.id === m.driverId)?.name}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={m.status} />
                </td>
                <td className="px-4 py-3 font-mono">{liters(m.gestociBonL)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
