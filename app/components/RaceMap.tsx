"use client";

import { useEffect, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  color: string;
}

interface Props {
  markers: MapMarker[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  center: [number, number];
  zoom?: number;
  /** 값이 바뀔 때 모든 마커가 보이도록 지도 범위를 다시 맞춘다 */
  fitKey?: string;
  user?: [number, number] | null;
  className?: string;
}

type LeafletNS = typeof import("leaflet");

/**
 * OpenStreetMap 기반 지도. 앱 키가 필요 없다.
 * 카카오맵·네이버 지도 JS SDK를 쓰려면 앱 키를 받은 뒤 이 컴포넌트를 교체한다.
 */
export default function RaceMap({ markers, selectedId, onSelect, center, zoom = 7, fitKey, user, className }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const userLayerRef = useRef<LayerGroup | null>(null);
  const libRef = useRef<LeafletNS | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mod = await import("leaflet");
      const L = ((mod as unknown as { default?: LeafletNS }).default ?? mod) as LeafletNS;
      if (cancelled || !el.current || mapRef.current) return;
      libRef.current = L;
      const map = L.map(el.current, { scrollWheelZoom: false }).setView(center, zoom);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      userLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setReady(true);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
      userLayerRef.current = null;
      setReady(false);
    };
    // 초기 중심·확대 값만 쓴다. 이후 이동은 아래 효과들이 맡는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const L = libRef.current;
    const layer = layerRef.current;
    if (!ready || !L || !layer) return;
    layer.clearLayers();
    markers.forEach((m) => {
      const selected = m.id === selectedId;
      const size = selected ? 30 : 22;
      const icon = L.divIcon({
        className: "",
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:9999px;background:${m.color};border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.45)"></span>`,
      });
      const marker = L.marker([m.lat, m.lng], { icon, title: m.title, zIndexOffset: selected ? 1000 : 0 });
      if (onSelect) marker.on("click", () => onSelect(m.id));
      marker.addTo(layer);
    });
  }, [ready, markers, selectedId, onSelect]);

  useEffect(() => {
    const L = libRef.current;
    const map = mapRef.current;
    if (!ready || !L || !map || markers.length === 0) return;
    if (markers.length === 1) map.setView([markers[0].lat, markers[0].lng], zoom);
    else map.fitBounds(L.latLngBounds(markers.map((m) => [m.lat, m.lng] as [number, number])), { padding: [30, 30], maxZoom: 11 });
    // fitKey가 바뀔 때만 범위를 맞춘다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, fitKey]);

  useEffect(() => {
    const map = mapRef.current;
    const m = markers.find((x) => x.id === selectedId);
    if (ready && map && m) map.panTo([m.lat, m.lng]);
    // 선택이 바뀔 때만 이동한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, selectedId]);

  useEffect(() => {
    const L = libRef.current;
    const layer = userLayerRef.current;
    if (!ready || !L || !layer) return;
    layer.clearLayers();
    if (user) {
      L.circleMarker(user, { radius: 8, color: "#fff", weight: 3, fillColor: "#2563eb", fillOpacity: 1 }).addTo(layer);
      mapRef.current?.setView(user, 10);
    }
  }, [ready, user]);

  return <div ref={el} className={className ?? "h-64 w-full"} role="region" aria-label="대회 위치 지도" />;
}
