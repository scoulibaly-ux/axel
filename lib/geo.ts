export const GESTOCI = { lat: 5.256, lng: -3.996, name: "GESTOCI — Vridi" };

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
