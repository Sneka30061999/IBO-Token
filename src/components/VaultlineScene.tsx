/**
 * VaultlineScene.tsx
 * ─────────────────────────────────────────────────────────────
 * Vaultline-style 3D background scene converted from vanilla JS
 * to React + Three.js (already installed).
 *
 * Features:
 *  • Curved tiled track (CatmullRom spline + InstancedMesh)
 *  • IBO coins flying along the track
 *  • Central glowing platform with animated blob + torus rings
 *  • Three portal torus rings that flash as coins pass through
 *  • Floating dust particles
 *  • UnrealBloom post-processing
 *  • Pointer parallax (desktop)
 *  • Responsive resize via ResizeObserver
 *  • prefers-reduced-motion respected
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";

/* ── coin symbols on the texture ── */
const COIN_SYMBOLS = ["IBO", "IBO", "IBO", "IBO", "IBO", "IBO"];

const BG = 0x020504;

/* ── coin face canvas texture ── */
function makeCoinTex(sym: string): THREE.CanvasTexture {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 256;
  const g = cv.getContext("2d")!;

  const grad = g.createRadialGradient(100, 90, 10, 128, 128, 128);
  grad.addColorStop(0, "#3a3350");
  grad.addColorStop(1, "#0c0913");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);

  g.strokeStyle = "rgba(226,214,255,.85)"; g.lineWidth = 9;
  g.beginPath(); g.arc(128, 128, 98, 0, Math.PI * 2); g.stroke();

  g.strokeStyle = "rgba(226,214,255,.25)"; g.lineWidth = 3;
  g.beginPath(); g.arc(128, 128, 112, 0, Math.PI * 2); g.stroke();

  g.fillStyle = "rgba(240,232,255,.95)";
  g.font = `600 ${sym.length > 2 ? 68 : 110}px 'Space Grotesk','Inter',system-ui,sans-serif`;
  g.textAlign    = "center";
  g.textBaseline = "middle";
  g.fillText(sym, 128, 136);

  const t = new THREE.CanvasTexture(cv);
  (t as any).encoding = (THREE as any).sRGBEncoding ?? 3001;
  t.anisotropy = 4;
  return t;
}

/* ── dispose helpers ── */
function disposeObj(o: THREE.Object3D) {
  o.traverse((c: any) => {
    if (c.geometry) c.geometry.dispose();
    const ms = c.material ? (Array.isArray(c.material) ? c.material : [c.material]) : [];
    for (const m of ms) { if (m.map) m.map.dispose(); m.dispose(); }
  });
}

