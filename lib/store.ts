"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GESTOCI, lerp } from "./geo";
import { litersToMm } from "./format";
import { initialState } from "./seed";
import type {
  Alert,
  AppState,
  DocumentFile,
  Mission,
  MissionStatus,
  Role,
  User,
} from "./types";

function nid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function now() {
  return new Date().toISOString();
}

function truckTotal(state: AppState, truckId: string) {
  const t = state.trucks.find((x) => x.id === truckId);
  return t ? t.compartments.reduce((s, c) => s + c.probeL, 0) : 0;
}

function stationOf(user: User | undefined, fallback?: string) {
  return user?.stationId ?? fallback;
}

export const useApp = create<
  AppState & {
    login: (userId: string) => void;
    logout: () => void;
    resetDemo: () => void;
    identify: (pin: string) => { ok: boolean; user?: User };
    requireIdentify: (minutes?: number) => boolean;

    currentUser: () => User | undefined;
    can: (action: Action) => boolean;
    createMission: (input: {
      stationId: string;
      truckId: string;
      driverId: string;
      bonL: number;
    }) => string;
    setMissionStatus: (id: string, status: MissionStatus) => void;
    attachDocument: (missionId: string, doc: Omit<DocumentFile, "id" | "uploadedAt">) => void;
    loadAtGestoci: (missionId: string) => void;
    startTransit: (missionId: string) => void;
    tickTransit: (missionId: string) => void;
    simulateSiphon: (missionId: string, lostL?: number) => void;
    arriveStation: (missionId: string) => void;
    unloadCompartment: (missionId: string, compartmentId: string, tankId: string) => void;
    closeReconciliation: (missionId: string) => void;
    recordGauge: (stationId: string, tankId: string, slot: "ouverture" | "midi" | "minuit") => void;
    recordPump: (stationId: string, pumpId: string, slot: "ouverture" | "cloture", nextIndex?: number) => void;
    markAlertRead: (id: string) => void;
    pushAlert: (a: Omit<Alert, "id" | "at" | "read">) => void;
  }
