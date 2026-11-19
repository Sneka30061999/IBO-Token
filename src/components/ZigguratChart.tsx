/**
 * ZigguratChart.tsx — 3D Ziggurat Tokenomics Chart
 * ─────────────────────────────────────────────────
 * • Layers ranked largest (bottom) → smallest (top)
 * • Drag to rotate (mouse + touch)
 * • Hover a layer → stack explodes + premium floating tooltip
 *   appears directly over the cursor, inside the canvas
 * • No legend table below — clean, simple preview
 */

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { allocations, TOTAL_SUPPLY } from "../data/content";

/* ── helpers ───────────────────────────────────────────── */
const fmtN    = (n: number) => n.toLocaleString("en-US");
const easeOut = (u: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, u)), 3);
const lerp    = (a: number, b: number, k: number) => a + (b - a) * k;

type Item = { name: string; amount: number; color: string; description: string };

/* Sort largest → smallest */
const ITEMS: Item[] = [...allocations]
  .map(a => ({ name: a.name, amount: a.tokens, color: a.color, description: a.description }))
  .sort((a, b) => b.amount - a.amount);

/* Tooltip position tracked in React */
interface TipState {
  idx:     number;   // -1 = hidden
  x:       number;   // px from canvas left
  y:       number;   // px from canvas top
}

