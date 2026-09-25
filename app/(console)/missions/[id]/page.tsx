"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { IdentifyGate } from "@/components/IdentifyGate";
import { MapTrackDynamic } from "@/components/MapTrackDynamic";
import { CiterneViz } from "@/components/TankViz";
import { StatusBadge } from "@/components/Badges";
import { liters, when } from "@/lib/format";
import { useApp } from "@/lib/store";

const steps = [
  "commande",
  "empotage",
  "en_transit",
  "arrivee",
  "depotage",
  "cloturee",
] as const;

export default function MissionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const mission = useApp((s) => s.missions.find((m) => m.id === id));
  const stations = useApp((s) => s.stations);
  const trucks = useApp((s) => s.trucks);
  const drivers = useApp((s) => s.drivers);
  const tanks = useApp((s) => s.tanks);
  const users = useApp((s) => s.users);
  const loadAtGestoci = useApp((s) => s.loadAtGestoci);
  const startTransit = useApp((s) => s.startTransit);
  const tickTransit = useApp((s) => s.tickTransit);
  const simulateSiphon = useApp((s) => s.simulateSiphon);
  const arriveStation = useApp((s) => s.arriveStation);
  const unloadCompartment = useApp((s) => s.unloadCompartment);
  const closeReconciliation = useApp((s) => s.closeReconciliation);
  const attachDocument = useApp((s) => s.attachDocument);
  const canEmpotage = useApp((s) => s.can("empotage"));
  const canDepotage = useApp((s) => s.can("depotage"));
  const canTransit = useApp((s) => s.can("transit"));

  useEffect(() => {
    if (!mission || mission.status !== "en_transit") return;
    const t = setInterval(() => tickTransit(mission.id), 1200);
    return () => clearInterval(t);
  }, [mission?.id, mission?.status, tickTransit]);

  if (!mission) {
    return <p className="text-sm text-slate-500">Mission introuvable.</p>;
  }

  const station = stations.find((s) => s.id === mission.stationId)!;
  const truck = trucks.find((t) => t.id === mission.truckId)!;
  const driver = drivers.find((d) => d.id === mission.driverId)!;
  const probeNow = truck.compartments.reduce((n, c) => n + c.probeL, 0);
  const gapGestoci =
    mission.gestociProbeL != null ? mission.gestociBonL - mission.gestociProbeL : null;
  const gapTrip =
    mission.gestociProbeL != null && mission.arrivalProbeL != null
      ? mission.gestociProbeL - mission.arrivalProbeL
      : mission.gestociProbeL != null
        ? mission.gestociProbeL - probeNow
        : null;
  const gapUnload =
    mission.arrivalProbeL != null ? mission.arrivalProbeL - mission.unloadedL : null;

  const stepIndex = steps.indexOf(mission.status === "rapprochement" ? "cloturee" : mission.status);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/missions" className="text-[10px] font-black uppercase tracking-widest text-primary">
            ← Missions
          </Link>
          <h1 className="mt-1 text-3xl font-black uppercase tracking-tight text-secondary">
            {mission.reference}
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {driver.name} · {truck.plate} · {station.name}
          </p>
        </div>
        <StatusBadge status={mission.status} />
      </div>

      <ol className="grid grid-cols-3 gap-2 md:grid-cols-6">
        {steps.map((s, i) => (
          <li
            key={s}
            className={`rounded-xl px-3 py-2 text-center text-[10px] font-black uppercase tracking-wider ${
              i <= stepIndex ? "bg-primary text-white" : "bg-white text-slate-400"
            }`}
          >
            {s.replace("_", " ")}
          </li>
        ))}
      </ol>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-100 bg-white p-5 lg:col-span-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Rapprochement</p>
          <dl className="mt-4 space-y-3 text-sm">
            <Row k="Bon GESTOCI" v={liters(mission.gestociBonL)} />
            <Row k="Sonde empotage" v={mission.gestociProbeL != null ? liters(mission.gestociProbeL) : "—"} />
            <Row k="Écart GESTOCI" v={gapGestoci != null ? liters(gapGestoci) : "—"} danger={!!gapGestoci && Math.abs(gapGestoci) >= 50} />
            <Row k="Sonde actuelle" v={liters(probeNow)} />
            <Row k="Perte trajet" v={gapTrip != null ? liters(gapTrip) : "—"} danger={!!gapTrip && gapTrip >= 50} />
            <Row k="Dépoté cuves" v={liters(mission.unloadedL)} />
            <Row k="Reste citerne" v={gapUnload != null ? liters(Math.max(0, probeNow)) : liters(probeNow)} />
          </dl>
        </div>
        <div className="h-72 overflow-hidden rounded-3xl border border-slate-100 lg:col-span-2">
          <MapTrackDynamic
            station={{ name: station.name, lat: station.lat, lng: station.lng }}
            truck={{ lat: mission.lat, lng: mission.lng, plate: truck.plate }}
            events={mission.events.filter((e) => e.note.toLowerCase().includes("baisse") || e.note.toLowerCase().includes("siphon"))}
          />
        </div>
      </div>

      <CiterneViz compartments={truck.compartments} />

      {mission.status === "commande" && canEmpotage && (
        <IdentifyGate place="l’empotage GESTOCI">
          <div className="rounded-3xl border border-slate-100 bg-white p-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-secondary">
              Empotage GESTOCI
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Le bon annoncé est {liters(mission.gestociBonL)}. La sonde indépendante mesurera le réel par compartiment.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => loadAtGestoci(mission.id)}
                className="rounded-xl bg-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-white"
              >
                Lire les sondes & charger
              </button>
              <label className="rounded-xl bg-blue-900 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white">
                Joindre le bon
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    attachDocument(mission.id, {
                      name: f.name,
                      kind: "bon_chargement",
                      uploadedBy: useApp.getState().currentUserId ?? "",
                    });
                  }}
                />
              </label>
            </div>
          </div>
        </IdentifyGate>
      )}

      {mission.status === "empotage" && canTransit && (
        <div className="rounded-3xl border border-slate-100 bg-white p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-secondary">Départ vers la station</h2>
          <p className="mt-2 text-sm text-slate-500">
            Le volume de référence pour le trajet est la sonde GESTOCI ({mission.gestociProbeL != null ? liters(mission.gestociProbeL) : "—" }), pas le bon papier.
          </p>
          <button
            onClick={() => startTransit(mission.id)}
            className="mt-4 rounded-xl bg-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-white"
          >
            Démarrer le transit
          </button>
        </div>
      )}

      {mission.status === "en_transit" && (
        <div className="rounded-3xl border border-red-100 bg-white p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-red-600">
            Simulateur trajet
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Progression {mission.routeProgress}%. Testez une baisse de volume hors station (notification critique).
          </p>
          <button
            disabled={mission.siphonSimulated}
            onClick={() => simulateSiphon(mission.id)}
            className="mt-4 rounded-xl bg-red-600 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white disabled:opacity-40"
          >
            {mission.siphonSimulated ? "Siphonnage déjà simulé" : "Simuler un siphonnage (−620 L)"}
          </button>
        </div>
      )}

      {(mission.status === "arrivee" || mission.status === "depotage") && canDepotage && (
        <IdentifyGate place="le dépotage en station">
          <div className="rounded-3xl border border-slate-100 bg-white p-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-secondary">Dépotage cuves</h2>
            {mission.status === "arrivee" && (
              <button
                onClick={() => arriveStation(mission.id)}
                className="mt-3 rounded-xl bg-blue-900 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white"
              >
                Pointer l’arrivée (sonde station)
              </button>
            )}
            <div className="mt-4 space-y-3">
              {truck.compartments.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-sm font-bold">
                    C{c.index} · {c.product} · {liters(c.probeL)}
                  </p>
                  <div className="flex gap-2">
                    <select
                      id={`tank-${c.id}`}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                      defaultValue={tanks.find((t) => t.stationId === station.id && t.product === c.product)?.id}
                    >
                      {tanks
                        .filter((t) => t.stationId === station.id && t.product === c.product)
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                    </select>
                    <button
                      disabled={c.probeL <= 0}
                      onClick={() => {
                        const sel = document.getElementById(`tank-${c.id}`) as HTMLSelectElement;
                        unloadCompartment(mission.id, c.id, sel.value);
                      }}
                      className="rounded-xl bg-primary px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white disabled:opacity-40"
                    >
                      Dépoter
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {probeNow === 0 && mission.unloadedL > 0 && (
              <button
                onClick={() => closeReconciliation(mission.id)}
                className="mt-4 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white"
              >
                Clôturer le rapprochement
              </button>
            )}
          </div>
        </IdentifyGate>
      )}

      {mission.status === "cloturee" && (
        <div className="rounded-3xl bg-slate-900 p-6 text-white">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Résultat</p>
          <h2 className="mt-1 text-2xl font-black uppercase">Rapprochement clôturé</h2>
          <p className="mt-3 text-sm text-white/70">
            Bon {liters(mission.gestociBonL)} → sonde GESTOCI {mission.gestociProbeL != null ? liters(mission.gestociProbeL) : "—"} →
            arrivée {mission.arrivalProbeL != null ? liters(mission.arrivalProbeL) : "—"} → cuves {liters(mission.unloadedL)}.
          </p>
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-100 bg-white p-5">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Journal volumes</h3>
          <ul className="mt-3 space-y-3 text-sm">
            {mission.events.map((e, i) => (
              <li key={i} className="border-b border-slate-50 pb-2">
                <p className="font-semibold">{e.note}</p>
                <p className="text-xs text-slate-400">
                  {when(e.at)} · {liters(e.totalL)}
                </p>
              </li>
            ))}
            {mission.events.length === 0 && <li className="text-slate-400">Aucun événement.</li>}
          </ul>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-5">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Identifications & documents</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {mission.identifiedBy.map((i, n) => (
              <li key={n}>
                {users.find((u) => u.id === i.userId)?.name} — {i.place} · {when(i.at)}
              </li>
            ))}
            {mission.documents.map((d) => (
              <li key={d.id} className="text-slate-600">
                📎 {d.name}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function Row({ k, v, danger }: { k: string; v: string; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-slate-500">{k}</dt>
      <dd className={`font-black ${danger ? "text-red-600" : "text-secondary"}`}>{v}</dd>
    </div>
  );
}
