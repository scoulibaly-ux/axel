import type { MissionStatus, Product, Role } from "./types";

export function liters(n: number) {
  return `${Math.round(n).toLocaleString("fr-FR")} L`;
}

export function mm(n: number) {
  return `${Math.round(n).toLocaleString("fr-FR")} mm`;
}

export function when(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const roleLabel: Record<Role, string> = {
  proprietaire: "Propriétaire",
  adjoint: "Adjoint",
  gerant: "Gérant de station",
  superviseur: "Agent superviseur",
  pompiste: "Pompiste",
  chauffeur: "Chauffeur",
};

export const productLabel: Record<Product, string> = {
  super: "Super",
  gasoil: "Gasoil",
  petrole: "Pétrole",
};

export const statusLabel: Record<MissionStatus, string> = {
  commande: "Commande",
  empotage: "Empotage GESTOCI",
  en_transit: "En transit",
  arrivee: "Arrivée station",
  depotage: "Dépotage",
  rapprochement: "Rapprochement",
  cloturee: "Clôturée",
};

export function litersToMm(levelL: number, capacityL: number) {
  return Math.round((levelL / capacityL) * 1800);
}
