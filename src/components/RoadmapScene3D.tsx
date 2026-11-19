/**
 * RoadmapScene3D.tsx
 * ─────────────────────────────────────────────────────────────
 * Full-screen Three.js 3-D roadmap scene.
 * Converted from the reference to fully-typed React + TypeScript.
 * Uses the project's real roadmap data from data/content.ts.
 *
 * Features:
 *  • Curved glowing path connecting 4 floating islands
 *  • Phase card planes (canvas texture) float above each island
 *  • Spinning IBO coin + orbiting mini-coins
 *  • Rocket with animated flame
 *  • Starfield background + distant planet
 *  • Auto-tour cycles through phases every 4.2 s
 *  • Click phase buttons or use ‹ › arrows to navigate manually
 *  • Mouse parallax camera drift
 *  • Fully responsive via ResizeObserver
 */

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { roadmap, roadmapStatus } from "../data/content";

/* ── path control points (one per phase) ── */
const PTS = [
  [-12, -3,  2],
  [ -4, -1, -2],
  [  4,  1.5, 2],
  [ 12,  4,  -1],
].map(a => new THREE.Vector3(a[0], a[1], a[2]));

/* ── round-rect helper ── */
function roundRect(
  c: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y,     x + w, y + h, r);
  c.arcTo(x + w, y + h, x,     y + h, r);
  c.arcTo(x,     y + h, x,     y,     r);
  c.arcTo(x,     y,     x + w, y,     r);
  c.closePath();
}

/* ── card canvas texture ── */
function makeCardTex(phase: string, title: string, status: string, icon: string, items: readonly string[]) {
  const cv = document.createElement("canvas");
  cv.width = 560; cv.height = 500;
  const c = cv.getContext("2d")!;

  /* card background */
  roundRect(c, 10, 30, 540, 460, 34);
  c.fillStyle = "rgba(2,5,4,.88)"; c.fill();
  c.lineWidth = 3; c.strokeStyle = "rgba(46,229,168,.8)"; c.stroke();

  /* phase badge */
  roundRect(c, 150, 6, 260, 54, 27);
  c.fillStyle = "#1aad7e"; c.fill();
  c.fillStyle = "#fff"; c.textAlign = "center";
  c.font = "bold 28px 'Space Grotesk',sans-serif";
  c.fillText(phase, 280, 43);

  /* icon */
  c.font = "80px sans-serif"; c.fillText(icon, 280, 148);

  /* title */
  c.font = "bold 32px 'Space Grotesk',sans-serif"; c.fillText(title, 280, 210);

  /* status pill */
  roundRect(c, 165, 226, 230, 36, 18);
  c.fillStyle = status === "done"   ? "#1aad7e" :
                status === "active" ? "#2ee5a8" :
                                       "rgba(46,229,168,.4)";
  c.fill();
  c.fillStyle = "#fff"; c.font = "bold 20px sans-serif";
  const label = status === "done" ? "Completed" : status === "active" ? "In Progress" : "Upcoming";
  c.fillText(label, 280, 251);

  /* items */
  c.textAlign = "left"; c.font = "23px sans-serif";
  items.forEach((s, k) => {
    c.fillStyle = "#2ee5a8"; c.fillText("✔", 55, 308 + k * 44);
    c.fillStyle = "#fff";     c.fillText(s,   95, 308 + k * 44);
  });

  const t = new THREE.CanvasTexture(cv);
  (t as any).encoding = (THREE as any).sRGBEncoding ?? 3001;
  return t;
}

/* ── coin face texture ── */
function makeCoinTex() {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 256;
  const c = cv.getContext("2d")!;
  const g = c.createRadialGradient(128, 128, 20, 128, 128, 128);
  g.addColorStop(0, "#adfde3"); g.addColorStop(1, "#1aad7e");
  c.fillStyle = g; c.fillRect(0, 0, 256, 256);
  c.strokeStyle = "#0d7a58"; c.lineWidth = 10;
  c.beginPath(); c.arc(128, 128, 108, 0, Math.PI * 2); c.stroke();
  c.fillStyle = "#020504";
  c.font = "bold 72px 'Space Grotesk',sans-serif";
  c.textAlign = "center"; c.textBaseline = "middle";
  c.fillText("IBO", 128, 140);
  const t = new THREE.CanvasTexture(cv);
  (t as any).encoding = (THREE as any).sRGBEncoding ?? 3001;
  return t;
}