export default function VaultlineScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    /* ── renderer ── */
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas, antialias: true, powerPreference: "high-performance",
      });
    } catch { return; }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(BG, 1);
    (renderer as any).outputEncoding  = (THREE as any).sRGBEncoding ?? 3001;
    (renderer as any).toneMapping     = (THREE as any).ACESFilmicToneMapping ?? 4;
    renderer.toneMappingExposure      = 1.1;

    /* ── scene ── */
    const scene = new THREE.Scene();
    scene.fog   = new THREE.Fog(BG, 15, 30);

    /* ── camera ── */
    const camera = new THREE.PerspectiveCamera(35, 1.6, 0.1, 100);
    camera.position.set(0, 0, 16);

    /* ── pivot for parallax / layout ── */
    const pivot = new THREE.Group();
    const world = new THREE.Group();
    pivot.add(world);
    scene.add(pivot);

    /* ── lights ── */
    scene.add(new THREE.HemisphereLight(0x8d7bc0, 0x120a1e, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(-4, 6, 7); scene.add(key);
    const rim = new THREE.DirectionalLight(0xa855ff, 0.9); rim.position.set(5, -3, 4); scene.add(rim);

    /* ── spline path ── */
    const pathPts: THREE.Vector3[] = [
      [-0.6, 7.2, -2.5], [-3.4, 5.0, -1.6], [-2.6, 2.9, -0.6],
      [0.2, 1.9, 0.3],   [1.9, 0.5, 0.9],   [2.5, -1.7, 1.4],
      [3.1, -3.7, 1.9],  [4.6, -6.0, 2.6],  [6.4, -8.4, 3.2],
    ].map(p => new THREE.Vector3(p[0], p[1], p[2]));

    const curve    = new THREE.CatmullRomCurve3(pathPts, false, "catmullrom", 0.5);
    const curveLen = curve.getLength();
    const REF      = new THREE.Vector3(0.3, 0.5, 1).normalize();

    function frameAt(u: number) {
      const p  = curve.getPointAt(u);
      const T  = curve.getTangentAt(u);
      const side = new THREE.Vector3().crossVectors(T, REF).normalize();
      const nrm  = new THREE.Vector3().crossVectors(side, T).normalize();
      if (nrm.dot(REF) < 0) { nrm.negate(); side.negate(); }
      return { p, T, side, nrm };
    }

    /* ── tiled track ── */
    {
      const STEP = 0.42, COLS = 7, TW = 0.36;
      const rows = Math.floor(curveLen / STEP);
      let count  = rows * COLS;

      const geo  = new THREE.BoxGeometry(1, 1, 1);
      const mat  = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.45, roughness: 0.6 });
      const mesh = new THREE.InstancedMesh(geo, mat, count);
      mesh.count = 0;

      const m   = new THREE.Matrix4();
      const q   = new THREE.Quaternion();
      const s   = new THREE.Vector3();
      const pos = new THREE.Vector3();
      const col = new THREE.Color();
      const zd  = new THREE.Vector3();

      for (let r = 0; r < rows; r++) {
        const u = (r + 0.5) / rows;
        const f = frameAt(u);
        zd.copy(f.T).negate();
        m.makeBasis(f.side, f.nrm, zd);
        q.setFromRotationMatrix(m);

        for (let c = 0; c < COLS; c++) {
          const edge = c === 0 || c === COLS - 1;
          if (edge && Math.random() < 0.35) continue;
          const off = (c - (COLS - 1) / 2) * (TW + 0.05);
          const h   = 0.08 + Math.random() * 0.14;
          pos.copy(f.p).addScaledVector(f.side, off).addScaledVector(f.nrm, -h * 0.5 - Math.random() * 0.03);
          s.set(TW, h, STEP * 0.86);
          m.compose(pos, q, s);
          mesh.setMatrixAt(mesh.count, m);
          const v = 0.07 + Math.random() * 0.08;
          col.setRGB(v * 0.95, v * 0.85, v * 1.35);
          mesh.setColorAt(mesh.count, col);
          mesh.count++;
        }
      }

      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      world.add(mesh);
    }

    /* ── platform (closest point to pts[4]) ── */
    let platformU = 0.5, bestD = 1e9;
    for (let i = 0; i <= 400; i++) {
      const d = curve.getPointAt(i / 400).distanceTo(pathPts[4]);
      if (d < bestD) { bestD = d; platformU = i / 400; }
    }

    const platform = new THREE.Group();
    platform.position.copy(pathPts[4]).add(new THREE.Vector3(0, -0.2, -0.2));
    platform.rotation.x = -1.1;
    world.add(platform);

    const platRingMat = new THREE.MeshBasicMaterial({ color: 0x2ee5a8 });
    platform.add(new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.055, 16, 120), platRingMat));
    platform.add(new THREE.Mesh(
      new THREE.TorusGeometry(2.25, 0.012, 8, 120),
      new THREE.MeshBasicMaterial({ color: 0x1aad7e, transparent: true, opacity: 0.55 }),
    ));

    /* animated blob */
    const BLOB_SEG = 72;
    const blobGeo  = new THREE.CircleGeometry(1.5, BLOB_SEG);
    const blobBase = Float32Array.from(blobGeo.attributes.position.array as Float32Array);
    const blobCols = new Float32Array(blobGeo.attributes.position.count * 3);
    blobGeo.setAttribute("color", new THREE.BufferAttribute(blobCols, 3));
    const blob = new THREE.Mesh(blobGeo, new THREE.MeshBasicMaterial({ vertexColors: true }));
    platform.add(blob);

    const cPurple = new THREE.Color(0x1aad7e);
    const cWhite  = new THREE.Color(0xf4ecff);
    const tmpC    = new THREE.Color();
    // initial colour pass
    for (let i = 0; i < blobGeo.attributes.position.count; i++) {
      const x    = blobGeo.attributes.position.getX(i) / 1.5;
      const y    = blobGeo.attributes.position.getY(i) / 1.5;
      const dist = Math.sqrt(x * x + y * y);
      let t = Math.max(0, Math.min(1, 1.05 - dist * 0.95 + (-x * 0.28) + y * 0.12));
      t = t * t * (3 - 2 * t);
      tmpC.copy(cPurple).lerp(cWhite, t);
      blobCols[i * 3] = tmpC.r; blobCols[i * 3 + 1] = tmpC.g; blobCols[i * 3 + 2] = tmpC.b;
    }
    blobGeo.attributes.color.needsUpdate = true;

    function wobbleBlob(t: number) {
      const pa = blobGeo.attributes.position;
      for (let i = 0; i < pa.count; i++) {
        const bx = blobBase[i * 3], by = blobBase[i * 3 + 1];
        const r  = Math.sqrt(bx * bx + by * by);
        if (r < 0.001) continue;
        const a = Math.atan2(by, bx);
        const k = 1
          + 0.11 * Math.sin(3 * a + t * 1.1)
          + 0.07 * Math.sin(5 * a - t * 1.6)
          + 0.04 * Math.sin(2 * a + t * 0.7);
        pa.setXY(i, bx * k, by * k);
      }
      pa.needsUpdate = true;
    }

    const platLight = new THREE.PointLight(0xa24bff, 3, 9, 1.6);
    platLight.position.copy(pathPts[4]).add(new THREE.Vector3(0, 0.4, 2));
    world.add(platLight);

    /* ── portal rings ── */
    type RingObj = { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; u: number };
    const rings: RingObj[] = [];
    [0.1, 0.21, 0.33].forEach(du => {
      const u   = Math.min(0.95, platformU + du);
      const f   = frameAt(u);
      const mat = new THREE.MeshBasicMaterial({ color: 0x2ee5a8 });
      const mesh = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.075, 20, 80), mat);
      const axis = new THREE.Vector3().copy(REF).multiplyScalar(0.8).addScaledVector(f.T, 0.6).normalize();
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), axis);
      mesh.position.copy(f.p).addScaledVector(f.nrm, 0.5);
      world.add(mesh);
      rings.push({ mesh, mat, u });
    });

    /* ── coins ── */
    const coinGeo  = new THREE.CylinderGeometry(0.55, 0.55, 0.14, 56);
    const edgeMat  = new THREE.MeshStandardMaterial({ color: 0x2b2538, metalness: 0.85, roughness: 0.3 });
    const faceMats = COIN_SYMBOLS.map(sym => new THREE.MeshStandardMaterial({
      map: makeCoinTex(sym), metalness: 0.55, roughness: 0.38,
    }));

    type CoinObj = { mesh: THREE.Mesh; phase: number; wob: number };
    const COIN_COUNT = 7;
    const coins: CoinObj[] = [];
    for (let k = 0; k < COIN_COUNT; k++) {
      const fm   = faceMats[k % faceMats.length];
      const mesh = new THREE.Mesh(coinGeo, [edgeMat, fm, fm]);
      world.add(mesh);
      coins.push({ mesh, phase: k / COIN_COUNT, wob: Math.random() * 6.28 });
    }

    const Y   = new THREE.Vector3(0, 1, 0);
    const X   = new THREE.Vector3(1, 0, 0);
    const q0  = new THREE.Quaternion().setFromUnitVectors(Y, new THREE.Vector3(0.18, 0.1, 1).normalize());
    const qa  = new THREE.Quaternion();
    const qb  = new THREE.Quaternion();

    /* ── dust ── */
    const dp = new Float32Array(180 * 3);
    for (let j = 0; j < 180; j++) {
      dp[j * 3]     = (Math.random() - 0.5) * 22;
      dp[j * 3 + 1] = (Math.random() - 0.5) * 16;
      dp[j * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dp, 3));
    const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
      size: 0.045, color: 0xc9a0ff, transparent: true, opacity: 0.55,
      depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    scene.add(dust);

    /* ── bloom post-processing ── */
    let composer: any = null;
    try {
      const EC = (THREE as any).EffectComposer;
      const RP = (THREE as any).RenderPass;
      const BP = (THREE as any).UnrealBloomPass;
      if (EC && RP && BP) {
        composer = new EC(renderer);
        composer.addPass(new RP(scene, camera));
        const bloom = new BP(new THREE.Vector2(512, 512), 0.95, 0.65, 0.12);
        composer.addPass(bloom);
      }
    } catch { /* bloom unavailable */ }

    /* ── layout / resize — size to canvas container, not window ── */
    const VIS_H = 2 * 16 * Math.tan(THREE.MathUtils.degToRad(17.5));

    function layout() {
      const el   = canvasRef.current?.parentElement;
      const rect = el?.getBoundingClientRect();
      const w = Math.max(1, rect?.width  ?? window.innerWidth);
      const h = Math.max(1, rect?.height ?? window.innerHeight);
      const a = w / h;
      renderer.setSize(w, h, false);
      if (composer) composer.setSize(w, h);
      camera.aspect = a;
      camera.updateProjectionMatrix();
      const visW = VIS_H * a;
      if (a > 1.1) {
        pivot.position.set(visW * 0.15, 0, 0);
        pivot.scale.setScalar(Math.min(0.82, 0.58 + a * 0.12));
      } else {
        pivot.position.set(visW * 0.06, 1.4, 0);
        pivot.scale.setScalar(Math.max(0.5, 0.42 + a * 0.2));
      }
    }

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(canvas);

    /* ── pointer parallax — relative to hero section ── */
    let mx = 0, my = 0, px = 0, py = 0;
    const onPointer = (e: PointerEvent) => {
      const el   = canvasRef.current?.parentElement;
      const rect = el?.getBoundingClientRect();
      if (!rect) return;
      mx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
      my = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    /* ── animation loop ── */
    const ringBase = new THREE.Color(0x2ee5a8);
    const ringHot  = new THREE.Color(0xd4f5eb);
    const platBase = new THREE.Color(0x2ee5a8);

    function ss(a: number, b: number, x: number) {
      x = Math.max(0, Math.min(1, (x - a) / (b - a)));
      return x * x * (3 - 2 * x);
    }

    let time = 0;
    const SPEED = 0.055;
    const clock  = new THREE.Clock();

    const frame = () => {
      rafRef.current = requestAnimationFrame(frame);
      const dt = Math.min(clock.getDelta(), 0.05);
      time += dt * (reduced ? 0.25 : 1);

      let pulsePlat = 0;
      const ringPulse = rings.map(() => 0);

      coins.forEach(c => {
        const u  = (time * SPEED + c.phase) % 1;
        const f  = frameAt(u);

        c.mesh.position.copy(f.p).addScaledVector(f.nrm, 0.5);
        qa.setFromAxisAngle(Y, Math.sin(time * 1.1 + c.wob) * 1.0);
        qb.setFromAxisAngle(X, Math.sin(time * 0.8 + c.wob * 1.7) * 0.45);
        c.mesh.quaternion.copy(q0).multiply(qa).multiply(qb);

        const sc = ss(0, 0.07, u) * (1 - ss(0.9, 0.99, u));
        c.mesh.scale.setScalar(Math.max(0.0001, sc));

        pulsePlat = Math.max(pulsePlat, Math.exp(-Math.pow((u - platformU) / 0.025, 2)));
        rings.forEach((r, i) => {
          ringPulse[i] = Math.max(ringPulse[i], Math.exp(-Math.pow((u - r.u) / 0.022, 2)));
        });
      });

      rings.forEach((r, i) => {
        r.mat.color.copy(ringBase).lerp(ringHot, ringPulse[i] * 0.8).multiplyScalar(1 + ringPulse[i] * 0.9);
        r.mesh.scale.setScalar(1 + ringPulse[i] * 0.06);
      });

      platRingMat.color.copy(platBase).multiplyScalar(1 + pulsePlat * 0.7);
      platLight.intensity = 3 + pulsePlat * 4;

      wobbleBlob(time);
      platform.rotation.z = Math.sin(time * 0.4) * 0.05;

      px += (mx - px) * 0.04;
      py += (my - py) * 0.04;
      pivot.rotation.y = -0.16 + px * 0.1;
      pivot.rotation.x = py * 0.05;

      dust.rotation.y = time * 0.01;

      if (composer) composer.render();
      else renderer.render(scene, camera);
    };

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("pointermove", onPointer);
      ro.disconnect();
      disposeObj(world);
      dustGeo.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
