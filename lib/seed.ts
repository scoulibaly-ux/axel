import { litersToMm } from "./format";
import type { AppState, Compartment, Tank } from "./types";

function tanks(
  stationId: string,
  items: { id: string; name: string; product: Tank["product"]; cap: number; level: number }[],
): Tank[] {
  return items.map((t) => ({
    id: t.id,
    stationId,
    name: t.name,
    product: t.product,
    capacityL: t.cap,
    levelL: t.level,
    lastMm: litersToMm(t.level, t.cap),
  }));
}

function comps(
  truck: string,
  list: { product: Compartment["product"]; cap: number; loaded: number }[],
): Compartment[] {
  return list.map((c, i) => ({
    id: `${truck}-c${i + 1}`,
    index: i + 1,
    product: c.product,
    capacityL: c.cap,
    loadedL: c.loaded,
    probeL: c.loaded,
  }));
}

export const initialState: AppState = {
  currentUserId: null,
  identifiedUntil: null,
  users: [
    { id: "u-owner", name: "Moussa Diabaté", role: "proprietaire", pin: "0000" },
    { id: "u-adj", name: "Awa Koné", role: "adjoint", pin: "1111" },
    {
      id: "u-gerant-cocody",
      name: "Jean-Baptiste Yao",
      role: "gerant",
      pin: "2222",
      stationId: "st-cocody",
    },
    {
      id: "u-sup-cocody",
      name: "Fatou Coulibaly",
      role: "superviseur",
      pin: "3333",
      stationId: "st-cocody",
    },
    {
      id: "u-pomp-cocody",
      name: "Koffi Mensah",
      role: "pompiste",
      pin: "4444",
      stationId: "st-cocody",
    },
    {
      id: "u-gerant-yop",
      name: "Marie-Claire Bamba",
      role: "gerant",
      pin: "2223",
      stationId: "st-yopougon",
    },
    {
      id: "u-chauff",
      name: "Kouassi Jean",
      role: "chauffeur",
      pin: "5555",
      truckId: "tr-4523",
    },
    {
      id: "u-chauff2",
      name: "Traoré Moussa",
      role: "chauffeur",
      pin: "5556",
      truckId: "tr-8891",
    },
  ],
  stations: [
    {
      id: "st-cocody",
      name: "Station Cocody Angré",
      city: "Abidjan",
      lat: 5.398,
      lng: -3.978,
      managerUserId: "u-gerant-cocody",
    },
    {
      id: "st-yopougon",
      name: "Station Yopougon Sicogi",
      city: "Abidjan",
      lat: 5.337,
      lng: -4.085,
      managerUserId: "u-gerant-yop",
    },
    {
      id: "st-bassam",
      name: "Station Grand-Bassam",
      city: "Grand-Bassam",
      lat: 5.211,
      lng: -3.738,
      managerUserId: "u-gerant-cocody",
    },
  ],
  tanks: [
    ...tanks("st-cocody", [
      { id: "tk-c1", name: "Cuve Super A", product: "super", cap: 20000, level: 8400 },
      { id: "tk-c2", name: "Cuve Gasoil", product: "gasoil", cap: 30000, level: 12600 },
      { id: "tk-c3", name: "Cuve Super B", product: "super", cap: 15000, level: 4100 },
    ]),
    ...tanks("st-yopougon", [
      { id: "tk-y1", name: "Cuve Super", product: "super", cap: 25000, level: 18200 },
      { id: "tk-y2", name: "Cuve Gasoil", product: "gasoil", cap: 25000, level: 9100 },
    ]),
    ...tanks("st-bassam", [
      { id: "tk-b1", name: "Cuve Super", product: "super", cap: 20000, level: 15400 },
      { id: "tk-b2", name: "Cuve Gasoil", product: "gasoil", cap: 20000, level: 6200 },
    ]),
  ],
  pumps: [
    { id: "p-c1", stationId: "st-cocody", name: "Pompe 1", product: "super", tankId: "tk-c1", index: 148230 },
    { id: "p-c2", stationId: "st-cocody", name: "Pompe 2", product: "super", tankId: "tk-c3", index: 99210 },
    { id: "p-c3", stationId: "st-cocody", name: "Pompe 3", product: "gasoil", tankId: "tk-c2", index: 201440 },
    { id: "p-c4", stationId: "st-cocody", name: "Pompe 4", product: "gasoil", tankId: "tk-c2", index: 176880 },
    { id: "p-y1", stationId: "st-yopougon", name: "Pompe 1", product: "super", tankId: "tk-y1", index: 88012 },
    { id: "p-y2", stationId: "st-yopougon", name: "Pompe 2", product: "gasoil", tankId: "tk-y2", index: 64040 },
    { id: "p-b1", stationId: "st-bassam", name: "Pompe 1", product: "super", tankId: "tk-b1", index: 41020 },
    { id: "p-b2", stationId: "st-bassam", name: "Pompe 2", product: "gasoil", tankId: "tk-b2", index: 33015 },
  ],
  trucks: [
    {
      id: "tr-4523",
      plate: "CI-4523-AB",
      compartmentCount: 7,
      compartments: comps("tr-4523", [
        { product: "super", cap: 7000, loaded: 7000 },
        { product: "super", cap: 6000, loaded: 6000 },
        { product: "super", cap: 5000, loaded: 5000 },
        { product: "gasoil", cap: 8000, loaded: 8000 },
        { product: "gasoil", cap: 7000, loaded: 7000 },
        { product: "gasoil", cap: 6000, loaded: 6000 },
        { product: "gasoil", cap: 6000, loaded: 6000 },
      ]),
    },
    {
      id: "tr-8891",
      plate: "CI-8891-CD",
      compartmentCount: 5,
      compartments: comps("tr-8891", [
        { product: "super", cap: 8000, loaded: 0 },
        { product: "super", cap: 8000, loaded: 0 },
        { product: "gasoil", cap: 9000, loaded: 0 },
        { product: "gasoil", cap: 9000, loaded: 0 },
        { product: "gasoil", cap: 8000, loaded: 0 },
      ]),
    },
  ],
  drivers: [
    { id: "d-kouassi", name: "Kouassi Jean", phone: "07 07 12 34 56", truckId: "tr-4523" },
    { id: "d-traore", name: "Traoré Moussa", phone: "05 05 98 76 54", truckId: "tr-8891" },
  ],
  missions: [
    {
      id: "m-transit",
      reference: "MIS-2409-014",
      stationId: "st-cocody",
      truckId: "tr-4523",
      driverId: "d-kouassi",
      status: "en_transit",
      createdAt: new Date(Date.now() - 3.5 * 3600_000).toISOString(),
      gestociBonL: 45000,
      gestociProbeL: 44920,
      arrivalProbeL: null,
      unloadedL: 0,
      documents: [
        {
          id: "doc-1",
          name: "Bon_chargement_GESTOCI_2409.pdf",
          kind: "bon_chargement",
          uploadedAt: new Date(Date.now() - 3.2 * 3600_000).toISOString(),
          uploadedBy: "u-chauff",
        },
      ],
      identifiedBy: [
        {
          userId: "u-chauff",
          at: new Date(Date.now() - 3.3 * 3600_000).toISOString(),
          place: "Empotage GESTOCI",
        },
      ],
      routeProgress: 42,
      lat: 5.312,
      lng: -3.988,
      siphonSimulated: false,
      mapping: [],
      events: [
        {
          at: new Date(Date.now() - 3.2 * 3600_000).toISOString(),
          lat: 5.256,
          lng: -3.996,
          totalL: 44920,
          note: "Sortie GESTOCI — sonde 44 920 L vs bon 45 000 L",
        },
      ],
    },
    {
      id: "m-order",
      reference: "MIS-2509-002",
      stationId: "st-yopougon",
      truckId: "tr-8891",
      driverId: "d-traore",
      status: "commande",
      createdAt: new Date(Date.now() - 40 * 60_000).toISOString(),
      gestociBonL: 42000,
      gestociProbeL: null,
      arrivalProbeL: null,
      unloadedL: 0,
      documents: [],
      identifiedBy: [],
      routeProgress: 0,
      lat: 5.256,
      lng: -3.996,
      siphonSimulated: false,
      mapping: [],
      events: [],
    },
  ],
  alerts: [
    {
      id: "a-info-1",
      at: new Date(Date.now() - 3.2 * 3600_000).toISOString(),
      severity: "info",
      title: "Écart sonde vs bon GESTOCI",
      detail:
        "MIS-2409-014 : le bon indique 45 000 L, la sonde indépendante lit 44 920 L (−80 L) à Vridi.",
      missionId: "m-transit",
      lat: 5.256,
      lng: -3.996,
      read: false,
    },
  ],
  gauges: [
    {
      id: "g1",
      stationId: "st-cocody",
      tankId: "tk-c1",
      slot: "ouverture",
      at: new Date().toISOString().slice(0, 10) + "T06:05:00.000Z",
      mm: litersToMm(8400, 20000),
      liters: 8400,
      userId: "u-sup-cocody",
    },
  ],
  pumpReadings: [
    {
      id: "pr1",
      stationId: "st-cocody",
      pumpId: "p-c1",
      slot: "ouverture",
      at: new Date().toISOString().slice(0, 10) + "T06:10:00.000Z",
      index: 148230,
      userId: "u-pomp-cocody",
    },
  ],
};
