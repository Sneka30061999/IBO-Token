/**
 * FaqScene3D.tsx
 * ─────────────────────────────────────────────────────────────
 * KEY ARCHITECTURE:
 *   FaqCanvas   — React.memo, contains all Three.js logic.
 *                 It NEVER re-renders when FAQ open state changes.
 *   FaqScene3D  — exports. Owns only `open` state + FAQ accordion.
 *
 * This separation ensures hovering a question never touches the
 * WebGL canvas, so the 3-D animation stays perfectly stable.
 */

import { useEffect, useRef, useState, memo } from "react";
import * as THREE from "three";
import { faqs } from "../data/content";

/* ── icons ── */
const ICONS = ["🚀","📊","🔗","🎯","🏗️","💰","🔥","⚡","🔍","📈","💧","📋"];

/* ── coin face texture ── */
function makeCoinTex(): THREE.CanvasTexture {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 256;
  const c = cv.getContext("2d")!;
  const g = c.createRadialGradient(128,128,20,128,128,128);
  g.addColorStop(0,"#ffd45c"); g.addColorStop(1,"#e07a10");
  c.fillStyle=g; c.fillRect(0,0,256,256);
  c.strokeStyle="#a35a08"; c.lineWidth=12;
  c.beginPath(); c.arc(128,128,108,0,Math.PI*2); c.stroke();
  c.fillStyle="#fff4d0";
  c.font="bold 90px 'Space Grotesk',sans-serif";
  c.textAlign="center"; c.textBaseline="middle";
  c.fillText("IBO",128,140);
  const t=new THREE.CanvasTexture(cv);
  (t as any).encoding=(THREE as any).sRGBEncoding??3001;
  return t;
}

function addEdges(mesh: THREE.Mesh, color=0x2ee5a8) {
  mesh.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({color}),
  ));
}

function bar(g: THREE.Group, mat: THREE.MeshPhysicalMaterial,
             w:number,h:number,x:number,y:number,rz=0) {
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,0.7),mat);
  m.position.set(x,y,0); m.rotation.z=rz;
  addEdges(m); g.add(m);
}

/* ══════════════════════════════════════════════════════════
   FaqCanvas — memoized, never re-renders after mount
   ══════════════════════════════════════════════════════════ */
