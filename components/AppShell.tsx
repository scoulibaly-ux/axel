"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ClipboardList,
  Fuel,
  Gauge,
  LayoutDashboard,
  LogOut,
  MapPinned,
  RotateCcw,
  Truck,
  FileBarChart,
  FileText,
} from "lucide-react";
import { BrandMark } from "./BrandMark";
import { roleLabel } from "@/lib/format";
import { useApp } from "@/lib/store";
import type { Action } from "@/lib/store";

const links: { href: string; label: string; icon: typeof Fuel; action?: Action }[] = [
  { href: "/tableau-de-bord", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/missions", label: "Missions", icon: MapPinned, action: "transit" },
  { href: "/alertes", label: "Alertes", icon: Bell, action: "alerts" },
  { href: "/jauges", label: "Jauges cuves", icon: Gauge, action: "gauges" },
  { href: "/pompes", label: "Index pompes", icon: ClipboardList, action: "pumps" },
  { href: "/flotte", label: "Flotte", icon: Truck, action: "transit" },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/rapports", label: "Rapports", icon: FileBarChart, action: "reports" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useApp((s) => s.currentUser());
  const users = useApp((s) => s.users);
  const login = useApp((s) => s.login);
  const logout = useApp((s) => s.logout);
  const can = useApp((s) => s.can);
  const resetDemo = useApp((s) => s.resetDemo);
  const unread = useApp((s) => s.alerts.filter((a) => !a.read).length);

  useEffect(() => {
    if (!user) router.replace("/");
  }, [user, router]);

  if (!user) return null;

  const visible = links.filter((l) => !l.action || can(l.action) || l.href === "/documents");

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-secondary text-white lg:flex">
        <div className="border-b border-white/10 px-5 py-5">
          <BrandMark variant="dark" />
          <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-white/50">
            Contrôle des flux carburant
          </p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {visible.map((l) => {
            const active = pathname.startsWith(l.href);
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-widest transition ${
                  active
                    ? "bg-primary text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {l.label}
                {l.href === "/alertes" && unread > 0 && (
                  <span className="ml-auto rounded-full bg-red-600 px-2 py-0.5 text-[10px]">
                    {unread}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4 text-xs">
          <p className="font-bold text-white">{user.name}</p>
          <p className="text-white/50">{roleLabel[user.role]}</p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0A192F]/90 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3 lg:hidden">
            <BrandMark variant="dark" compact />
            <span className="text-xs font-black uppercase tracking-widest text-white">
              Pro<span className="text-primary">Fuel</span>
            </span>
          </div>
          <p className="hidden text-[10px] font-bold uppercase tracking-widest text-white/60 lg:block">
            Maîtrisez vos opérations, réduisez vos pertes
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white/70">
              Tester un rôle
              <select
                className="bg-transparent text-white outline-none"
                value={user.id}
                onChange={(e) => login(e.target.value)}
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id} className="text-secondary">
                    {u.name} — {roleLabel[u.role]}
                  </option>
                ))}
              </select>
            </label>
            <button
              onClick={() => resetDemo()}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white hover:border-primary hover:bg-primary/10"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sortir
            </button>
          </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto border-t border-white/10 px-3 py-2 lg:hidden">
            {visible.map((l) => {
              const active = pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest ${
                    active ? "bg-primary text-white" : "text-white/70"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