>()(
  persist(
    (set, get) => ({
      ...structuredClone(initialState),

      currentUser: () => get().users.find((u) => u.id === get().currentUserId),

      login: (userId) => set({ currentUserId: userId, identifiedUntil: null }),
      logout: () => set({ currentUserId: null, identifiedUntil: null }),
      resetDemo: () =>
        set({
          ...structuredClone(initialState),
          currentUserId: get().currentUserId,
        }),

      identify: (pin) => {
        const user = get().currentUser();
        if (!user || user.pin !== pin) return { ok: false };
        set({ identifiedUntil: Date.now() + 15 * 60_000 });
        return { ok: true, user };
      },

      requireIdentify: (minutes = 15) => {
        const until = get().identifiedUntil;
        return !!until && until > Date.now() - (15 - minutes);
      },

      visibleStationIds: () => {
        const s = get();
        const u = s.users.find((user) => user.id === s.currentUserId);
        if (!u) return [];
        if (u.role === "proprietaire" || u.role === "adjoint") {
          return s.stations.map((st) => st.id);
        }
        if (u.stationId) return [u.stationId];
        if (u.role === "chauffeur") {
          return s
            .missions.filter((m) => {
              const d = s.drivers.find((x) => x.id === m.driverId);
              return d?.truckId === u.truckId;
            })
            .map((m) => m.stationId);
        }
        return [];
      },

      can: (action) => {
        const role = get().currentUser()?.role;
        if (!role) return false;
        return allowed[action].includes(role);
      },

      createMission: ({ stationId, truckId, driverId, bonL }) => {
        const id = nid("m");
        const truck = get().trucks.find((t) => t.id === truckId);
        const mission: Mission = {
          id,
          reference: `MIS-${new Date().toISOString().slice(5, 10).replace("-", "")}-${id.slice(-3).toUpperCase()}`,
          stationId,
          truckId,
          driverId,
          status: "commande",
          createdAt: now(),
          gestociBonL: bonL,
          gestociProbeL: null,
          arrivalProbeL: null,
          unloadedL: 0,
          documents: [],
          identifiedBy: [],
          routeProgress: 0,
          lat: GESTOCI.lat,
          lng: GESTOCI.lng,
          events: [],
          mapping: [],
          siphonSimulated: false,
        };
        set((s) => ({
          missions: [mission, ...s.missions],
          trucks: s.trucks.map((t) =>
            t.id === truckId && truck
              ? {
                  ...t,
                  compartments: t.compartments.map((c) => ({
                    ...c,
                    loadedL: 0,
                    probeL: 0,
                  })),
                }
              : t,
          ),
        }));
        return id;
      },

      setMissionStatus: (id, status) =>
        set((s) => ({
          missions: s.missions.map((m) => (m.id === id ? { ...m, status } : m)),
        })),

      attachDocument: (missionId, doc) =>
        set((s) => ({
          missions: s.missions.map((m) =>
            m.id === missionId
              ? {
                  ...m,
                  documents: [
                    ...m.documents,
                    { ...doc, id: nid("doc"), uploadedAt: now() },
                  ],
                }
              : m,
          ),
        })),

      loadAtGestoci: (missionId) => {
        const s = get();
        const m = s.missions.find((x) => x.id === missionId);
        const u = s.currentUser();
        if (!m || !u) return;
        const truck = s.trucks.find((t) => t.id === m.truckId);
        if (!truck) return;
        const filled = truck.compartments.map((c) => {
          const loaded = c.capacityL;
          const probe = loaded - Math.round(8 + Math.random() * 20);
          return { ...c, loadedL: loaded, probeL: probe };
        });
        const probeTotal = filled.reduce((n, c) => n + c.probeL, 0);
        const gap = m.gestociBonL - probeTotal;
        set({
          trucks: s.trucks.map((t) =>
            t.id === m.truckId ? { ...t, compartments: filled } : t,
          ),
          missions: s.missions.map((x) =>
            x.id === missionId
              ? {
                  ...x,
                  status: "empotage",
                  gestociProbeL: probeTotal,
                  identifiedBy: [
                    ...x.identifiedBy,
                    { userId: u.id, at: now(), place: "Empotage GESTOCI" },
                  ],
                  events: [
                    ...x.events,
                    {
                      at: now(),
                      lat: GESTOCI.lat,
                      lng: GESTOCI.lng,
                      totalL: probeTotal,
                      note: `Empotage sonde ${probeTotal} L vs bon ${m.gestociBonL} L`,
                    },
                  ],
                }
              : x,
          ),
          alerts:
            Math.abs(gap) >= 50
              ? [
                  {
                    id: nid("a"),
                    at: now(),
                    read: false,
                    severity: "avertissement",
                    title: "Écart sonde vs bon GESTOCI",
                    detail: `${m.reference} : bon ${m.gestociBonL} L, sonde ${probeTotal} L (écart ${gap > 0 ? "−" : "+"}${Math.abs(gap)} L) à Vridi.`,
                    missionId,
                    lat: GESTOCI.lat,
                    lng: GESTOCI.lng,
                  },
                  ...s.alerts,
                ]
              : s.alerts,
        });
      },

      startTransit: (missionId) =>
        set((s) => ({
          missions: s.missions.map((m) =>
            m.id === missionId
              ? { ...m, status: "en_transit", routeProgress: Math.max(m.routeProgress, 1) }
              : m,
          ),
        })),

      tickTransit: (missionId) => {
        const s = get();
        const m = s.missions.find((x) => x.id === missionId);
        if (!m || m.status !== "en_transit") return;
        const st = s.stations.find((x) => x.id === m.stationId);
        if (!st) return;
        const p = Math.min(100, m.routeProgress + 4);
        const lat = lerp(GESTOCI.lat, st.lat, p / 100);
        const lng = lerp(GESTOCI.lng, st.lng, p / 100);
        const total = truckTotal(s, m.truckId);
        set({
          missions: s.missions.map((x) =>
            x.id === missionId
              ? {
                  ...x,
                  routeProgress: p,
                  lat,
                  lng,
                  status: p >= 100 ? "arrivee" : "en_transit",
                  arrivalProbeL: p >= 100 ? total : x.arrivalProbeL,
                }
              : x,
          ),
        });
      },

      simulateSiphon: (missionId, lostL = 620) => {
        const s = get();
        const m = s.missions.find((x) => x.id === missionId);
        if (!m || m.siphonSimulated) return;
        const truck = s.trucks.find((t) => t.id === m.truckId);
        if (!truck) return;
        const target =
          truck.compartments.find((c) => c.probeL > lostL) ?? truck.compartments[0];
        const comps = truck.compartments.map((c) =>
          c.id === target.id
            ? { ...c, probeL: Math.max(0, c.probeL - lostL) }
            : c,
        );
        const total = comps.reduce((n, c) => n + c.probeL, 0);
        set({
          trucks: s.trucks.map((t) =>
            t.id === m.truckId ? { ...t, compartments: comps } : t,
          ),
          missions: s.missions.map((x) =>
            x.id === missionId
              ? {
                  ...x,
                  siphonSimulated: true,
                  events: [
                    ...x.events,
                    {
                      at: now(),
                      lat: x.lat,
                      lng: x.lng,
                      totalL: total,
                      note: `Baisse de volume hors station −${lostL} L (compartiment ${target.index})`,
                    },
                  ],
                }
              : x,
          ),
          alerts: [
            {
              id: nid("a"),
              at: now(),
              read: false,
              severity: "critique",
              title: "Suspicion de siphonnage en trajet",
              detail: `${m.reference} : −${lostL} L détectés hors géofence station, compartiment ${target.index}. Position ${m.lat.toFixed(4)}, ${m.lng.toFixed(4)}.`,
              missionId,
              lat: m.lat,
              lng: m.lng,
            },
            ...s.alerts,
          ],
        });
      },

      arriveStation: (missionId) => {
        const s = get();
        const m = s.missions.find((x) => x.id === missionId);
        const u = s.currentUser();
        const st = s.stations.find((x) => x.id === m?.stationId);
        if (!m || !u || !st) return;
        const total = truckTotal(s, m.truckId);
        set({
          missions: s.missions.map((x) =>
            x.id === missionId
              ? {
                  ...x,
                  status: "arrivee",
                  routeProgress: 100,
                  lat: st.lat,
                  lng: st.lng,
                  arrivalProbeL: total,
                  identifiedBy: [
                    ...x.identifiedBy,
                    { userId: u.id, at: now(), place: `Arrivée ${st.name}` },
                  ],
                  events: [
                    ...x.events,
                    {
                      at: now(),
                      lat: st.lat,
                      lng: st.lng,
                      totalL: total,
                      note: `Arrivée station — sonde ${total} L`,
                    },
                  ],
                }
              : x,
          ),
        });
      },

      unloadCompartment: (missionId, compartmentId, tankId) => {
        const s = get();
        const m = s.missions.find((x) => x.id === missionId);
        const u = s.currentUser();
        if (!m || !u) return;
        const truck = s.trucks.find((t) => t.id === m.truckId);
        const comp = truck?.compartments.find((c) => c.id === compartmentId);
        const tank = s.tanks.find((t) => t.id === tankId);
        if (!comp || !tank || comp.probeL <= 0) return;
        if (comp.product !== tank.product) return;
        const vol = comp.probeL;
        const newLevel = Math.min(tank.capacityL, tank.levelL + vol);
        set({
          trucks: s.trucks.map((t) =>
            t.id === m.truckId
              ? {
                  ...t,
                  compartments: t.compartments.map((c) =>
                    c.id === compartmentId ? { ...c, probeL: 0, loadedL: 0 } : c,
                  ),
                }
              : t,
          ),
          tanks: s.tanks.map((t) =>
            t.id === tankId
              ? { ...t, levelL: newLevel, lastMm: litersToMm(newLevel, t.capacityL) }
              : t,
          ),
          missions: s.missions.map((x) =>
            x.id === missionId
              ? {
                  ...x,
                  status: "depotage",
                  unloadedL: x.unloadedL + vol,
                  mapping: [...x.mapping, { compartmentId, tankId, volumeL: vol }],
                  identifiedBy: x.identifiedBy.some(
                    (i) => i.place.startsWith("Dépotage") && i.userId === u.id,
                  )
                    ? x.identifiedBy
                    : [
                        ...x.identifiedBy,
                        { userId: u.id, at: now(), place: `Dépotage ${tank.name}` },
                      ],
                }
              : x,
          ),
        });
      },

      closeReconciliation: (missionId) =>
        set((s) => ({
          missions: s.missions.map((m) =>
            m.id === missionId ? { ...m, status: "cloturee" } : m,
          ),
        })),

      recordGauge: (stationId, tankId, slot) => {
        const u = get().currentUser();
        const tank = get().tanks.find((t) => t.id === tankId);
        if (!u || !tank) return;
        set((s) => ({
          gauges: [
            {
              id: nid("g"),
              stationId,
              tankId,
              slot,
              at: now(),
              mm: tank.lastMm,
              liters: tank.levelL,
              userId: u.id,
            },
            ...s.gauges,
          ],
        }));
      },

      recordPump: (stationId, pumpId, slot, nextIndex) => {
        const u = get().currentUser();
        const pump = get().pumps.find((p) => p.id === pumpId);
        if (!u || !pump) return;
        const index = nextIndex ?? pump.index + (slot === "cloture" ? 180 + Math.round(Math.random() * 220) : 0);
        const sold = slot === "cloture" ? Math.max(0, index - pump.index) : 0;
        set((s) => ({
          pumpReadings: [
            {
              id: nid("pr"),
              stationId,
              pumpId,
              slot,
              at: now(),
              index,
              userId: u.id,
            },
            ...s.pumpReadings,
          ],
          pumps: s.pumps.map((p) => (p.id === pumpId ? { ...p, index } : p)),
          tanks:
            sold > 0
              ? s.tanks.map((t) =>
                  t.id === pump.tankId
                    ? {
                        ...t,
                        levelL: Math.max(0, t.levelL - sold),
                        lastMm: litersToMm(Math.max(0, t.levelL - sold), t.capacityL),
                      }
                    : t,
                )
              : s.tanks,
        }));
      },

      markAlertRead: (id) =>
        set((s) => ({
          alerts: s.alerts.map((a) => (a.id === id ? { ...a, read: true } : a)),
        })),

      pushAlert: (a) =>
        set((s) => ({
          alerts: [{ ...a, id: nid("a"), at: now(), read: false }, ...s.alerts],
        })),
    }),
    { name: "sc-profuel-proto", skipHydration: true },
  ),
);