/* ── icons per phase ── */
const ICONS = ["🪙", "🔗", "💧", "🏆"];

/* ═══════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════ */
export default function RoadmapScene3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef<number>(-1);
  const [focus, setFocus] = useState<number>(-1);
  const [auto,  setAuto]  = useState<boolean>(true);

  const go = (i: number) => { focusRef.current = i; setFocus(i); };
  const manual = (i: number) => { setAuto(false); go(i); };

  /* ── auto-tour ── */
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => go(focusRef.current >= 3 ? -1 : focusRef.current + 1), 4200);
    return () => clearInterval(id);
  }, [auto]);

  /* ── Three.js scene ── */
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const W = () => mount.clientWidth;
    const H = () => mount.clientHeight;

    /* renderer */
    const ren = new THREE.WebGLRenderer({ antialias: true });
    ren.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    ren.setSize(W(), H());
    ren.setClearColor(0x020504);
    mount.appendChild(ren.domElement);

    /* scene + camera */
    const scene = new THREE.Scene();
    scene.fog   = new THREE.FogExp2(0x020504, 0.012);
    const cam   = new THREE.PerspectiveCamera(55, W() / H(), 0.1, 300);
    cam.position.set(0, 6, 30);

    /* lights */
    scene.add(new THREE.AmbientLight(0x2ee5a8, 0.5));
    const dl = new THREE.DirectionalLight(0xffffff, 0.9);
    dl.position.set(5, 10, 8); scene.add(dl);

    /* stars */
    const sp: number[] = [];
    for (let i = 0; i < 1500; i++) {
      sp.push(
        (Math.random() - 0.5) * 160,
        (Math.random() - 0.5) * 90,
        -Math.random() * 80 - 5,
      );
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    const stars = new THREE.Points(sg,
      new THREE.PointsMaterial({ color: 0x2ee5a8, size: 0.25, transparent: true, opacity: 0.8 }),
    );
    scene.add(stars);

    /* distant planet */
    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(14, 48, 48),
      new THREE.MeshStandardMaterial({ color: 0x0a1a14, emissive: 0x1aad7e, emissiveIntensity: 0.08, roughness: 0.8 }),
    );
    planet.position.set(10, 12, -45); scene.add(planet);

    /* glowing path */
    const curve = new THREE.CatmullRomCurve3(PTS);
    scene.add(new THREE.Mesh(
      new THREE.TubeGeometry(curve, 120, 0.28, 12, false),
      new THREE.MeshBasicMaterial({ color: 0x1aad7e }),
    ));
    scene.add(new THREE.Mesh(
      new THREE.TubeGeometry(curve, 120, 0.6, 12, false),
      new THREE.MeshBasicMaterial({ color: 0x2ee5a8, transparent: true, opacity: 0.18 }),
    ));

    /* flow dots on path */
    const flow = Array.from({ length: 14 }, (_, i) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
      );
      scene.add(m);
      return { m, o: i / 14 };
    });

    /* islands + floating card planes */
    type PlatData = {
      g:    THREE.Group;
      ring: THREE.Mesh;
      orb:  THREE.Mesh;
    };
    const cards:  THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] = [];
    const plats:  PlatData[] = [];

    roadmap.forEach((ph, i) => {
      const status = roadmapStatus[ph.phase] ?? "upcoming";

      /* island group */
      const g = new THREE.Group();
      g.position.copy(PTS[i]); scene.add(g);

      const top = new THREE.Mesh(
        new THREE.CylinderGeometry(2.3, 2.5, 0.5, 32),
        new THREE.MeshStandardMaterial({ color: 0x0a1a14, metalness: 0.6, roughness: 0.4 }),
      );
      top.position.y = -0.3;

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(2.1, 0.08, 8, 48),
        new THREE.MeshBasicMaterial({ color: 0x2ee5a8 }),
      );
      ring.rotation.x = Math.PI / 2;

      const rock = new THREE.Mesh(
        new THREE.ConeGeometry(2.4, 3.6, 7),
        new THREE.MeshStandardMaterial({ color: 0x0a1a14, flatShading: true }),
      );
      rock.rotation.x = Math.PI; rock.position.y = -2.4;

      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x2ee5a8 }),
      );
      orb.position.y = 0.4;

      const pl = new THREE.PointLight(0x2ee5a8, 1.2, 12);
      pl.position.y = 2;

      g.add(top, ring, rock, orb, pl);

      /* card plane */
      const card = new THREE.Mesh(
        new THREE.PlaneGeometry(5, 4.46),
        new THREE.MeshBasicMaterial({
          map: makeCardTex(ph.phase, ph.title, status, ICONS[i], ph.items),
          transparent: true,
        }),
      );
      scene.add(card);
      cards.push(card);
      plats.push({ g, ring, orb });
    });

    /* IBO coin */
    const coinTex = makeCoinTex();
    const goldMat = new THREE.MeshStandardMaterial({ color: 0x2ee5a8, metalness: 0.8, roughness: 0.2 });
    const faceMat = new THREE.MeshStandardMaterial({ map: coinTex, metalness: 0.6, roughness: 0.4 });

    const makeCoin = (r: number) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, r * 0.2, 48), [goldMat, faceMat, faceMat]);
      m.rotation.x = Math.PI / 2;
      const gr = new THREE.Group(); gr.add(m); return gr;
    };

    const big = makeCoin(1.5); scene.add(big);

    type MiniCoin = { c: THREE.Group; a: number; r: number; h: number };
    const mini: MiniCoin[] = Array.from({ length: 4 }, (_, i) => {
      const c = makeCoin(0.45); scene.add(c);
      return { c, a: i * 1.6, r: 6 + i * 2.5, h: -1 + i * 2 };
    });

    /* rocket */
    const rocket = new THREE.Group();
    const body  = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.6, 16), new THREE.MeshStandardMaterial({ color: 0xf2f2ff }));
    const nose  = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.7, 16), new THREE.MeshStandardMaterial({ color: 0x2ee5a8 }));
    nose.position.y = 1.15;
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.4, 12), new THREE.MeshBasicMaterial({ color: 0xffa03c }));
    flame.rotation.x = Math.PI; flame.position.y = -1.4;
    rocket.add(body, nose, flame); scene.add(rocket);

    /* camera state */
    const look = new THREE.Vector3(0, 1, 0);
    const tp   = new THREE.Vector3();
    const tl   = new THREE.Vector3();
    const tmpV = new THREE.Vector3();
    let pmx = 0, pmy = 0;

    const onMove = (e: PointerEvent) => {
      pmx = e.clientX / window.innerWidth  - 0.5;
      pmy = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    /* resize */
    const ro = new ResizeObserver(() => {
      cam.aspect = W() / H();
      cam.updateProjectionMatrix();
      ren.setSize(W(), H());
    });
    ro.observe(mount);

    /* loop */
    const clock = new THREE.Clock();
    let rafId: number;

    const loop = () => {
      rafId = requestAnimationFrame(loop);
      const t = clock.getElapsedTime();
      const f = focusRef.current;
      const wide = W() / H() < 1 ? 1.5 : 1;

      /* camera target */
      if (f < 0) {
        tp.set(0, 5, 24 * wide);
        tl.set(0, 1, 0);
      } else {
        const p = PTS[f];
        tp.set(p.x + (f - 1.5) * 0.5, p.y + 3, p.z + 9.5 * wide);
        tl.set(p.x, p.y + 3, p.z);
      }
      tp.x += pmx * 3; tp.y -= pmy * 2;
      cam.position.lerp(tp, 0.04);
      look.lerp(tl, 0.06);
      cam.lookAt(look);

      /* cards */
      cards.forEach((c, i) => {
        const isActive = f < 0 || f === i;
        const s = isActive ? 1 : 0.8;
        c.quaternion.copy(cam.quaternion);
        c.scale.lerp(tmpV.set(s, s, s), 0.08);
        c.material.opacity = isActive ? 1 : 0.55;
        c.position.set(PTS[i].x, PTS[i].y + 4 + Math.sin(t * 1.2 + i) * 0.15, PTS[i].z);
      });

      /* islands */
      plats.forEach((pl, i) => {
        pl.g.position.y = PTS[i].y + Math.sin(t * 1.1 + i * 1.3) * 0.15;
        pl.ring.rotation.z = t * 0.6;
        pl.orb.scale.setScalar(1 + Math.sin(t * 3 + i) * 0.2);
      });

      /* path flow dots */
      flow.forEach(x => {
        x.m.position.copy(curve.getPoint((x.o + t * 0.06) % 1));
        x.m.position.y += 0.05;
      });

      /* big coin */
      big.rotation.y = t * 1.4;
      big.position.set(PTS[0].x - 3.6, PTS[0].y + 1.6 + Math.sin(t * 1.5) * 0.25, PTS[0].z + 0.5);

      /* mini coins */
      mini.forEach(mc => {
        mc.a += 0.004;
        mc.c.position.set(
          Math.cos(mc.a) * mc.r,
          mc.h + Math.sin(t + mc.a) * 0.5,
          Math.sin(mc.a) * mc.r * 0.5 - 4,
        );
        mc.c.rotation.y = t * 2;
      });

      /* rocket */
      rocket.position.set(PTS[3].x + 3.2 + Math.sin(t * 0.8) * 1.5, PTS[3].y + 6 + Math.sin(t * 1.3), PTS[3].z - 1);
      rocket.rotation.z = -0.8;
      flame.scale.y = 0.8 + Math.random() * 0.5;

      planet.rotation.y = t * 0.02;
      stars.rotation.z  = t * 0.004;

      ren.render(scene, cam);
    };
    loop();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onMove);
      ro.disconnect();
      scene.traverse((o: any) => {
        o.geometry?.dispose();
        ([] as THREE.Material[]).concat(o.material ?? []).forEach((m: any) => {
          m.map?.dispose(); m.dispose();
        });
      });
      ren.dispose();
      if (ren.domElement.parentNode === mount) mount.removeChild(ren.domElement);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── UI ── */
  const btnBase =
    "rounded-full border border-[#2EE5A8]/50 bg-[#2EE5A8]/25 px-3 py-1.5 text-sm text-white transition hover:bg-[#1aad7e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2EE5A8]";

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#020504] font-sans text-white">

      {/* 3D canvas */}
      <div ref={mountRef} className="absolute inset-0" />

      {/* HUD — top left */}
      <div className="pointer-events-none absolute left-4 top-4 sm:left-6 sm:top-5">
        <span className="inline-block rounded-full border border-[#2EE5A8]/40 bg-[#2EE5A8]/20 px-3.5 py-1 text-xs sm:text-sm">
          ● Our Journey
        </span>
        <h1 className="mt-2 text-3xl font-extrabold leading-none tracking-tight sm:text-5xl lg:text-6xl">
          IBO Token
          <span className="block bg-gradient-to-r from-[#2EE5A8] to-[#1aad7e] bg-clip-text italic text-transparent">
            Roadmap
          </span>
        </h1>
        <p className="mt-1 text-xs opacity-75 sm:text-sm">
          Ecosystem on BNB Smart Chain.
        </p>
      </div>

      {/* HUD — bottom right (desktop only) */}
      <div className="pointer-events-none absolute bottom-24 right-5 hidden text-right text-sm opacity-80 sm:block">
        Together, we're shaping
        <br />a <b className="text-[#2EE5A8]">decentralized</b> future.
      </div>

      {/* Controls bar */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-[#2EE5A8]/35 bg-[#020504]/75 px-2.5 py-2 backdrop-blur-sm sm:gap-2 sm:px-3">

        {/* Prev */}
        <button
          className={btnBase}
          onClick={() => manual(focus <= 0 ? 3 : focus - 1)}
          aria-label="Previous phase"
        >‹</button>

        {/* Phase buttons */}
        {roadmap.map((_, i) => (
          <button
            key={i}
            className={`${btnBase} ${focus === i ? "!bg-[#1aad7e]" : ""}`}
            onClick={() => manual(i)}
            aria-label={`Phase ${i + 1}`}
          >
            {i + 1}
          </button>
        ))}

        {/* Next */}
        <button
          className={btnBase}
          onClick={() => manual((focus + 1) % 4)}
          aria-label="Next phase"
        >›</button>

        {/* Auto tour toggle */}
        <button
          className={`${btnBase} ${auto ? "!bg-[#1aad7e]" : ""}`}
          onClick={() => setAuto(a => !a)}
        >
          Auto
        </button>
      </div>
    </div>
  );
}
