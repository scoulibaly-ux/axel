import type { AlertSeverity, MissionStatus } from "@/lib/types";
import { statusLabel } from "@/lib/format";

const statusClass: Record<MissionStatus, string> = {
  commande: "bg-slate-100 text-slate-700",
  empotage: "bg-blue-50 text-blue-900",
  en_transit: "bg-amber-50 text-amber-800",
  arrivee: "bg-indigo-50 text-indigo-800",
  depotage: "bg-orange-50 text-primary",
  rapprochement: "bg-emerald-50 text-emerald-700",
  cloturee: "bg-slate-900 text-white",
};

export function StatusBadge({ status }: { status: MissionStatus }) {
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${statusClass[status]}`}
    >
      {statusLabel[status]}
    </span>
  );
}

const sevClass: Record<AlertSeverity, string> = {
  critique: "bg-red-50 text-red-700",
  avertissement: "bg-amber-50 text-amber-800",
  info: "bg-blue-50 text-blue-800",
};

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${sevClass[severity]}`}
    >
      {severity}
    </span>
  );
}