export type Action =
  | "viewNetwork"
  | "viewStation"
  | "createMission"
  | "empotage"
  | "transit"
  | "depotage"
  | "gauges"
  | "pumps"
  | "alerts"
  | "reports";

const allowed: Record<Action, Role[]> = {
  viewNetwork: ["proprietaire", "adjoint"],
  viewStation: ["proprietaire", "adjoint", "gerant", "superviseur", "pompiste"],
  createMission: ["proprietaire", "adjoint", "gerant", "superviseur"],
  empotage: ["proprietaire", "adjoint", "chauffeur", "superviseur"],
  transit: ["proprietaire", "adjoint", "gerant", "superviseur", "chauffeur"],
  depotage: ["proprietaire", "adjoint", "gerant", "superviseur"],
  gauges: ["proprietaire", "adjoint", "gerant", "superviseur"],
  pumps: ["proprietaire", "adjoint", "gerant", "superviseur", "pompiste"],
  alerts: ["proprietaire", "adjoint", "gerant", "superviseur"],
  reports: ["proprietaire", "adjoint", "gerant"],
};

export function stationScope(user: User | undefined, stationId: string) {
  if (!user) return false;
  if (user.role === "proprietaire" || user.role === "adjoint") return true;
  return user.stationId === stationId;
}
