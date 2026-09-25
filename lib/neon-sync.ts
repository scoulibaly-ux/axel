import type { AppState } from "./types";
import { useApp } from "./store";

function pickState(): AppState {
  const s = useApp.getState();
  return {
    users: s.users,
    currentUserId: s.currentUserId,
    identifiedUntil: s.identifiedUntil,
    stations: s.stations,
    tanks: s.tanks,
    pumps: s.pumps,
    trucks: s.trucks,
    drivers: s.drivers,
    missions: s.missions,
    alerts: s.alerts,
    gauges: s.gauges,
    pumpReadings: s.pumpReadings,
  };
}

let timer: ReturnType<typeof setTimeout> | undefined;
let started = false;

export async function pullRemoteState() {
  const res = await fetch("/api/state", { cache: "no-store" });
  if (!res.ok) return;
  const json = (await res.json()) as { state?: AppState | null };
  if (!json.state) {
    await fetch("/api/state", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ state: pickState() }),
    });
    return;
  }
  const localUser = useApp.getState().currentUserId;
  useApp.setState({
    ...json.state,
    currentUserId: localUser,
  });
}

export function startNeonSync() {
  if (started || typeof window === "undefined") return;
  started = true;
  useApp.subscribe(() => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      void fetch("/api/state", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ state: pickState() }),
      });
    }, 800);
  });
}
