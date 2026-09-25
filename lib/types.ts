export type Role =
  | "proprietaire"
  | "adjoint"
  | "gerant"
  | "superviseur"
  | "pompiste"
  | "chauffeur";

export type Product = "super" | "gasoil" | "petrole";

export type MissionStatus =
  | "commande"
  | "empotage"
  | "en_transit"
  | "arrivee"
  | "depotage"
  | "rapprochement"
  | "cloturee";

export type AlertSeverity = "critique" | "avertissement" | "info";

export interface User {
  id: string;
  name: string;
  role: Role;
  pin: string;
  stationId?: string;
  truckId?: string;
}

export interface Station {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  managerUserId: string;
}

export interface Tank {
  id: string;
  stationId: string;
  name: string;
  product: Product;
  capacityL: number;
  levelL: number;
  /** millimetres of ullage / height used by the dipstick conversion */
  lastMm: number;
}

export interface Pump {
  id: string;
  stationId: string;
  name: string;
  product: Product;
  tankId: string;
  index: number;
}

export interface Compartment {
  id: string;
  index: number;
  product: Product;
  capacityL: number;
  loadedL: number;
  probeL: number;
}

export interface Truck {
  id: string;
  plate: string;
  compartmentCount: number;
  compartments: Compartment[];
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  truckId: string;
}

export interface DocumentFile {
  id: string;
  name: string;
  kind: "bon_chargement" | "bon_livraison" | "autre";
  uploadedAt: string;
  uploadedBy: string;
}

export interface VolumeEvent {
  at: string;
  lat: number;
  lng: number;
  totalL: number;
  note: string;
}

export interface Mission {
  id: string;
  reference: string;
  stationId: string;
  truckId: string;
  driverId: string;
  status: MissionStatus;
  createdAt: string;
  gestociBonL: number;
  gestociProbeL: number | null;
  arrivalProbeL: number | null;
  unloadedL: number;
  documents: DocumentFile[];
  identifiedBy: { userId: string; at: string; place: string }[];
  routeProgress: number;
  lat: number;
  lng: number;
  events: VolumeEvent[];
  mapping: { compartmentId: string; tankId: string; volumeL: number }[];
  siphonSimulated: boolean;
}

export interface Alert {
  id: string;
  at: string;
  severity: AlertSeverity;
  title: string;
  detail: string;
  missionId?: string;
  stationId?: string;
  lat?: number;
  lng?: number;
  read: boolean;
}

export interface GaugeReading {
  id: string;
  stationId: string;
  tankId: string;
  slot: "ouverture" | "midi" | "minuit";
  at: string;
  mm: number;
  liters: number;
  userId: string;
}

export interface PumpReading {
  id: string;
  stationId: string;
  pumpId: string;
  slot: "ouverture" | "cloture";
  at: string;
  index: number;
  userId: string;
}

export interface AppState {
  users: User[];
  currentUserId: string | null;
  identifiedUntil: number | null;
  stations: Station[];
  tanks: Tank[];
  pumps: Pump[];
  trucks: Truck[];
  drivers: Driver[];
  missions: Mission[];
  alerts: Alert[];
  gauges: GaugeReading[];
  pumpReadings: PumpReading[];
}
