"use client";

import { useEffect, useState } from "react";

export function DbStatus() {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    fetch("/api/health/db", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setOk(Boolean(j.ok)))
      .catch(() => setOk(false));
  }, []);
  if (ok === null) return null;
  return (
    <p
      className={`mt-2 text-[10px] font-black uppercase tracking-widest ${
        ok ? "text-emerald-600" : "text-amber-600"
      }`}
    >
      {ok ? "Neon Postgres · connecté" : "Neon Postgres · hors ligne (localStorage)"}
    </p>
  );
}
