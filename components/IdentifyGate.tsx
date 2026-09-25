"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useApp } from "@/lib/store";

export function IdentifyGate({
  place,
  children,
}: {
  place: string;
  children: React.ReactNode;
}) {
  const identifiedUntil = useApp((s) => s.identifiedUntil);
  const identify = useApp((s) => s.identify);
  const user = useApp((s) => s.currentUser());
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    setOk(!!identifiedUntil && identifiedUntil > Date.now());
  }, [identifiedUntil]);

  if (ok) return <>{children}</>;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <ShieldCheck className="h-6 w-6" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-primary">
        Identification agent
      </p>
      <h3 className="mt-1 text-lg font-black uppercase tracking-tight text-secondary">
        Confirmez votre présence
      </h3>
      <p className="mt-2 text-sm font-medium text-slate-500">
        Avant {place}, {user?.name} doit s’identifier (code PIN personnel).
      </p>
      <form
        className="mt-5 flex gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const res = identify(pin);
          if (!res.ok) {
            setError("PIN incorrect.");
            return;
          }
          setOk(true);
        }}
      >
        <input
          inputMode="numeric"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Code PIN à 4 chiffres"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-secondary placeholder-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button className="rounded-xl bg-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-primary-sm hover:bg-primary/90">
          Valider
        </button>
      </form>
      {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
      <p className="mt-3 text-[11px] text-slate-400">
        Proto : le PIN de {user?.name} est <span className="font-mono">{user?.pin}</span>
      </p>
    </div>
  );
}
