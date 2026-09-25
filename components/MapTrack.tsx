"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { GESTOCI } from "@/lib/geo";

const truckIcon = L.divIcon({
  className: "",
  html: `<div style="background:#FF7900;color:white;border-radius:999px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;border:2px solid white;box-shadow:0 4px 10px rgba(0,0,0,.25)">⛽</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export default function MapTrack({
  station,
  truck,
  events,
}: {
  station: { name: string; lat: number; lng: number };
  truck: { lat: number; lng: number; plate: string };
  events: { lat: number; lng: number; note: string }[];
}) {
  useEffect(() => {
    // leaflet css already imported
  }, []);

  return (
    <MapContainer
      center={[truck.lat, truck.lng]}
      zoom={11}
      className="h-full w-full rounded-2xl"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline
        positions={[
          [GESTOCI.lat, GESTOCI.lng],
          [truck.lat, truck.lng],
          [station.lat, station.lng],
        ]}
        pathOptions={{ color: "#FF7900", weight: 4 }}
      />
      <CircleMarker
        center={[GESTOCI.lat, GESTOCI.lng]}
        radius={8}
        pathOptions={{ color: "#063B6F", fillColor: "#063B6F", fillOpacity: 1 }}
      >
        <Popup>GESTOCI — Vridi</Popup>
      </CircleMarker>
      <CircleMarker
        center={[station.lat, station.lng]}
        radius={8}
        pathOptions={{ color: "#16A34A", fillColor: "#16A34A", fillOpacity: 1 }}
      >
        <Popup>{station.name}</Popup>
      </CircleMarker>
      <Marker position={[truck.lat, truck.lng]} icon={truckIcon}>
        <Popup>{truck.plate}</Popup>
      </Marker>
      {events.map((e, i) => (
        <CircleMarker
          key={i}
          center={[e.lat, e.lng]}
          radius={6}
          pathOptions={{ color: "#DC2626", fillColor: "#DC2626", fillOpacity: 0.85 }}
        >
          <Popup>{e.note}</Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
