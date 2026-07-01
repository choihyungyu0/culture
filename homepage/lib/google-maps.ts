/**
 * Google Maps JavaScript API loader (singleton).
 * Photorealistic 3D Maps(`maps3d`)를 위해 공식 bootstrap 로더를 사용한다.
 * 키는 `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`(클라이언트 노출용, HTTP 리퍼러로 제한 권장).
 *
 * 필요한 GCP 설정: Maps JavaScript API + Map Tiles API(Photorealistic 3D) + 결제.
 * 하나라도 빠지면 reject → 호출부에서 추상 트윈으로 폴백.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
let ready: Promise<any> | null = null;

export function loadGoogleMaps(): Promise<any> {
  if (typeof window === "undefined")
    return Promise.reject(new Error("no-window"));
  if (ready) return ready;

  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) return Promise.reject(new Error("no-key"));

  ready = new Promise((resolve, reject) => {
    try {
      const w = window as any;
      // 공식 인라인 bootstrap — google.maps.importLibrary 를 동기 정의한다.
      if (!w.google?.maps?.importLibrary) {
        ((g: any) => {
          let h: any;
          const c = "google";
          const l = "importLibrary";
          const q = "__ib__";
          const m = document;
          let b: any = window;
          b = b[c] || (b[c] = {});
          const d = b.maps || (b.maps = {});
          const r = new Set<string>();
          const e = new URLSearchParams();
          const u = () =>
            h ||
            (h = new Promise<void>(async (f: any, n: any) => {
              const a = m.createElement("script");
              e.set("libraries", [...r] + "");
              for (const k in g)
                e.set(
                  k.replace(/[A-Z]/g, (t: string) => "_" + t[0].toLowerCase()),
                  g[k]
                );
              e.set("callback", c + ".maps." + q);
              a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
              d[q] = f;
              a.onerror = () => (h = n(Error("google maps could not load.")));
              a.nonce =
                (m.querySelector("script[nonce]") as any)?.nonce || "";
              m.head.append(a);
            }));
          d[l]
            ? undefined
            : (d[l] = (f: string, ...n: any[]) =>
                r.add(f) && u().then(() => d[l](f, ...n)));
        })({ key, v: "beta" });
      }

      // maps3d 로드 시도 → 성공 시 google 반환
      w.google.maps
        .importLibrary("maps3d")
        .then(() => resolve(w.google))
        .catch((err: any) => {
          ready = null; // 재시도 허용
          reject(err);
        });
    } catch (e) {
      ready = null;
      reject(e);
    }
  });

  return ready;
}
