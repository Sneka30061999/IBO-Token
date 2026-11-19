/**
 * TokenomicsSpiral.tsx
 * ─────────────────────────────────────────────────────────────
 * 3-D spiral / extruded donut tokenomics chart.
 * Converted from the reference to fully-typed React + Three.js.
 *
 * Features:
 *  • Segments spiral inward on first render (swirl-in entrance)
 *  • Drag to rotate the ring
 *  • Hover / focus a segment → it pops outward + legend row highlights
 *  • Floating particles + floor disc
 *  • Replay button resets the entrance animation
 *  • Fully responsive via ResizeObserver
 *  • prefers-reduced-motion respected
 */

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { allocations, TOTAL_SUPPLY } from "../data/content";
import { fmt } from "../config/token";

/* ── data derived from project allocations ─────────────── */
interface Row {
  name:   string;
  tokens: number;
  pct:    number;
  color:  string;
}

const DATA: Row[] = allocations.map(a => ({
  name:   a.name,
  tokens: a.tokens,
  pct:    parseFloat(((a.tokens / TOTAL_SUPPLY) * 100).toFixed(2)),
  color:  a.color,
}));

/* ── helpers ───────────────────────────────────────────── */
const PI    = Math.PI;
const easeO = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

/* ═══════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════ */
export default function TokenomicsSpiral() {
  const mountRef  = useRef<HTMLDivElement>(null);
  const activeRef = useRef<number>(-1);
  const replayRef = useRef<() => void>(() => {});
  const [active,  setActive]  = useState<number>(-1);

  const hover = (i: number) => {
    activeRef.current = i;
    setActive(i);
  };

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ── renderer ── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    el.appendChild(renderer.domElement);
    renderer.domElement.className = "block h-full w-full cursor-grab active:cursor-grabbing";

    /* ── scene + camera ── */
    const scene = new THREE.Scene();
    const cam   = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    cam.position.set(0, 7.4, 9);
    cam.lookAt(0, 0.6, 0);

    /* ── lights ── */
    scene.add(new THREE.AmbientLight(0x2ee5a8, 0.35));
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(5, 9, 6); scene.add(key);
    const rim  = new THREE.PointLight(0x2ee5a8, 1.2, 30);
    rim.position.set(-6, 3, -5); scene.add(rim);
    const warm = new THREE.PointLight(0x1aad7e, 0.7, 30);
    warm.position.set(6, 2, -4); scene.add(warm);

    /* ── group (draggable) ── */
    const group = new THREE.Group();
    scene.add(group);

    /* ── floor disc ── */
    const baseDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(3.7, 3.9, 0.12, 96),
      new THREE.MeshPhysicalMaterial({
        color: 0x1a2447, metalness: 0.2, roughness: 0.15,
        transparent: true, opacity: 0.75, clearcoat: 1,
      } as THREE.MeshPhysicalMaterialParameters),
    );
    baseDisc.position.y = -0.1;
    group.add(baseDisc);

    /* ── segments ── */
    type SegMesh = THREE.Mesh<THREE.ExtrudeGeometry, THREE.MeshPhysicalMaterial> & {
      userData: { i: number; pop: number; dir: THREE.Vector3 };
    };
    const meshes: SegMesh[] = [];
    let a = PI / 2;

    DATA.forEach((d, i) => {
      const span = (d.pct / 100) * PI * 2;
      const a0   = a + 0.02;
      const a1   = a + span - 0.02;
      const mid  = (a0 + a1) / 2;
      a += span;

      const shape = new THREE.Shape();
      shape.absarc(0, 0, 3.2, a0, a1, false);
      shape.absarc(0, 0, 1.8, a1, a0, true);
      shape.closePath();

      const geo = new THREE.ExtrudeGeometry(shape, {
        depth:          0.5 + d.pct * 0.05,
        bevelEnabled:   true,
        bevelSize:      0.04,
        bevelThickness: 0.05,
        bevelSegments:  3,
        curveSegments:  40,
      });
      geo.rotateX(-PI / 2);

      const col  = new THREE.Color(d.color);
      const mesh = new THREE.Mesh(
        geo,
        new THREE.MeshPhysicalMaterial({
          color: col, metalness: 0.45, roughness: 0.28,
          clearcoat: 1, clearcoatRoughness: 0.12,
          emissive: col, emissiveIntensity: 0.12,
        } as THREE.MeshPhysicalMaterialParameters),
      ) as SegMesh;

      mesh.userData = {
        i,
        pop: 0,
        dir: new THREE.Vector3(Math.cos(mid), 0, -Math.sin(mid)),
      };
      group.add(mesh);
      meshes.push(mesh);
    });

    /* ── particles ── */
    const pa: number[] = [];
    for (let k = 0; k < 260; k++) {
      const q  = Math.random() * PI * 2;
      const rr = 4.5 + Math.random() * 5;
      pa.push(Math.cos(q) * rr, Math.random() * 6 - 1, Math.sin(q) * rr);
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute("position", new THREE.Float32BufferAttribute(pa, 3));
    const particles = new THREE.Points(
      pg,
      new THREE.PointsMaterial({ size: 0.04, color: 0x2ee5a8, transparent: true, opacity: 0.6 }),
    );
    scene.add(particles);

    /* ── interaction ── */
    const ray = new THREE.Raycaster();
    const mp  = new THREE.Vector2();
    let drag = false, lx = 0, vel = 0;
    const dom = renderer.domElement;

    const onDown  = (e: PointerEvent) => {
      drag = true; lx = e.clientX;
      try { dom.setPointerCapture(e.pointerId); } catch {}
    };
    const onUp    = () => { drag = false; };
    const onLeave = () => hover(-1);
    const onMove  = (e: PointerEvent) => {
      if (drag) {
        const dx = e.clientX - lx; lx = e.clientX;
        group.rotation.y += dx * 0.008; vel = dx * 0.008;
      }
      const b = dom.getBoundingClientRect();
      mp.set(
        ((e.clientX - b.left) / b.width)  *  2 - 1,
       -((e.clientY - b.top)  / b.height) *  2 + 1,
      );
      ray.setFromCamera(mp, cam);
      const hit  = ray.intersectObjects(meshes)[0];
      const idx  = hit ? (hit.object as SegMesh).userData.i : -1;
      if (idx !== activeRef.current) hover(idx);
    };

    dom.addEventListener("pointerdown",  onDown);
    dom.addEventListener("pointerup",    onUp);
    dom.addEventListener("pointerleave", onLeave);
    dom.addEventListener("pointermove",  onMove);

    /* ── resize ── */
    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h, false);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    /* ── replay ── */
    let t0 = performance.now();
    replayRef.current = () => { t0 = performance.now(); group.rotation.y = 0; vel = 0; };

    /* ── render loop ── */
    let rafId: number;
    const loop = (now: number) => {
      const t = (now - t0) / 1000;

      meshes.forEach(m => {
        const u = m.userData;
        const p = reduced ? 1 : Math.min(Math.max((t - 0.05 - u.i * 0.1) / 1.4, 0), 1);
        const k = 1 - easeO(p);

        u.pop += ((activeRef.current === u.i ? 1 : 0) - u.pop) * 0.12;
        m.position.copy(u.dir).multiplyScalar(u.pop * 0.32);
        m.position.y = u.pop * 0.2;

        m.rotation.y = k * PI * 3;
        m.position.addScaledVector(u.dir, k * 5);
        m.scale.y = Math.max(0.001, easeO(p));
        m.material.emissiveIntensity = 0.12 + u.pop * 0.35;
      });

      if (!drag) {
        vel *= 0.94;
        group.rotation.y += vel + (activeRef.current < 0 && !reduced && t > 2.2 ? 0.0016 : 0);
      }
      particles.rotation.y = t * 0.02;
      renderer.render(scene, cam);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      dom.removeEventListener("pointerdown",  onDown);
      dom.removeEventListener("pointerup",    onUp);
      dom.removeEventListener("pointerleave", onLeave);
      dom.removeEventListener("pointermove",  onMove);
      meshes.forEach(m => { m.geometry.dispose(); m.material.dispose(); });
      baseDisc.geometry.dispose();
      (baseDisc.material as THREE.MeshPhysicalMaterial).dispose();
      pg.dispose();
      (particles.material as THREE.PointsMaterial).dispose();
      renderer.dispose();
      if (dom.parentNode === el) el.removeChild(dom);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const d = active >= 0 ? DATA[active] : null;

  return (
    <section className="bg-[#020504] px-4 py-6 text-slate-100 sm:px-6 lg:px-10 xl:px-14">
      <div className="mx-auto w-full">

        {/* Grid: chart left, legend right */}
        <div className="grid items-center gap-8 lg:grid-cols-[1.25fr_1fr]">

          {/* ── 3D canvas ── */}
          <div className="relative mx-auto aspect-square w-full max-w-[480px] touch-pan-y">
            <div
              ref={mountRef}
              className="h-full w-full"
              aria-label="Interactive 3D IBO token allocation chart"
            />

            {/* Centre overlay */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <b
                className="font-display text-3xl font-normal transition-colors duration-300 sm:text-4xl"
                style={{ color: d ? d.color : "#ffffff" }}
              >
                {d ? `${d.pct}%` : "46M"}
              </b>
              <span className="mt-1 max-w-[14ch] text-xs text-slate-400">
                {d ? d.name : "total supply"}
              </span>
            </div>

            {/* Replay button */}
            <button
              onClick={() => replayRef.current()}
              className="absolute bottom-2 right-2 rounded-full border border-dashed border-white/20 px-4 py-1.5 text-xs text-slate-300 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2EE5A8]"
            >
              Replay
            </button>
          </div>

          {/* ── Legend ── */}
          <ul className="w-full">
            {DATA.map((row, i) => (
              <li
                key={row.name}
                tabIndex={0}
                onMouseEnter={() => hover(i)}
                onMouseLeave={() => hover(-1)}
                onFocus={() => hover(i)}
                onBlur={() => hover(-1)}
                className={[
                  "grid cursor-pointer grid-cols-[12px_1fr_auto] items-center gap-x-3",
                  "rounded-xl border-t border-white/10 px-2 py-2 transition duration-200",
                  "last:border-b focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2EE5A8]",
                  active === i ? "translate-x-1.5 bg-white/5" : "hover:bg-white/[0.03]",
                ].join(" ")}
              >
                {/* Colour dot */}
                <i
                  className="row-span-2 h-2.5 w-2.5 rounded-full not-italic"
                  style={{ background: row.color, boxShadow: `0 0 14px ${row.color}` }}
                />
                {/* Name */}
                <strong className="truncate text-xs font-semibold">{row.name}</strong>
                {/* Percentage */}
                <em
                  className="row-span-2 col-start-3 font-display text-xl not-italic"
                  style={{ color: active === i ? row.color : undefined }}
                >
                  {row.pct.toFixed(2)}%
                </em>
                {/* Token count */}
                <small className="col-start-2 text-xs text-slate-400">
                  {fmt(row.tokens)} IBO
                </small>
              </li>
            ))}

            {/* Total row */}
            <li className="grid grid-cols-[12px_1fr_auto] items-center gap-x-3 px-2 pt-3">
              <span />
              <strong className="text-xs font-semibold text-slate-300">Total</strong>
              <em className="font-display text-xl not-italic">100%</em>
              <span />
              <small className="text-xs text-slate-400">{fmt(TOTAL_SUPPLY)} IBO</small>
            </li>
          </ul>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Drag to rotate · hover a segment to inspect
        </p>
      </div>
    </section>
  );
}
