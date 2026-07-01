"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "@/lib/google-maps";
import { REGIONS, REGION_BY_CODE, recompute, GEO } from "@/lib/twin-data";
import { useTwinStore } from "@/store/useStore";

const KOREA = { lat: 36.2, lng: 127.9, altitude: 0 };

/* color helpers (shared with SVG map language) */
function hexLerp(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `#${c.map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const densityNorm = (d: number) => clamp01((d - 2) / 3.6);

function colorFor(mode: string, density: number, gap: number) {
  return mode === "현황"
    ? hexLerp("#ff4fa0", "#b47cf0", densityNorm(density))
    : hexLerp("#7fd9cc", "#ff7a36", gap / 100);
}

export function TwinMap3D() {
  const { selectedCode, mode, addInstructors, addPrograms, select } =
    useTwinStore();
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, { marker: any; pin: any }>>({});
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errMsg, setErrMsg] = useState("");

  // build map once
  useEffect(() => {
    let cancelled = false;
    let cleanup = () => {};

    loadGoogleMaps()
      .then(async (google: any) => {
        const { Map3DElement, Marker3DElement, AltitudeMode, MapMode } =
          await google.maps.importLibrary("maps3d");
        let PinElement: any = null;
        try {
          ({ PinElement } = await google.maps.importLibrary("marker"));
        } catch {
          /* pin styling is best-effort */
        }
        if (cancelled || !hostRef.current) return;

        const map = new Map3DElement({
          center: { ...KOREA },
          range: 1650000,
          tilt: 47,
          heading: 0,
          // SATELLITE = 라벨 없는 깨끗한 실사 위성 이미지 (Map Tiles API 불필요).
          // 지역 라벨은 우리 마커가 담당 → 브랜드에 맞는 미니멀 실사.
          mode: MapMode?.SATELLITE ?? "SATELLITE",
        });
        map.style.width = "100%";
        map.style.height = "100%";
        hostRef.current.innerHTML = "";
        hostRef.current.append(map);
        mapRef.current = map;

        for (const r of REGIONS) {
          const g = GEO[r.code];
          if (!g) continue;
          const altitude = 20000 + densityNorm(r.density_per_100k) * 150000;
          const color = colorFor(mode, r.density_per_100k, r.gap_index);
          let pin: any = null;
          if (PinElement) {
            try {
              pin = new PinElement({
                background: color,
                borderColor: "#ffffff",
                glyphColor: "#ffffff",
                scale: 1.1,
              });
            } catch {
              pin = null;
            }
          }
          const marker = new Marker3DElement({
            position: { lat: g.lat, lng: g.lng, altitude },
            altitudeMode: AltitudeMode.RELATIVE_TO_GROUND,
            extruded: true,
            label: `${r.code} ${r.gap_index}`,
          });
          if (pin) {
            try {
              marker.append(pin);
            } catch {
              /* ignore */
            }
          }
          marker.addEventListener("gmp-click", () => select(r.code));
          map.append(marker);
          markersRef.current[r.code] = { marker, pin };
        }

        setStatus("ready");
        cleanup = () => {
          try {
            map.remove();
          } catch {
            /* ignore */
          }
        };
      })
      .catch((err: any) => {
        if (cancelled) return;
        const msg = String(err?.message || err);
        setErrMsg(
          msg.includes("no-key")
            ? "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY 가 없습니다."
            : "3D 지도를 불러오지 못했습니다. GCP에서 Maps JavaScript API와 결제가 활성화되어 있는지 확인하세요."
        );
        setStatus("error");
      });

    return () => {
      cancelled = true;
      cleanup();
      markersRef.current = {};
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fly camera to selected region
  useEffect(() => {
    const map = mapRef.current;
    const g = GEO[selectedCode];
    if (!map || !g || status !== "ready") return;
    try {
      map.flyCameraTo({
        endCamera: {
          center: { lat: g.lat, lng: g.lng, altitude: 0 },
          tilt: 62,
          range: 260000,
        },
        durationMillis: 2200,
      });
    } catch {
      try {
        map.center = { lat: g.lat, lng: g.lng, altitude: 0 };
        map.range = 260000;
      } catch {
        /* ignore */
      }
    }
  }, [selectedCode, status]);

  // recolor + resize selected marker on mode / intervention change
  useEffect(() => {
    if (status !== "ready") return;
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
      const color = colorFor(mode, density, gap);
      if (entry.pin) {
        try {
          entry.pin.background = color;
          entry.pin.scale = isSel ? 1.5 : 1.1;
        } catch {
          /* ignore */
        }
      }
      try {
        const g = GEO[r.code];
        entry.marker.position = {
          lat: g.lat,
          lng: g.lng,
          altitude: 20000 + densityNorm(density) * 150000,
        };
        entry.marker.label = `${r.code} ${gap}`;
      } catch {
        /* ignore */
      }
    }
  }, [mode, selectedCode, addInstructors, addPrograms, status]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl">
      <div ref={hostRef} className="h-full w-full" />
      {status !== "ready" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/80 px-6 text-center">
          {status === "loading" ? (
            <>
              <span className="inline-flex gap-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/60" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/60 [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/60 [animation-delay:0.4s]" />
              </span>
              <p className="font-mono text-xs text-white/50">
                Photorealistic 3D 로딩 중…
              </p>
            </>
          ) : (
            <>
              <span className="badge-exploratory">3D 지도 폴백</span>
              <p className="max-w-sm text-xs leading-relaxed text-white/60">
                {errMsg}
              </p>
              <p className="text-[0.7rem] text-white/40">
                상단 토글에서 [추상 트윈]으로 계속 이용하실 수 있습니다.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