const FaqCanvas = memo(function FaqCanvas() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;

    const W = () => mount.clientWidth;
    const H = () => mount.clientHeight;

    const ren = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    ren.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    ren.setSize(W(),H());
    mount.appendChild(ren.domElement);
    ren.domElement.style.display="block";

    const scene = new THREE.Scene();
    const cam   = new THREE.PerspectiveCamera(45,W()/H(),0.1,200);
    cam.position.set(0,1,15);

    scene.add(new THREE.AmbientLight(0x224433,1));
    const key=new THREE.DirectionalLight(0xffffff,1.2);
    key.position.set(4,8,8); scene.add(key);
    const p1=new THREE.PointLight(0x2ee5a8,60,25); p1.position.set(-3,-1,4); scene.add(p1);
    const p2=new THREE.PointLight(0x2ee5a8,40,25); p2.position.set(4,2,4);  scene.add(p2);

    /* stars */
    const sp:number[]=[];
    for(let i=0;i<1200;i++) sp.push((Math.random()-.5)*120,(Math.random()-.5)*70,-Math.random()*60-5);
    const sg=new THREE.BufferGeometry();
    sg.setAttribute("position",new THREE.Float32BufferAttribute(sp,3));
    const stars=new THREE.Points(sg,new THREE.PointsMaterial({color:0x2ee5a8,size:0.22,transparent:true,opacity:0.8}));
    scene.add(stars);

    /* planets */
    const mkPl=(r:number,col:number,x:number,y:number,z:number)=>{
      const m=new THREE.Mesh(new THREE.SphereGeometry(r,40,40),
        new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:0.25,roughness:0.9}));
      m.position.set(x,y,z); scene.add(m); return m;
    };
    const pl1=mkPl(9,0x020504,18,10,-30);
    const pl2=mkPl(5,0x020504,26,4,-25);

    /* hero group */
    const hero=new THREE.Group(); scene.add(hero);

    const metalMat=new THREE.MeshStandardMaterial({color:0x020504,metalness:0.8,roughness:0.35});
    const base=new THREE.Mesh(new THREE.CylinderGeometry(3.8,4.1,0.5,48),metalMat);
    base.position.y=-2.6;

    const glowRing=new THREE.Mesh(new THREE.TorusGeometry(3.6,0.07,8,64),
      new THREE.MeshBasicMaterial({color:0x2ee5a8}));
    glowRing.rotation.x=Math.PI/2; glowRing.position.y=-2.32;

    const orbit1=new THREE.Mesh(new THREE.TorusGeometry(5.2,0.03,8,100),new THREE.MeshBasicMaterial({color:0x1aad7e}));
    const orbit2=new THREE.Mesh(new THREE.TorusGeometry(4.6,0.03,8,100),new THREE.MeshBasicMaterial({color:0x2ee5a8}));
    orbit1.rotation.x=Math.PI/2-0.25; orbit2.rotation.x=Math.PI/2+0.3;
    orbit1.position.y=orbit2.position.y=-2.2;
    hero.add(base,glowRing,orbit1,orbit2);

    /* FAQ glass letters */
    const glassMat=new THREE.MeshPhysicalMaterial({
      color:0x2ee5a8,transparent:true,opacity:0.6,roughness:0.1,metalness:0.2,
      emissive:new THREE.Color(0x1aad7e),emissiveIntensity:0.55,
    } as THREE.MeshPhysicalMaterialParameters);

    const letters=new THREE.Group(); letters.position.y=-0.9;
    const F=new THREE.Group(),A=new THREE.Group(),Q=new THREE.Group();
    F.position.x=-2.3; A.position.x=0; Q.position.x=2.4;
    bar(F,glassMat,0.55,2.8,-0.6,0); bar(F,glassMat,1.5,0.5,-0.1,1.15); bar(F,glassMat,1.1,0.45,-0.3,0.2);
    bar(A,glassMat,0.55,3.0,-0.45,0,-0.3); bar(A,glassMat,0.55,3.0,0.45,0,0.3); bar(A,glassMat,0.9,0.4,0,-0.5);
    const qRing=new THREE.Mesh(new THREE.TorusGeometry(0.85,0.3,16,40),glassMat);
    qRing.scale.y=1.3; Q.add(qRing); bar(Q,glassMat,0.35,1,0.7,-1,0.7);
    letters.add(F,A,Q); hero.add(letters);

    /* robot */
    const wMat=new THREE.MeshStandardMaterial({color:0xf0f0ff,roughness:0.3,metalness:0.2});
    const robot=new THREE.Group(); robot.position.set(-1.3,1.2,-0.2);
    const bodyG=(THREE as any).CapsuleGeometry
      ? new (THREE as any).CapsuleGeometry(0.65,0.7,6,16)
      : new THREE.CylinderGeometry(0.65,0.65,2.0,16);
    const body=new THREE.Mesh(bodyG,wMat);

    const head=new THREE.Group(); head.position.y=1.5;
    const skull=new THREE.Mesh(new THREE.SphereGeometry(0.8,32,32),wMat);
    skull.scale.set(1.15,0.92,0.95);
    const visor=new THREE.Mesh(new THREE.SphereGeometry(0.62,32,32),
      new THREE.MeshStandardMaterial({color:0x020504,roughness:0.1,metalness:0.8}));
    visor.scale.set(1.15,0.78,0.5); visor.position.z=0.55;
    const eyMat=new THREE.MeshBasicMaterial({color:0x2ee5a8});
    const eyeL=new THREE.Mesh(new THREE.TorusGeometry(0.13,0.035,8,20,Math.PI),eyMat);
    const eyeR=eyeL.clone();
    eyeL.position.set(-0.25,0,0.88); eyeR.position.set(0.25,0,0.88);
    const earMat=new THREE.MeshStandardMaterial({color:0x2ee5a8,emissive:new THREE.Color(0x2ee5a8),emissiveIntensity:1.2});
    const earL=new THREE.Mesh(new THREE.CylinderGeometry(0.24,0.24,0.18,24),earMat);
    earL.rotation.z=Math.PI/2; earL.position.x=-0.95;
    const earR=earL.clone(); earR.position.x=0.95;
    head.add(skull,visor,eyeL,eyeR,earL,earR);

    const armLG=(THREE as any).CapsuleGeometry
      ? new (THREE as any).CapsuleGeometry(0.17,0.8,4,10)
      : new THREE.CylinderGeometry(0.17,0.17,1.14,10);
    const armL=new THREE.Mesh(armLG,wMat);
    armL.position.set(-0.85,-0.2,0.2); armL.rotation.z=1.1;

    const armPivot=new THREE.Group(); armPivot.position.set(0.7,0.5,0);
    const armRG=(THREE as any).CapsuleGeometry
      ? new (THREE as any).CapsuleGeometry(0.17,0.9,4,10)
      : new THREE.CylinderGeometry(0.17,0.17,1.24,10);
    const armR=new THREE.Mesh(armRG,wMat); armR.position.y=0.6;
    armPivot.add(armR); armPivot.rotation.z=-0.9;
    robot.add(body,head,armL,armPivot); hero.add(robot);

    /* coin */
    const coinTex=makeCoinTex();
    const goldMat=new THREE.MeshStandardMaterial({color:0xf0a020,metalness:0.9,roughness:0.3});
    const faceMat=new THREE.MeshStandardMaterial({map:coinTex,metalness:0.6,roughness:0.4});
    const mkCoin=(r:number)=>{
      const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,r*0.18,48),[goldMat,faceMat,faceMat]);
      m.rotation.x=Math.PI/2; const g=new THREE.Group(); g.add(m); return g;
    };
    const coin=mkCoin(0.85); hero.add(coin);
    const coinRing=new THREE.Mesh(new THREE.TorusGeometry(1.5,0.025,8,80),
      new THREE.MeshBasicMaterial({color:0x1aad7e}));
    coinRing.rotation.x=1.2; hero.add(coinRing);
    type MC={c:THREE.Group;a:number};
    const mini:MC[]=[0,1,2].map(i=>{const c=mkCoin(0.4);hero.add(c);return{c,a:i*2.1};});

    /* crystal + cubes */
    const eth=new THREE.Mesh(new THREE.OctahedronGeometry(0.6),
      new THREE.MeshPhysicalMaterial({color:0x2ee5a8,emissive:new THREE.Color(0x1aad7e),
        emissiveIntensity:0.6,roughness:0.15,transparent:true,opacity:0.85} as THREE.MeshPhysicalMaterialParameters));
    eth.scale.y=1.7; hero.add(eth);

    const cubes=new THREE.Group();
    const cubeMat=new THREE.MeshPhysicalMaterial({color:0x2ee5a8,emissive:new THREE.Color(0x1aad7e),
      emissiveIntensity:0.5,transparent:true,opacity:0.6} as THREE.MeshPhysicalMaterialParameters);
    ([[ 0,0,0],[0.8,0.3,0],[0.4,-0.7,0.2]] as [number,number,number][]).forEach(([x,y,z])=>{
      const m=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.7,0.7),cubeMat);
      m.position.set(x,y,z); addEdges(m); cubes.add(m);
    });
    hero.add(cubes);

    /* layout */
    const layout=()=>{
      const r=W()/H();
      const wide=r>1.1;
      const xOffset=wide?-(r*2.9):1.5;
      hero.position.set(xOffset,wide?-1.2:3.2,wide?0:-4);
      hero.scale.setScalar(wide?1:0.5);
    };
    layout();

    let pmx=0,pmy=0;
    const onMove=(e:PointerEvent)=>{pmx=e.clientX/window.innerWidth-.5;pmy=e.clientY/window.innerHeight-.5;};
    window.addEventListener("pointermove",onMove,{passive:true});

    const ro=new ResizeObserver(()=>{cam.aspect=W()/H();cam.updateProjectionMatrix();ren.setSize(W(),H());layout();});
    ro.observe(mount);

    const clock=new THREE.Clock(); let rafId:number;
    const loop=()=>{
      rafId=requestAnimationFrame(loop);
      const t=clock.getElapsedTime();
      hero.rotation.y+=(pmx*.5-hero.rotation.y)*.05;
      hero.rotation.x+=(pmy*.2-hero.rotation.x)*.05;
      robot.position.y=1.2+Math.sin(t*1.4)*.12;
      head.rotation.y+=(pmx*.8-head.rotation.y)*.08;
      head.rotation.x+=(pmy*.4-head.rotation.x)*.08;
      armPivot.rotation.z=-0.9+Math.sin(t*2)*.12;
      coin.position.set(2.1,3.7+Math.sin(t*1.6)*.2,0.4);
      coin.rotation.y=t*1.6;
      coinRing.position.copy(coin.position); coinRing.rotation.z=t*.5;
      mini.forEach((m,i)=>{m.a+=.004;m.c.position.set(Math.cos(m.a)*5.4,-.5+Math.sin(t+i)*.5,Math.sin(m.a)*2.5);m.c.rotation.y=t*2;});
      eth.position.set(-5,.8+Math.sin(t*1.2)*.3,0); eth.rotation.y=t*.9;
      cubes.position.set(3.2,5.4+Math.sin(t)*.2,-.5); cubes.rotation.set(t*.3,t*.5,0);
      orbit1.rotation.z=t*.3; orbit2.rotation.z=-t*.4;
      (glowRing.material as THREE.MeshBasicMaterial).color.setHSL(.38+Math.sin(t)*.03,1,.65);
      stars.rotation.z=t*.004;
      pl1.rotation.y=pl2.rotation.y=t*.03;
      ren.render(scene,cam);
    };
    loop();

    return ()=>{
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove",onMove);
      ro.disconnect();
      scene.traverse((o:any)=>{
        o.geometry?.dispose();
        ([] as THREE.Material[]).concat(o.material??[]).forEach((m:any)=>{m.map?.dispose();m.dispose();});
      });
      ren.dispose();
      if(ren.domElement.parentNode===mount) mount.removeChild(ren.domElement);
    };
  }, []); // empty deps — runs once, never re-runs

  return (
    <div
      ref={ref}
      className="absolute inset-0"
      style={{
        /* Keep the WebGL canvas in its own permanent GPU compositor layer.
           This prevents any sibling repaint (accordion hover) from ever
           touching this layer and causing a flicker. */
        willChange: "transform",
        isolation: "isolate",
        transform: "translateZ(0)",
      }}
    />
  );
});

