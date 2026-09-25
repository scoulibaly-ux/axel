"use client";

import { when } from "@/lib/format";
import { useApp } from "@/lib/store";

export default function DocumentsPage() {
  const missions = useApp((s) => s.missions);
  const ids = useApp((s) => s.visibleStationIds());
  const docs = missions
    .filter((m) => ids.includes(m.stationId))
    .flatMap((m) => m.documents.map((d) => ({ ...d, ref: m.reference, missionId: m.id })));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Traçabilité</p>
        <h1 className="text-3xl font-black uppercase tracking-tight text-secondary">Documents</h1>
        <p className="mt-2 text-sm text-slate-500">
          Bons de chargement GESTOCI et bons de livraison liés à chaque mission.
        </p>
      </div>
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <tr>
              <th className="px-4 py-3">Fichier</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Mission</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-semibold">{d.name}</td>
                <td className="px-4 py-3 uppercase">{d.kind.replace("_", " ")}</td>
                <td className="px-4 py-3">
                  <a className="text-primary" href={`/missions/${d.missionId}`}>
                    {d.ref}
                  </a>
                </td>
                <td className="px-4 py-3 text-slate-500">{when(d.uploadedAt)}</td>
              </tr>
            ))}
            {docs.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-slate-400" colSpan={4}>
                  Aucun document. Joignez un bon depuis une mission.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
