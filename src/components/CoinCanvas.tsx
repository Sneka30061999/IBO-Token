/**
 * CoinCanvas — Portals.fi-style 3D scene
 *
 * Features:
 *  • Curved dark grid platform tilted in perspective (like a conveyor belt)
 *  • 3 floating IBO coins at different depths / heights
 *  • Purple neon glow pedestal ring beneath each coin
 *  • Each coin spins on Y-axis with metallic face + specular
 *  • Particle sparks emanating from glow rings
 *  • Depth fog on far coins
 *  • Fully responsive via ResizeObserver
 */

import { useEffect, useRef } from "react";

/* ─── palette ─── */
const P = {
  purple:   "#2EE5A8",
  purpleL:  "#c084fc",
  purpleLo: "#2EE5A8",
  pink:     "#2EE5A8",
  white:    "#ffffff",
  dark:     "#050008",
  gridLine: "#1a0a2e",
  coinFace: "#0d0a1a",
  coinMid:  "#1a1030",
  coinEdge: "#2d1f50",
  gold:     "#c8a0f0",   // soft lavender-gold for coin ring
};

function ha(hex: string, a: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

/* ─── perspective helpers ─── */
// Simple perspective projection: 3D (x,y,z) → 2D (px,py) + scale
// z=0 is "near", z=1 is "far"
function project(
  x3: number, y3: number, z3: number,
  W: number, H: number,
  fov = 500,
) {
  const perspective = fov / (fov + z3);
  return {
    px: W * 0.5 + x3 * perspective,
    py: H * 0.5 + y3 * perspective,
    scale: perspective,
  };
}

/* ─── draw curved grid platform ─── */
function drawPlatform(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  t: number,
) {
  // Grid is a curved surface tilted ~40° — we simulate with perspective-warped lines
  // The platform sweeps from bottom-right to upper-left (like in screenshot)

  const cols = 14;
  const rows = 10;
  const baseZ = 200;   // how far back the grid goes
  const nearZ = -60;

  // Platform offset — slightly right and downward
  const ox = W * 0.18;
  const oy = H * 0.12;

  // Scroll the grid slowly (conveyor belt feel)
  const scroll = (t * 18) % (H / rows);

  ctx.save();

  // Draw filled platform background first
  ctx.fillStyle = "rgba(8,2,20,0.85)";
  // approximate trapezoid shape
  ctx.beginPath();

  // We'll draw grid lines in perspective
  // Vertical lines (columns) — from near-bottom to far-top
  for (let c = 0; c <= cols; c++) {
    const frac = c / cols;
    // near point (bottom of platform)
    const nx = (frac - 0.5) * W * 1.1 + ox;
    const ny = H * 0.52 + oy;
    // far point (top of platform, smaller due to perspective)
    const fx = (frac - 0.5) * W * 0.45 + ox * 0.6;
    const fy = -H * 0.08 + oy;

    const alpha = 0.18 + 0.08 * Math.sin(frac * Math.PI);
    ctx.save();
    ctx.strokeStyle = `rgba(140,80,255,${alpha})`;
    ctx.lineWidth = 0.8;
    ctx.shadowBlur = c % 3 === 0 ? 6 : 0;
    ctx.shadowColor = ha(P.purple, 0.3);
    ctx.beginPath();
    ctx.moveTo(nx, ny);
    ctx.lineTo(fx, fy);
    ctx.stroke();
    ctx.restore();
  }

  // Horizontal lines (rows) with scroll
  for (let r = -1; r <= rows + 1; r++) {
    const rawFrac = (r / rows) + (scroll / H);
    const frac = ((rawFrac % 1) + 1) % 1; // wrap 0..1

    // near/far Y interpolation with perspective
    const ny = H * 0.52 + oy + (1 - frac) * 0 + frac * 0;
    // lerp between near and far horizontal spans
    const nearSpanX = W * 1.1;
    const farSpanX  = W * 0.45;
    const spanX = nearSpanX + (farSpanX - nearSpanX) * frac;
    const baseX = ox * (1 - frac * 0.4);

    // Y position: perspective — far rows are higher up
    const lineY = H * 0.52 + oy - frac * (H * 0.6 + oy);

    // fade rows that are very far or very near
    const fadeNear = Math.min(frac * 8, 1);
    const fadeFar  = Math.min((1 - frac) * 4, 1);
    const alpha = 0.12 * fadeNear * fadeFar;

    ctx.save();
    ctx.strokeStyle = `rgba(140,80,255,${alpha})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(baseX - spanX * 0.5, lineY);
    ctx.lineTo(baseX + spanX * 0.5, lineY);
    ctx.stroke();
    ctx.restore();
  }

  // Curved surface highlight — subtle lighter strip at the "crest"
  const crestY = H * 0.08 + oy;
  const crestGrad = ctx.createLinearGradient(0, crestY - 20, 0, crestY + 40);
  crestGrad.addColorStop(0, "transparent");
  crestGrad.addColorStop(0.5, ha(P.purple, 0.04));
  crestGrad.addColorStop(1, "transparent");
  ctx.fillStyle = crestGrad;
  ctx.fillRect(0, crestY - 20, W, 60);

  ctx.restore();
}

/* ─── draw neon glow pedestal under a coin ─── */
function drawPedestal(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  rx: number, ry: number, // ellipse radii
  t: number,
  intensity: number,      // 0..1
) {
  // Outer glow ellipse
  const glowRx = rx * 1.6;
  const glowRy = ry * 1.6;

  // Soft outer halo
  ctx.save();
  const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRx);
  halo.addColorStop(0,   ha(P.purple, 0.0));
  halo.addColorStop(0.5, ha(P.purple, 0.12 * intensity));
  halo.addColorStop(0.8, ha(P.purpleL, 0.08 * intensity));
  halo.addColorStop(1,   "transparent");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.ellipse(cx, cy, glowRx * 1.4, glowRy * 1.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Bright inner ring — the neon oval on the floor
  const pulse = 0.75 + 0.25 * Math.sin(t * 2.5);
  ctx.save();
  ctx.strokeStyle = ha(P.purpleL, 0.9 * intensity * pulse);
  ctx.lineWidth   = 2.5;
  ctx.shadowBlur  = 24;
  ctx.shadowColor = ha(P.purple, 0.8 * intensity);
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Second thinner ring inside
  ctx.save();
  ctx.strokeStyle = ha(P.pink, 0.5 * intensity * pulse);
  ctx.lineWidth   = 1;
  ctx.shadowBlur  = 12;
  ctx.shadowColor = ha(P.pink, 0.5);
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx * 0.7, ry * 0.7, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Bright fill patch on the "floor" inside the ring
  ctx.save();
  const fill = ctx.createRadialGradient(cx, cy - ry * 0.1, 0, cx, cy, rx);
  fill.addColorStop(0,   ha(P.purpleL, 0.35 * intensity * pulse));
  fill.addColorStop(0.4, ha(P.purple,  0.18 * intensity));
  fill.addColorStop(1,   "transparent");
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx * 0.95, ry * 0.95, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/* ─── draw a single spinning coin ─── */
function drawCoin(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  R: number,            // face radius in px
  spinAngle: number,
  lightAngle: number,
  depthFade: number,    // 0=near (fully visible), 1=far (faded)
) {
  const a   = ((spinAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const cosA = Math.cos(a);
  const tilt = 0.15; // slight forward tilt so face is always visible

  const fade = 1 - depthFade * 0.5;  // far coins are dimmer

  // Bloom behind coin
  ctx.save();
  const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.8);
  bloom.addColorStop(0,   ha(P.purple, 0.18 * fade));
  bloom.addColorStop(0.4, ha(P.purpleL, 0.08 * fade));
  bloom.addColorStop(1,   "transparent");
  ctx.fillStyle = bloom;
  ctx.beginPath();
  ctx.ellipse(cx, cy, R * 1.8, R * 1.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Coin depth (edge thickness)
  const depth = R * 0.11;
  const edgeW = Math.abs(cosA) * depth + depth * tilt;

  // ── Edge ──
  if (edgeW > 0.4) {
    const ex = cx + Math.sign(cosA) * (R - edgeW * 0.5);
    ctx.save();
    const eg = ctx.createLinearGradient(ex - edgeW, cy - R, ex + edgeW, cy + R);
    eg.addColorStop(0,   ha(P.purpleL, 0.9 * fade));
    eg.addColorStop(0.4, ha(P.purple,  0.7 * fade));
    eg.addColorStop(1,   ha(P.purpleL, 0.8 * fade));
    ctx.fillStyle = eg;
    ctx.shadowBlur  = 6;
    ctx.shadowColor = ha(P.purple, 0.4);
    ctx.beginPath();
    ctx.ellipse(ex, cy, edgeW, R, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ── Back face ──
  if (cosA < 0) {
    ctx.save();
    const bf = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    bf.addColorStop(0, "#1a0d2e");
    bf.addColorStop(1, "#050008");
    ctx.fillStyle = bf;
    const scY = tilt + (1 - tilt) * Math.abs(cosA);
    ctx.beginPath();
    ctx.ellipse(cx, cy, R, R * scY, 0, 0, Math.PI * 2);
    ctx.fill();
    // Ring on back
    ctx.strokeStyle = ha(P.purpleL, 0.4 * fade);
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 6;
    ctx.shadowColor = ha(P.purple, 0.5);
    ctx.beginPath();
    ctx.ellipse(cx, cy, R - 4, (R - 4) * scY, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Mirror text
    ctx.shadowBlur = 14;
    ctx.shadowColor = ha(P.purpleL, 0.7);
    const ts = R * 0.38;
    const tg = ctx.createLinearGradient(cx - ts, cy, cx + ts, cy);
    tg.addColorStop(0, P.purpleL);
    tg.addColorStop(1, P.pink);
    ctx.fillStyle = tg;
    ctx.font = `900 ${ts}px "Space Grotesk","Inter",system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.scale(-1, 1);
    ctx.fillText("IBO", -cx, cy);
    ctx.restore();
  }

  // ── Front face ──
  if (cosA >= 0) {
    ctx.save();
    const ff = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.2, 0, cx, cy, R);
    ff.addColorStop(0, "#1e1035");
    ff.addColorStop(0.5, "#0f0620");
    ff.addColorStop(1, "#050008");
    const scY = tilt + (1 - tilt) * cosA;
    ctx.fillStyle = ff;
    ctx.beginPath();
    ctx.ellipse(cx, cy, R, R * scY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Outer purple ring
    ctx.strokeStyle = ha(P.purpleL, 0.75 * fade);
    ctx.lineWidth = 2;
    ctx.shadowBlur = 14;
    ctx.shadowColor = ha(P.purple, 0.7);
    ctx.beginPath();
    ctx.ellipse(cx, cy, R - 4, (R - 4) * scY, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Inner faint ring
    ctx.strokeStyle = ha(P.pink, 0.25 * fade);
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.ellipse(cx, cy, R - 13, (R - 13) * scY, 0, 0, Math.PI * 2);
    ctx.stroke();

    // IBO text
    ctx.shadowBlur = 18;
    ctx.shadowColor = ha(P.purpleL, 0.9);
    const ls = R * 0.4;
    const lg = ctx.createLinearGradient(cx - ls, cy, cx + ls, cy);
    lg.addColorStop(0, P.purpleL);
    lg.addColorStop(0.5, "#e9d5ff");
    lg.addColorStop(1, P.pink);
    ctx.fillStyle = lg;
    ctx.font = `900 ${ls}px "Space Grotesk","Inter",system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("IBO", cx, cy);

    // Sub-label
    ctx.shadowBlur = 6;
    ctx.shadowColor = ha(P.purpleL, 0.5);
    ctx.fillStyle = ha(P.purpleL, 0.6 * fade);
    ctx.font = `600 ${R * 0.13}px "Inter",system-ui`;
    ctx.fillText("TOKEN", cx, cy + ls * 0.62);

    // Specular highlight
    const hx = cx + Math.cos(lightAngle) * R * 0.28;
    const hy = cy + Math.sin(lightAngle) * R * 0.22;
    const spec = ctx.createRadialGradient(hx, hy, 0, hx, hy, R * 0.45);
    spec.addColorStop(0,   `rgba(255,255,255,${0.2 * fade})`);
    spec.addColorStop(0.5, `rgba(255,255,255,${0.06 * fade})`);
    spec.addColorStop(1,   "transparent");
    ctx.fillStyle = spec;
    ctx.beginPath();
    ctx.ellipse(cx, cy, R, R * scY, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

/* ─── particle system ─── */
interface Spark {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  r: number; color: string;
}

function mkSpark(cx: number, cy: number, rx: number, ry: number): Spark {
  const ang = Math.random() * Math.PI * 2;
  return {
    x: cx + Math.cos(ang) * rx * (0.8 + Math.random() * 0.4),
    y: cy + Math.sin(ang) * ry * (0.8 + Math.random() * 0.4),
    vx: (Math.random() - 0.5) * 0.8,
    vy: -0.3 - Math.random() * 0.9,
    life: 0,
    maxLife: 40 + Math.random() * 60,
    r: 1 + Math.random() * 2,
    color: Math.random() > 0.5 ? P.purpleL : P.pink,
  };
}

/* ═══════════════════════════════════════════════════════
   React component
   ═══════════════════════════════════════════════════════ */
export default function CoinCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Per-pedestal spark pools
    const sparks: Spark[][] = [[], [], []];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w   = canvas.clientWidth;
      const h   = canvas.clientHeight;
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let t = 0;

    const frame = () => {
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;

      t += 0.016;

      ctx.clearRect(0, 0, W, H);

      // ── Platform ──
      drawPlatform(ctx, W, H, t);

      // ── Define 3 coin positions ──
      // These are laid out like in the screenshot:
      // coin[0] = centre-right, big, prominent   (foreground)
      // coin[1] = upper-right, medium             (mid-ground)
      // coin[2] = upper-left of centre, small     (background)
      //
      // We pick positions as fractions of W,H so it's responsive.

      type CoinDef = {
        cx: number; cy: number;
        R: number;
        spinOffset: number;
        floatAmp: number;
        floatFreq: number;
        depth: number;      // 0=near, 1=far
        pedestalScale: number;
      };

      const coins: CoinDef[] = [
        {
          // Foreground centre-right
          cx: W * 0.62,
          cy: H * 0.46,
          R:  Math.min(W, H) * 0.17,
          spinOffset: 0,
          floatAmp:   7,
          floatFreq:  0.9,
          depth:      0.0,
          pedestalScale: 1.0,
        },
        {
          // Mid upper-right
          cx: W * 0.78,
          cy: H * 0.22,
          R:  Math.min(W, H) * 0.10,
          spinOffset: Math.PI * 0.7,
          floatAmp:   5,
          floatFreq:  1.1,
          depth:      0.45,
          pedestalScale: 0.75,
        },
        {
          // Background upper (behind foreground)
          cx: W * 0.52,
          cy: H * 0.14,
          R:  Math.min(W, H) * 0.07,
          spinOffset: Math.PI * 1.4,
          floatAmp:   3,
          floatFreq:  1.3,
          depth:      0.78,
          pedestalScale: 0.6,
        },
      ];

      // Sort back-to-front (largest depth first)
      const sorted = [...coins].sort((a, b) => b.depth - a.depth);

      for (const c of sorted) {
        const floatY  = Math.sin(t * c.floatFreq) * c.floatAmp;
        const coinY   = c.cy + floatY;
        const spin    = t * 1.2 + c.spinOffset;
        const light   = t * 0.5;
        const idx     = coins.indexOf(c);

        // Pedestal position is slightly below + behind the coin
        const pedCx = c.cx;
        const pedCy = coinY + c.R * 1.05;
        const pedRx  = c.R * 1.1 * c.pedestalScale;
        const pedRy  = c.R * 0.28 * c.pedestalScale;

        // Draw pedestal
        drawPedestal(ctx, pedCx, pedCy, pedRx, pedRy, t, 1 - c.depth * 0.6);

        // Draw coin
        drawCoin(ctx, c.cx, coinY, c.R, spin, light, c.depth);

        // Sparks from pedestal
        const pool = sparks[idx];
        if (pool.length < 18) {
          if (Math.random() < 0.4) {
            pool.push(mkSpark(pedCx, pedCy, pedRx, pedRy));
          }
        }
        for (let si = pool.length - 1; si >= 0; si--) {
          const s = pool[si];
          s.x  += s.vx;
          s.y  += s.vy;
          s.vy -= 0.015;
          s.life++;
          if (s.life > s.maxLife) { pool.splice(si, 1); continue; }
          const al = (1 - s.life / s.maxLife) * (1 - c.depth * 0.5);
          ctx.save();
          ctx.shadowBlur  = 8;
          ctx.shadowColor = s.color;
          ctx.fillStyle   = ha(s.color, al);
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * al, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="coin-canvas"
      aria-label="IBO Token 3D animation"
    />
  );
}