/* ══════════════════════════════════════════════════════════
   FaqAccordionPanel — owns ALL accordion state.
   Isolated into its own memo'd component so that React never
   walks the FaqCanvas subtree when open state changes.
   ══════════════════════════════════════════════════════════ */
const FaqAccordionPanel = memo(function FaqAccordionPanel() {
  const [open, setOpen] = useState<number>(-1);

  

  return (
    <div className="relative z-10 mx-auto flex w-full flex-col gap-8 px-4 py-10 sm:px-8 lg:flex-row lg:items-start lg:justify-between lg:px-12 lg:py-14 xl:px-16">

      {/* Left — heading */}
      <div className="pointer-events-none lg:w-[40%]">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#2EE5A8]/40 bg-[#2EE5A8]/15 px-4 py-1.5 text-xs backdrop-blur sm:text-sm">
          💬 Got Questions?
        </span>
        <h2 className="mt-4 text-4xl font-extrabold italic leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          Frequently Asked
          <span className="block bg-gradient-to-r from-[#2EE5A8] via-[#2EE5A8] to-[#a8f5df] bg-clip-text text-4xl text-transparent sm:text-5xl lg:text-7xl">
            Questions
          </span>
        </h2>
        <p className="mt-3 max-w-xs text-sm text-slate-300">
          Find answers to common questions about IBO Token, our ecosystem and more.
        </p>
      </div>

      {/* Right — accordion */}
      <div
        className="w-full pb-24 lg:mt-10 lg:w-[50%]"
        onMouseLeave={() => setOpen(-1)}
      >
        <div className="flex flex-col gap-2">
          {faqs.map((f, i) => {
            const isOpen = i === open;
            const icon   = ICONS[i % ICONS.length];
            return (
              <div
                key={f.q}
                onMouseEnter={() => setOpen(i)}
                data-aos-delay={String(Math.min(i * 50, 300))}
                className={[
                  "isolate rounded-2xl border",
                  "transition-[border-color,box-shadow,background-color] duration-300",
                  isOpen
                    ? "border-[#2EE5A8]/70 bg-[#021a10]/90 shadow-[0_0_28px_rgba(46,229,168,0.45)]"
                    : "border-[#2EE5A8]/25 bg-black/35 hover:border-[#2EE5A8]/50 hover:bg-[#2EE5A8]/[0.08]",
                ].join(" ")}
                style={{ transform: "translateZ(0)" }}
              >
                {/* Question row */}
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  onFocus={() => setOpen(i)}
                  onBlur={() => setOpen(-1)}
                  className="flex w-full items-center gap-3 p-3 text-left"
                >
                  <span
                    className={[
                      "grid h-10 w-10 shrink-0 place-items-center rounded-xl text-base",
                      "transition-[background-color,box-shadow] duration-300",
                      isOpen ? "bg-[#2EE5A8]/50 shadow-[0_0_14px_rgba(46,229,168,0.6)]" : "bg-[#2EE5A8]/20",
                    ].join(" ")}
                    style={{ transform: "translateZ(0)" }}
                  >
                    {icon}
                  </span>
                  <span className="flex-1 text-sm font-semibold leading-snug text-white sm:text-base">
                    {f.q}
                  </span>
                  <span
                    className={[
                      "grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold",
                      "transition-[background-color,box-shadow] duration-300",
                      isOpen
                        ? "bg-[#2EE5A8] text-[#020504] shadow-[0_0_12px_rgba(46,229,168,0.7)]"
                        : "bg-white/10 text-slate-400",
                    ].join(" ")}
                    style={{ transform: "translateZ(0)" }}
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {/* Answer — grid-row trick: zero layout shift */}
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <div className="mx-3 h-px bg-gradient-to-r from-transparent via-[#2EE5A8]/40 to-transparent" />
                    <p className="px-4 py-3 text-sm leading-relaxed text-slate-300 sm:text-[15px]">
                      {f.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-6 text-center">
          <a
            href="/about"
            className="inline-block rounded-full border border-[#2EE5A8]/65 bg-[#2EE5A8]/10 px-8 py-3 text-sm shadow-[0_0_20px_rgba(46,229,168,0.4)] transition hover:bg-[#2EE5A8]/20 hover:shadow-[0_0_32px_rgba(46,229,168,0.7)]"
          >
            Still have questions? →
          </a>
        </div>
      </div>

    </div>
  );
});

/* ══════════════════════════════════════════════════════════
   FaqScene3D — stateless shell. Renders two fully independent
   memo'd subtrees: FaqCanvas (WebGL) and FaqAccordionPanel (UI).
   No state here means no re-renders ever reach either child.
   ══════════════════════════════════════════════════════════ */
export default function FaqScene3D() {
  return (
    <section className="relative h-screen w-full overflow-x-hidden overflow-y-auto bg-[#020504] font-sans text-white">
      {/* WebGL canvas — isolated, never touched by accordion state */}
      <FaqCanvas />
      {/* Accordion panel — isolated, never touches the canvas */}
      <FaqAccordionPanel />
    </section>
  );
}
