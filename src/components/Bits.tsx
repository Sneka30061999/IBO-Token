import type { ReactNode } from "react";
import { Droplets, Gift, Layers, Rocket } from "lucide-react";
import { LogoMark } from "./Logo";

export const iconMap = { Layers, Gift, Droplets, Rocket } as const;

export function PageHeader({ eyebrow, title, subtitle, children }: { eyebrow: string; title: ReactNode; subtitle?: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-white/5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_16rem_at_50%_0%,rgba(46,229,168,0.14),transparent)]" />
      <div className="container-x section relative text-center">
        <p className="eyebrow animate-fadeUp">{eyebrow}</p>
        <h1 className="h-display mt-3 animate-fadeUp text-4xl sm:text-5xl lg:text-6xl">{title}</h1>
        {subtitle && <p className="mx-auto mt-4 max-w-2xl animate-fadeUp text-base text-slate-300 sm:text-lg">{subtitle}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}

export function SectionTitle({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-6 sm:mb-8 text-center">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="h-display mt-2 text-3xl sm:text-4xl">{title}</h2>
      {subtitle && <p className="mx-auto mt-3 max-w-2xl text-slate-400">{subtitle}</p>}
    </div>
  );
}

/** CSS 3D-style rotating coin built from the IBO logo. */
export function Coin() {
  return (
    <div className="relative mx-auto grid h-64 w-64 place-items-center sm:h-80 sm:w-80" style={{ perspective: 900 }}>
      <div className="absolute inset-0 rounded-full bg-[#2EE5A8]/20 blur-3xl" />
      <div className="absolute inset-8 rounded-full bg-rose-500/20 blur-3xl" />
      <div className="absolute inset-0 animate-[spin_26s_linear_infinite] rounded-full border border-dashed border-[#2EE5A8]/30" />
      <div className="absolute inset-4 animate-[spin_38s_linear_infinite_reverse] rounded-full border border-dotted border-[#2EE5A8]/30" />
      <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-amber-300 shadow-[0_0_12px_2px_rgba(245,196,81,0.8)]" />
      <div className="animate-float relative" style={{ transformStyle: "preserve-3d" }}>
        <div className="rounded-full p-2 shadow-glow ring-1 ring-[#2EE5A8]/40" style={{ background: "conic-gradient(from 140deg,#2EE5A8,#f5c451,#2EE5A8,#2EE5A8)" }}>
          <div className="rounded-full bg-[#020504] p-3">
            <LogoMark size={190} />
          </div>
        </div>
      </div>
    </div>
  );
}
