import { useRef, useEffect, useState, type ReactNode, type CSSProperties } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number; // stagger delay in ms
  tilt?: boolean; // enable 3D tilt on desktop (default true)
  glowColor?: string; // custom spotlight colour
  gradient?: string; // custom gradient overlay (e.g., "from-cyan-500/20 via-[#2EE5A8]/10 to-rose-500/20")
}

/**
 * Premium card wrapper with:
 * 1. Scroll-reveal       — fades + scales up when entering viewport
 * 2. 3D tilt (desktop)   — follows mouse with perspective transform
 * 3. Touch lift (mobile) — tap scales + glows the card
 * 4. Cursor spotlight    — radial gradient tracks mouse inside
 * 5. Shimmer border      — animated neon border on hover/active
 * 6. Glass morphism      — backdrop blur + gradient overlay
 */
export default function AnimatedCard({
  children,
  className = "",
  delay = 0,
  tilt = true,
  glowColor = "rgba(46,229,168,0.15)",
  gradient,
}: AnimatedCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({});
  const [spotStyle, setSpotStyle] = useState<CSSProperties>({ opacity: 0 });
  const [isPressed, setIsPressed] = useState(false);
  const isTouchDevice = useRef(false);

  /* ── Scroll-reveal via IntersectionObserver ── */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* ── Detect touch device ── */
  useEffect(() => {
    isTouchDevice.current = window.matchMedia("(hover: none)").matches;
  }, []);

  /* ── 3-D tilt + spotlight on mouse move (desktop) ── */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt || isTouchDevice.current) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -10; // ±10 deg (increased)
    const rotateY = ((x - cx) / cx) * 10;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(12px) scale(1.02)`,
      transition: "transform 0.1s ease-out",
    });

    setSpotStyle({
      opacity: 1,
      background: `radial-gradient(400px circle at ${x}px ${y}px, ${glowColor}, transparent 65%)`,
      transition: "opacity 0.15s ease",
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0) scale(1)",
      transition: "transform 0.6s cubic-bezier(0.23,1,0.32,1)",
    });
    setSpotStyle({ opacity: 0, transition: "opacity 0.4s ease" });
  };

  /* ── Touch interactions (mobile) ── */
  const handleTouchStart = () => {
    if (!isTouchDevice.current) return;
    setIsPressed(true);
    setStyle({
      transform: "perspective(1000px) scale(0.98) translateZ(0)",
      transition: "transform 0.15s ease-out",
    });
    setSpotStyle({
      opacity: 0.6,
      background: `radial-gradient(circle at 50% 50%, ${glowColor}, transparent 70%)`,
      transition: "opacity 0.2s ease",
    });
  };

  const handleTouchEnd = () => {
    if (!isTouchDevice.current) return;
    setIsPressed(false);
    setStyle({
      transform: "perspective(1000px) scale(1.03) translateZ(0)",
      transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)", // bounce back
    });
    // Fade out spotlight after bounce
    setTimeout(() => {
      setStyle({
        transform: "perspective(1000px) scale(1) translateZ(0)",
        transition: "transform 0.5s cubic-bezier(0.23,1,0.32,1)",
      });
      setSpotStyle({ opacity: 0, transition: "opacity 0.5s ease" });
    }, 300);
  };

  return (
    <div
      ref={ref}
      className={[
        /* Enhanced card base with glass morphism */
        "card-premium relative overflow-hidden cursor-default",
        "group",
        /* Active state for tap feedback */
        isPressed && "ring-2 ring-[#2EE5A8]/50",
        /* Reveal animation */
        revealed ? "animate-cardReveal" : "opacity-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        animationDelay: revealed ? `${delay}ms` : undefined,
        animationFillMode: "both",
        ...style,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Glass morphism gradient overlay */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br ${
          gradient || "from-[#2EE5A8]/10 via-transparent to-rose-500/10"
        } opacity-60 mix-blend-overlay`}
      />

      {/* Animated shimmer border on hover/active */}
      <span
        aria-hidden="true"
        className={[
          "pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-500",
          isPressed ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        ].join(" ")}
        style={{
          background:
            "linear-gradient(135deg, rgba(46,229,168,0.6) 0%, rgba(46,229,168,0.5) 30%, rgba(245,196,81,0.5) 60%, rgba(46,229,168,0.6) 100%)",
          backgroundSize: "400% 400%",
          animation: "borderGlow 3s ease infinite",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "2px",
        }}
      />

      {/* Cursor/touch spotlight */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={spotStyle}
      />

      {/* Floating shine effect on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-[100%] top-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-all duration-700 group-hover:left-[100%] group-hover:opacity-100"
      />

      {/* Card content sits above overlays */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
