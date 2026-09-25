"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { roleLabel } from "@/lib/format";
import { useApp } from "@/lib/store";

export default function LoginPage() {
  const users = useApp((s) => s.users);
  const login = useApp((s) => s.login);
  const current = useApp((s) => s.currentUserId);
  const router = useRouter();

  useEffect(() => {
    if (current) router.replace("/tableau-de-bord");
  }, [current, router]);

  return (
    <div className="min-h-screen bg-secondary text-white">
      <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/80 to-transparent" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <BrandMark variant="dark" />
        <h1 className="mt-10 max-w-3xl text-4xl font-black uppercase leading-tight tracking-tight md:text-6xl">
          Maîtrisez vos <span className="text-primary">opérations,</span>
          <br />
          réduisez vos pertes
        </h1>
        <p className="mt-4 max-w-xl text-lg text-slate-300">
          Prototype ProFuel — chaîne de confiance GESTOCI → trajet → station.
          Choisissez un profil pour tester un workflow.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => {
                login(u.id);
                router.push("/tableau-de-bord");
              }}
              className="rounded-3xl border border-white/15 bg-white/5 p-5 text-left transition hover:border-primary hover:bg-primary/10"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                {roleLabel[u.role]}
              </p>
              <p className="mt-2 text-lg font-black">{u.name}</p>
              <p className="mt-1 text-xs text-white/60">PIN proto · {u.pin}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
