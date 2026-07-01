"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import {
  Map as MLMap,
  Marker as MLMarker,
  type StyleSpecification,
} from "maplibre-gl";
import { useReducedMotion } from "framer-motion";
import { REGIONS, GEO, recompute } from "@/lib/twin-data";
import { useTwinStore } from "@/store/useStore";

/* color language (shared with the other twin views) */
function hexLerp(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}
const SUPPLY_LO = "#ff4fa0";
const SUPPLY_HI = "#b47cf0";
const GAP_COOL = "#7fd9cc";
const GAP_HOT = "#ff7a36";
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const densityNorm = (d: number) => clamp01((d - 2) / 3.6);
const colorFor = (mode: string, density: number, gap: number) =>
  mode === "현황"
    ? hexLerp(SUPPLY_LO, SUPPLY_HI, densityNorm(density))
    : hexLerp(GAP_COOL, GAP_HOT, gap / 100);

/* dark raster basemap (CARTO dark_all — © OpenStreetMap © CARTO, keyless) */
const STYLE: StyleSpecification = {
  version: 8,
  sources: {
    carto: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors © CARTO",
    },
  },
  layers: [
    { id: "bg", type: "background", paint: { "background-color": "#16121a" } },
    { id: "carto", type: "raster", source: "carto", paint: { "raster-opacity": 0.9 } },
  ],
};

export function TwinMapStreet() {
  const reduced = useReducedMotion() ?? false;
  const { selectedCode, mode, addInstructors, addPrograms, select } =
    useTwinStore();
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const markersRef = useRef<
    Record<string, { marker: MLMarker; inner: HTMLDivElement }>
  >({});
  const [ready, setReady] = useState(false);
  const flownRef = useRef(false); // 첫 렌더는 전국 뷰 유지, 사용자 선택 시에만 flyTo

  // init map + markers once
  useEffect(() => {
    if (!hostRef.current) return;
    const map = new MLMap({
      container: hostRef.current,
      style: STYLE,
      center: [127.9, 36.3],
      zoom: 5.6,
      minZoom: 4.5,
      maxZoom: 12,
      dragRotate: false,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    // markers don't need the style to finish loading — add them now so they
    // appear immediately (and don't depend on the 'load' event firing).
    for (const r of REGIONS) {
      const g = GEO[r.code];
      if (!g) continue;
      const el = document.createElement("div");
      el.style.cursor = "pointer";
      // NOTE: position 을 건드리지 않는다. MapLibre 의 `.maplibregl-marker`
      // 클래스가 position:absolute + transform 으로 좌표에 고정하는데, 인라인
      // position:relative 로 덮으면 마커가 문서 흐름에 쌓여 남쪽으로 흘러내린다.
      el.setAttribute("data-code", r.code);
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", `${r.name} 지도에서 선택`);
      const inner = document.createElement("div");
      inner.style.borderRadius = "9999px";
      inner.style.pointerEvents = "none";
      el.appendChild(inner);
      el.addEventListener("click", () => select(r.code));
      const marker = new MLMarker({ element: el })
        .setLngLat([g.lng, g.lat])
        .addTo(map);
      markersRef.current[r.code] = { marker, inner };
    }
    setReady(true);
    map.on("load", () => map.resize());
    return () => {
      Object.values(markersRef.current).forEach((m) => m.marker.remove());
      markersRef.current = {};
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // restyle markers on mode / selection / intervention
  useEffect(() => {
    if (!ready) return;
    for (const r of REGIONS) {
      const entry = markersRef.current[r.code];
      if (!entry) continue;
      const isSel = r.code === selectedCode;
      const sim =
        isSel && (addInstructors > 0 || addPrograms > 0)
          ? recompute(r, addInstructors, addPrograms).after
          : null;
      const density = sim ? sim.density : r.density_per_100k;
      const gap = sim ? sim.gap : r.gap_index;
      const dn = densityNorm(density);
      const color = colorFor(mode, density, gap);
      const size = 12 + dn * 22;
      const intensity = mode === "현황" ? 0.42 + dn * 0.58 : 0.36 + (gap / 100) * 0.64;
      const el = entry.marker.getElement();
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      const inner = entry.inner;
      inner.style.width = "100%";
      inner.style.height = "100%";
      inner.style.background = `radial-gradient(circle, #fff 0%, ${color} 34%, ${color} 55%, transparent 72%)`;
      inner.style.boxShadow = `0 0 ${size * 0.9}px ${size * 0.3}px ${color}`;
      inner.style.opacity = String(0.5 + intensity * 0.5);
      inner.style.border = isSel ? "2px solid rgba(255,255,255,0.92)" : "none";
      const pulsing = mode === "사각지대" && gap / 100 > 0.7 && !reduced;
      inner.className = pulsing ? "gap-pulse" : "";
      el.style.zIndex = isSel ? "10" : "1";
    }
  }, [ready, mode, selectedCode, addInstructors, addPrograms, reduced]);

  // fly to selected region — 단, 첫 렌더는 전국 뷰(초기 center/zoom)를 유지해
  // 17개 마커가 각자 실제 도시에 얹힌 전국 그림을 먼저 보여준다.
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    if (!flownRef.current) {
      flownRef.current = true;
      return;
    }
    const g = GEO[selectedCode];
    if (!g) return;
    mapRef.current.flyTo({
      center: [g.lng, g.lat],
      zoom: 7,
      duration: reduced ? 0 : 1200,
    });
  }, [ready, selectedCode, reduced]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-ink">
      <div ref={hostRef} className="h-full w-full" />
      {!ready && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-xs text-white/50">
            다크 지도 로딩 중…
          </span>
        </div>
      )}
    </div>
  );
}
