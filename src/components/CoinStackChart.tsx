/**
 * CoinStackChart.tsx — Premium 3D Coin Stack Tokenomics
 * Full-width, tall canvas. Coins are large and clearly readable.
 * Premium effects: multi-light setup, emissive glow, fog, stars,
 * floor grid, hover bloom, tooltip, drag-to-rotate, touch support.
 */

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { allocations, TOTAL_SUPPLY } from "../data/content";
import { fmt } from "../config/token";

const TAU    = Math.PI * 2;
const SUPPLY = TOTAL_SUPPLY;

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const eOut  = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const eBack = (x: number) => {
  x = clamp(x);
  const c1 = 1.45, c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

function mkRng(seed: number) {
  return () => { seed = (seed * 16807) % 2_147_483_647; return seed / 2_147_483_647; };
}

const rawFracs = allocations.map(a => a.tokens / SUPPLY);
const rawSum   = rawFracs.reduce((a, b) => a + b, 0);
const pcts     = rawFracs.map(f => f / rawSum);

const toLinear = (hex: string) => new THREE.Color(hex).convertSRGBToLinear();

function hexRgba(hex: string, a: number) {
  const c = new THREE.Color(hex);
  return `rgba(${Math.round(c.r*255)},${Math.round(c.g*255)},${Math.round(c.b*255)},${a})`;
}
function lightenHex(hex: string, f: number) {
  return "#" + new THREE.Color(hex).lerp(new THREE.Color("#ffffff"), f).getHexString();
}

function physMat(hex: string, extra: Partial<THREE.MeshPhysicalMaterialParameters> = {}) {
  return new THREE.MeshPhysicalMaterial({
    color: toLinear(hex), metalness: 0.3, roughness: 0.28,
    clearcoat: 1.0, clearcoatRoughness: 0.10,
    emissive: toLinear(hex), emissiveIntensity: 0.18, ...extra,
  });
}

function eachMat(mesh: THREE.Mesh, fn: (m: THREE.MeshPhysicalMaterial) => void) {
  const arr = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  (arr as THREE.MeshPhysicalMaterial[]).forEach(fn);
}

/* ── Coin face texture ── */
function makeCoinFaceTex(hex: string): THREE.CanvasTexture {
  const S = 512;
  const cv = document.createElement("canvas");
  cv.width = cv.height = S;
  const ctx = cv.getContext("2d")!;

  const hi = new THREE.Color(hex).lerp(new THREE.Color("#ffffff"), 0.45).getStyle();
  const bg = ctx.createRadialGradient(S*0.35, S*0.3, 0, S*0.5, S*0.5, S*0.52);
  bg.addColorStop(0, hi);
  bg.addColorStop(0.55, hex);
  bg.addColorStop(1, new THREE.Color(hex).lerp(new THREE.Color("#000000"), 0.3).getStyle());
  ctx.fillStyle = bg;
  ctx.beginPath(); ctx.arc(S/2, S/2, S/2, 0, TAU); ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.75)"; ctx.lineWidth = 10;
  ctx.beginPath(); ctx.arc(S/2, S/2, S*0.44, 0, TAU); ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(S/2, S/2, S*0.37, 0, TAU); ctx.stroke();

  ctx.shadowBlur = 24; ctx.shadowColor = "rgba(255,255,255,0.9)";
  ctx.fillStyle  = "rgba(255,255,255,0.97)";
  ctx.font = `900 ${Math.round(S*0.26)}px 'Space Grotesk','Inter',system-ui,sans-serif`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("IBO", S/2, S*0.47);

  ctx.shadowBlur = 10;
  ctx.fillStyle  = "rgba(255,255,255,0.65)";
  ctx.font = `600 ${Math.round(S*0.1)}px 'Inter',system-ui,sans-serif`;
  ctx.fillText("TOKEN", S/2, S*0.68);

  const t = new THREE.CanvasTexture(cv);
  (t as any).encoding = (THREE as any).sRGBEncoding ?? 3001;
  t.anisotropy = 8;
  return t;
}

const matCache = new Map<number, THREE.Material[]>();
function getCoinMats(idx: number): THREE.Material[] {
  if (matCache.has(idx)) return matCache.get(idx)!;
  const hex  = allocations[idx].color;
  const tex  = makeCoinFaceTex(hex);
  const face = () => new THREE.MeshPhysicalMaterial({
    map: tex, metalness: 0.25, roughness: 0.28, clearcoat: 0.9,
    emissive: toLinear(hex), emissiveIntensity: 0.12,
  });
  const mats = [physMat(hex, { metalness: 0.4, roughness: 0.32 }), face(), face()];
  matCache.set(idx, mats);
  return mats;
}