export default function ZigguratChart() {
  const mountRef  = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<TipState>({ idx: -1, x: 0, y: 0 });

  const reduced = typeof window !== "undefined"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    /* ── renderer ── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.className = "block h-full w-full";
    mount.appendChild(renderer.domElement);

    /* ── scene + camera ── */
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
    camera.position.set(0, 3.5, 12);
    camera.lookAt(0, 0.6, 0);

    /* ── lights ── */
    scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const key = new THREE.DirectionalLight(0x2ee5a8, 2.4);
    key.position.set(6, 8, 7); scene.add(key);
    const rim = new THREE.DirectionalLight(0x1aad7e, 1.8);
    rim.position.set(-8, 2, 6); scene.add(rim);
    const purpleRim = new THREE.PointLight(0x2ee5a8, 2.5, 25, 1.5);
    purpleRim.position.set(0, 5, -6); scene.add(purpleRim);

    /* ── stage group ── */
    const group = new THREE.Group();
    scene.add(group);

    /* ── starfield ── */
    const sp = new Float32Array(1600);
    for (let k = 0; k < sp.length; k++) sp[k] = (Math.random() - 0.5) * 32;
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(sp, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.05, color: 0x9fc3ff,
      transparent: true, opacity: 0.7,
      depthWrite: false, blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.Points(starGeo, starMat));

    /* ── floor grid ── */
    const grid = new THREE.GridHelper(16, 32, 0x2ee5a8, 0x0a1a14);
    grid.position.y = -2.1;
    group.add(grid);

    /* ── layers ── */
    type LayerData = {
      mesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
      itemIdx: number;
      stackPos: number;
      hv: number;
    };

    const layers: LayerData[] = ITEMS.map((item, k) => {
      const w   = 5.4 - k * 0.58;
      const geo = new THREE.BoxGeometry(w, 0.55, w);
      const mat = new THREE.MeshStandardMaterial({
        color: item.color, emissive: item.color, emissiveIntensity: 0.3,
        transparent: true, opacity: 0.86,
        metalness: 0.5, roughness: 0.2,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.add(new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 }),
      ));
      group.add(mesh);
      return { mesh, itemIdx: k, stackPos: k, hv: 0 };
    });

    const meshList = layers.map(l => l.mesh);

    /* ── resize ── */
    const resize = () => {
      const w = Math.max(1, mount.clientWidth);
      const h = Math.max(1, mount.clientHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov    = w < 600 ? 58 : 42;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    /* ── visibility ── */
    let visible = false;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(mount);

    /* ── interaction ── */
    let hov = -1, dragging = false, lx = 0, ly = 0;
    const raycaster = new THREE.Raycaster();
    const mouse     = new THREE.Vector2();

    const setHov = (idx: number, cx: number, cy: number) => {
      if (idx !== hov) {
        hov = idx;
        setTip({ idx, x: cx, y: cy });
      } else if (idx >= 0) {
        /* update position even when same layer */
        setTip(prev => ({ ...prev, x: cx, y: cy }));
      }
    };

    const onDown = (e: PointerEvent) => {
      dragging = true; lx = e.clientX; ly = e.clientY;
      try { mount.setPointerCapture(e.pointerId); } catch {}
    };
    const onUp    = () => { dragging = false; };
    const onLeave = () => { hov = -1; setTip({ idx: -1, x: 0, y: 0 }); };

    const onMove = (e: PointerEvent) => {
      if (dragging && !reduced) {
        group.rotation.y += (e.clientX - lx) * 0.008;
        group.rotation.x = Math.max(-0.6, Math.min(0.9,
          group.rotation.x + (e.clientY - ly) * 0.005));
        lx = e.clientX; ly = e.clientY;
      }

      const rect = mount.getBoundingClientRect();
      /* canvas-relative position for tooltip */
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      mouse.set(
         (cx / rect.width)  * 2 - 1,
        -(cy / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(mouse, camera);
      const hit = raycaster.intersectObjects(meshList, false)[0];
      const hitIdx = hit
        ? (layers.find(l => l.mesh === hit.object)?.itemIdx ?? -1)
        : -1;
      setHov(hitIdx, cx, cy);
    };

    mount.addEventListener("pointerdown",  onDown);
    mount.addEventListener("pointerup",    onUp);
    mount.addEventListener("pointermove",  onMove);
    mount.addEventListener("pointerleave", onLeave);

    /* ── render loop ── */
    let gap = 0.05;
    let t0: number | null = null;
    let rafId: number;

    const frame = (now: number) => {
      rafId = requestAnimationFrame(frame);
      if (!visible) return;
      if (t0 === null) t0 = now;
      const t = (now - t0) / 1000;

      if (!dragging && !reduced) group.rotation.y += 0.003;
      gap = lerp(gap, hov >= 0 ? 0.34 : 0.05, 0.1);

      layers.forEach(ld => {
        ld.hv = lerp(ld.hv, hov === ld.itemIdx ? 1 : 0, 0.15);
        const s = reduced ? 1 : easeOut((t - ld.stackPos * 0.12) / 0.9);
        ld.mesh.scale.set(s, s, s);
        ld.mesh.position.y         = -1.8 + ld.stackPos * (0.55 + gap);
        ld.mesh.material.emissiveIntensity = 0.3 + ld.hv * 0.7;
      });

      renderer.render(scene, camera);
    };
    rafId = requestAnimationFrame(frame);

    /* ── cleanup ── */
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect(); io.disconnect();
      mount.removeEventListener("pointerdown",  onDown);
      mount.removeEventListener("pointerup",    onUp);
      mount.removeEventListener("pointermove",  onMove);
      mount.removeEventListener("pointerleave", onLeave);
      layers.forEach(ld => {
        ld.mesh.geometry.dispose();
        ld.mesh.material.dispose();
        ld.mesh.children.forEach((c: any) => {
          c.geometry?.dispose(); c.material?.dispose();
        });
      });
      (grid.geometry as THREE.BufferGeometry).dispose();
      starGeo.dispose(); starMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Tooltip data ── */
  const active  = tip.idx >= 0 ? ITEMS[tip.idx] : null;
  const pctVal  = active ? ((active.amount / TOTAL_SUPPLY) * 100).toFixed(2) : "";

  /* Keep tooltip inside canvas: 220px wide, ~110px tall */
  const TIP_W = 224;
  const TIP_H = 115;
  const tipX  = tip.x + 16 + TIP_W  > (mountRef.current?.clientWidth  ?? 9999)
    ? tip.x - TIP_W - 16
    : tip.x + 16;
  const tipY  = tip.y - 20 < 0
    ? tip.y + 12
    : tip.y - TIP_H - 12;

  return (
    /* Single wrapper — canvas + floating tooltip, no table below */
    <div
      ref={mountRef}
      className={[
        "relative h-[400px] w-full cursor-grab select-none overflow-hidden",
        "rounded-3xl active:cursor-grabbing",
        "bg-[radial-gradient(ellipse_at_50%_100%,#021a10_0%,#020504_55%,#020504_100%)]",
        "sm:h-[480px] lg:h-[540px]",
      ].join(" ")}
      style={{ touchAction: "pan-y" }}
      aria-label="Interactive 3D tokenomics chart — drag to rotate, hover a layer to inspect"
    >
      {/* ── floating premium tooltip ── */}
      {active && (
        <div
          className="pointer-events-none absolute z-20 transition-opacity duration-200"
          style={{ left: tipX, top: tipY, opacity: 1, width: TIP_W }}
        >
          {/* Card */}
          <div
            className="rounded-2xl border p-4 backdrop-blur-xl"
            style={{
              background:   `rgba(2,5,4,0.92)`,
              borderColor:  `${active.color}60`,
              boxShadow:    `0 0 0 1px ${active.color}20, 0 12px 40px -8px rgba(0,0,0,0.8), 0 0 32px -8px ${active.color}50`,
            }}
          >
            {/* Top accent line */}
            <div
              className="absolute left-4 right-4 top-0 h-[1.5px] rounded-full"
              style={{ background: `linear-gradient(90deg, transparent, ${active.color}, transparent)` }}
            />

            {/* % badge */}
            <div className="mb-2.5 flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: active.color, boxShadow: `0 0 8px ${active.color}` }}
              />
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-black tracking-widest"
                style={{
                  background: `${active.color}22`,
                  color:      active.color,
                  border:     `1px solid ${active.color}50`,
                }}
              >
                {pctVal}%
              </span>
            </div>

            {/* Name */}
            <p
              className="text-[13px] font-bold leading-tight"
              style={{ color: active.color }}
            >
              {active.name}
            </p>

            {/* Amount */}
            <p className="mt-1.5 font-mono text-xl font-black tracking-tight text-white">
              {fmtN(active.amount)}
              <span className="ml-1 text-xs font-semibold text-slate-400">IBO</span>
            </p>

            {/* Description */}
            <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
              {active.description}
            </p>
          </div>
        </div>
      )}

      {/* ── drag hint (bottom-left of canvas, fades when hovering) ── */}
      <p
        className={`absolute bottom-4 left-5 text-xs text-slate-500 transition-opacity duration-300 ${
          active ? "opacity-0" : "opacity-70"
        }`}
      >
        Drag to rotate · hover a layer to inspect
      </p>
    </div>
  );
}