/* ── Label sprite texture ── */
function makeLabelTex(text: string): THREE.CanvasTexture {
  const W = 2048, H = 512;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d")!;

  /* pill background */
  ctx.fillStyle = "rgba(0,0,8,0.68)";
  ctx.beginPath();
  if (typeof (ctx as any).roundRect === "function") {
    (ctx as any).roundRect(32, 80, W - 64, H - 160, 60);
  } else {
    ctx.rect(32, 80, W - 64, H - 160);
  }
  ctx.fill();

  ctx.textBaseline = "middle"; ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,0,0,1)"; ctx.shadowBlur = 32;
  ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 2;
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 ${Math.round(H*0.52)}px 'Space Grotesk','Inter',system-ui,sans-serif`;
  ctx.fillText(text, W/2, H/2);

  const t = new THREE.CanvasTexture(cv);
  (t as any).encoding = (THREE as any).sRGBEncoding ?? 3001;
  t.anisotropy = 8;
  return t;
}

function makeSprite(text: string, scale = 5.5): THREE.Sprite {
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({
    map: makeLabelTex(text), transparent: true, depthTest: false, depthWrite: false,
  }));
  spr.scale.set(scale, scale / 4, 1);
  spr.renderOrder = 30;
  return spr;
}

function disposeObject(o: THREE.Object3D) {
  o.traverse((c: any) => {
    if (c.geometry) c.geometry.dispose();
    const ms = c.material ? (Array.isArray(c.material) ? c.material : [c.material]) : [];
    for (const m of ms) { if (m.map) m.map.dispose(); m.dispose(); }
  });
}

interface StackItem { mesh: THREE.Mesh; idx: number; j: number; baseY: number; x: number; z: number; hv: number; }

function buildScene() {
  const scene = new THREE.Scene();
  scene.background = toLinear("#020504");
  scene.fog = new THREE.FogExp2(toLinear("#020504"), 0.012);

  const camera = new THREE.PerspectiveCamera(60, 2, 0.1, 300);
  camera.position.set(0, 13, 26);
  camera.lookAt(0, 1, 0);

  scene.add(new THREE.HemisphereLight(toLinear("#b4c8ff"), toLinear("#0d0820"), 0.65));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(8, 14, 10); scene.add(key);
  const rim1 = new THREE.PointLight(toLinear("#7c6cff"), 3.5, 90); rim1.position.set(-12, 6, -8); scene.add(rim1);
  const rim2 = new THREE.PointLight(toLinear("#2dd4bf"), 2.5, 80); rim2.position.set(12, 2, -6); scene.add(rim2);
  const fill = new THREE.PointLight(toLinear("#f472b6"), 1.2, 60); fill.position.set(0, -4, 14); scene.add(fill);
  const underGlow = new THREE.PointLight(toLinear("#4f46e5"), 2.0, 40); underGlow.position.set(0, -2, 0); scene.add(underGlow);

  const grid = new THREE.PolarGridHelper(18, 18, 14, 64, 0x2b3573, 0x1a1f4a) as any;
  if (Array.isArray(grid.material)) {
    grid.material.forEach((m: THREE.Material) => { (m as THREE.LineBasicMaterial).transparent = true; (m as THREE.LineBasicMaterial).opacity = 0.65; });
  } else { grid.material.transparent = true; grid.material.opacity = 0.65; }
  grid.position.y = -4.0;
  scene.add(grid);

  const nS = 900, sp = new Float32Array(nS * 3), sr = mkRng(17);
  for (let i = 0; i < nS; i++) {
    const v = new THREE.Vector3(sr()-0.5, sr()-0.5, sr()-0.5).normalize().multiplyScalar(50 + sr()*50);
    sp.set([v.x, v.y, v.z], i*3);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
    size: 0.26, color: toLinear("#b0c4ff"), transparent: true, opacity: 0.6, sizeAttenuation: true, depthWrite: false,
  }));
  scene.add(stars);

  const stage = new THREE.Group();
  const holder = new THREE.Group();
  stage.add(holder); scene.add(stage);

  const group   = new THREE.Group();
  const r       = mkRng(3);
  const N       = allocations.length;
  const ORBIT_R = 7.0;
  const coinGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.28, 56);
  const cnts    = pcts.map(p => Math.max(2, Math.round(p * 22)));

  const items: StackItem[]          = [];
  const pctSprites:  THREE.Sprite[] = [];
  const nameSprites: THREE.Sprite[] = [];

  allocations.forEach((a, i) => {
    const angle = (i / N) * TAU;
    const sx    = ORBIT_R * Math.cos(angle);
    const sz    = ORBIT_R * Math.sin(angle);
    const mats  = getCoinMats(i);

    for (let j = 0; j < cnts[i]; j++) {
      const mesh = new THREE.Mesh(coinGeo, mats);
      mesh.rotation.y = r() * TAU;
      mesh.position.set(sx, j * 0.32, sz);
      mesh.userData.idx = i;
      group.add(mesh);
      items.push({ mesh, idx: i, j, baseY: j * 0.32, x: sx, z: sz, hv: 0 });
    }

    const pSpr = makeSprite((pcts[i]*100).toFixed(1)+"%", 3.5);
    pSpr.position.set(sx, cnts[i]*0.32 + 1.8, sz);
    pSpr.material.opacity = 0;
    group.add(pSpr); pctSprites.push(pSpr);

    const short = a.name.length > 16 ? a.name.slice(0, 14)+"…" : a.name;
    const nSpr  = makeSprite(short, 4.5);
    nSpr.position.set(sx, -0.3, sz);
    nSpr.material.opacity = 0;
    group.add(nSpr); nameSprites.push(nSpr);
  });

  const heroMats = getCoinMats(0).map(m => (m as THREE.MeshPhysicalMaterial).clone());
  const hero     = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 0.44, 72), heroMats);
  hero.rotation.x = Math.PI / 2;
  const ringGeo  = new THREE.TorusGeometry(2.15, 0.07, 16, 100);
  const ringMat  = new THREE.MeshStandardMaterial({ color: toLinear("#c084fc"), emissive: toLinear("#a855f7"), emissiveIntensity: 2.0 });
  const ring     = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  const heroWrap = new THREE.Group();
  heroWrap.add(hero, ring);
  heroWrap.position.y = 3.5;
  group.add(heroWrap);

  group.position.y = -0.5;
  holder.add(group);

  function update(t: number, age: number) {
    items.forEach(it => {
      const e = eOut(clamp((age - it.j*0.025 - it.idx*0.12) / 0.75));
      it.mesh.position.set(it.x, it.baseY + (1-e)*14, it.z);
      it.mesh.visible = e > 0;
    });
    pctSprites.forEach((s, i)  => { s.material.opacity = eOut(clamp((age-1.1-i*0.08)/0.5)); });
    nameSprites.forEach((s, i) => { s.material.opacity = eOut(clamp((age-1.3-i*0.08)/0.5)); });
    heroWrap.rotation.y = t * 0.85;
    heroWrap.position.y = 3.5 + Math.sin(t*1.1)*0.25;
    heroWrap.scale.setScalar(Math.max(0.001, eBack(age/1.1)));
    rim1.intensity           = 3.5 + 1.5*Math.sin(t*0.9);
    rim2.intensity           = 2.5 + 1.0*Math.cos(t*0.7);
    underGlow.intensity      = 2.0 + 1.0*Math.sin(t*1.3);
    ringMat.emissiveIntensity= 2.0 + 1.0*Math.sin(t*2.2);
  }

  return { scene, camera, stage, grid, stars, items, group, update };
}

export interface CoinStackChartProps { height?: number }
interface TTState { visible: boolean; x: number; y: number; idx: number }

export default function CoinStackChart({ height = 620 }: CoinStackChartProps) {
  const wrapRef   = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const st = useRef({ t:0, age:0, spin:0, dragging:false, dragY:0, tiltOff:0, lastX:0, lastY:0, ptrIn:false, px:0, py:0, hover:-1, visible:true, lastNow:performance.now() });
  const [tt, setTT] = useState<TTState>({ visible:false, x:0, y:0, idx:0 });

  useEffect(() => {
    const wrap = wrapRef.current; const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance", alpha: false }); }
    catch { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
    (renderer as any).outputEncoding = (THREE as any).sRGBEncoding ?? 3001;
    (renderer as any).toneMapping    = (THREE as any).ACESFilmicToneMapping ?? 4;
    renderer.toneMappingExposure     = 1.3;

    const { scene, camera, stage, grid, stars, items, update } = buildScene();

    const ray = new THREE.Raycaster(); const ptr = new THREE.Vector2();
    const meshes = items.map(i => i.mesh);
    function hitTest() {
      ray.setFromCamera(ptr, camera);
      const h = ray.intersectObjects(meshes, false);
      return h.length ? ((h[0].object as THREE.Mesh).userData?.idx ?? -1) : -1;
    }

    const resize = () => {
      const { width: w, height: h } = wrap.getBoundingClientRect();
      renderer.setSize(Math.max(1,w), Math.max(1,h), false);
      camera.aspect = Math.max(1,w)/Math.max(1,h);
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(wrap);
    const io = new IntersectionObserver(es => { st.current.visible = es[0].isIntersecting; }); io.observe(wrap);

    const onDown = (e: PointerEvent) => {
      const s=st.current; s.dragging=true; s.lastX=e.clientX; s.lastY=e.clientY;
      try { canvas.setPointerCapture(e.pointerId); } catch {}
      canvas.style.cursor="grabbing";
    };
    const onMove = (e: PointerEvent) => {
      const s=st.current; const rect=canvas.getBoundingClientRect();
      ptr.set((e.clientX-rect.left)/rect.width*2-1, -((e.clientY-rect.top)/rect.height)*2+1);
      s.px=e.clientX; s.py=e.clientY; s.ptrIn=true;
      if (s.dragging) { s.dragY+=(e.clientX-s.lastX)*0.007; s.tiltOff=clamp(s.tiltOff+(e.clientY-s.lastY)*0.003,-0.4,0.4); s.lastX=e.clientX; s.lastY=e.clientY; }
    };
    const onUp    = () => { st.current.dragging=false; canvas.style.cursor="grab"; };
    const onLeave = () => { const s=st.current; if(!s.dragging){s.ptrIn=false;s.hover=-1;setTT(p=>({...p,visible:false}));} canvas.style.cursor="grab"; };

    canvas.addEventListener("pointerdown",   onDown);
    canvas.addEventListener("pointermove",   onMove);
    canvas.addEventListener("pointerup",     onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("pointerleave",  onLeave);

    const camTgt = new THREE.Vector3();
    const frame = (now: number) => {
      rafRef.current = requestAnimationFrame(frame);
      const s=st.current; const dt=Math.min(0.05,(now-s.lastNow)/1000); s.lastNow=now;
      if (!s.visible) return;
      s.t+=dt; s.age+=dt;
      if (!s.dragging) s.spin+=dt*0.14;
      stage.rotation.y=s.spin+s.dragY; stage.rotation.x=s.tiltOff;

      if (s.ptrIn&&!s.dragging) {
        const idx=hitTest();
        if (idx!==s.hover) {
          s.hover=idx;
          if (idx>=0) { const r=canvas.getBoundingClientRect(); setTT({visible:true,x:s.px-r.left,y:s.py-r.top,idx}); }
          else setTT(p=>({...p,visible:false}));
        }
      }
      items.forEach(it => {
        const on=it.idx===s.hover; it.hv+=((on?1:0)-it.hv)*Math.min(1,dt*10);
        eachMat(it.mesh, m => { m.emissiveIntensity=0.18+it.hv*0.9; });
      });
      update(s.t, s.age);

      const asp=camera.aspect;
      const camZ = asp<0.6?42 : asp<0.85?36 : asp<1.2?30 : asp<1.6?26 : 24;
      camTgt.set(0,13,camZ); camera.position.lerp(camTgt,0.05); camera.lookAt(0,1,0);
      grid.position.y+=(-4.0-grid.position.y)*0.06; grid.rotation.y=s.t*0.025; stars.rotation.y=s.t*0.008;
      renderer.render(scene, camera);
    };
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("pointerdown",   onDown);
      canvas.removeEventListener("pointermove",   onMove);
      canvas.removeEventListener("pointerup",     onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("pointerleave",  onLeave);
      ro.disconnect(); io.disconnect(); disposeObject(stage); renderer.dispose(); matCache.clear();
    };
  }, []);

  const a    = allocations[tt.idx];
  const pctV = a ? (a.tokens/SUPPLY*100).toFixed(2)+"%" : "";
  const tokV = a ? fmt(a.tokens)+" IBO" : "";

  return (
    <div ref={wrapRef} className="csc-wrap" style={{ height }}>
      <canvas ref={canvasRef} className="csc-canvas" aria-label="Interactive 3D IBO tokenomics chart" />
      {tt.visible && a && (
        <div className="csc-tooltip" style={{ left:Math.min(tt.x+18,(wrapRef.current?.clientWidth??500)-230), top:Math.max(tt.y-80,10), borderColor:hexRgba(a.color,0.6) }}>
          <span className="csc-tt-dot" style={{ background:a.color }} />
          <div>
            <p className="csc-tt-name" style={{ color:lightenHex(a.color,0.25) }}>{a.name}</p>
            <p className="csc-tt-row"><strong style={{ color:lightenHex(a.color,0.2) }}>{pctV}</strong><span className="csc-tt-sep">·</span><span>{tokV}</span></p>
            <p className="csc-tt-desc">{a.description}</p>
          </div>
        </div>
      )}
      <p className="csc-hint">Drag to rotate · hover a stack to inspect</p>
    </div>
  );
}
