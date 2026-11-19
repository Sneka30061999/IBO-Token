import { Download, FileText } from "lucide-react";
import { PageHeader } from "../components/Bits";
import { LogoMark } from "../components/Logo";
import { links } from "../config/token";
import { usePageMeta } from "../hooks/usePageMeta";

export default function Whitepaper() {
  usePageMeta("Whitepaper | IBO Token", "Official IBO token documentation.");
  return (
    <div>
      <PageHeader eyebrow="Documentation" title={<>IBO <span className="gradient-text">Whitepaper</span></>}
        subtitle="The official documentation covering IBO's purpose, tokenomics, burn programme and ecosystem." />
      <section className="section">
        <div className="container-x">
          <div className="card grid items-center gap-8 !p-8 md:grid-cols-[240px_1fr]">
            <div className="mx-auto grid aspect-[3/4] w-48 place-items-center rounded-xl border border-white/15 bg-gradient-to-br from-[#020504] to-[#020504] p-4 shadow-glow md:w-full">
              <div className="text-center">
                <LogoMark size={64} />
                <p className="mt-3 font-display text-xl font-bold text-white">IBO</p>
                <p className="text-xs uppercase tracking-widest text-slate-400">Whitepaper</p>
              </div>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-white">IBO Token Whitepaper</h2>
              <p className="mt-2 text-slate-300">
                A complete overview of the IBO utility token, its supply allocation, burn mechanisms and role within the
                ABT Working ecosystem.
              </p>
              {links.whitepaper ? (
                <a href={links.whitepaper} target="_blank" rel="noopener noreferrer" className="btn-primary mt-6">
                  <Download size={16} /> Download Whitepaper
                </a>
              ) : (
                <div className="mt-6 flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  <FileText size={18} className="mt-0.5 shrink-0 text-[#2EE5A8]" />
                  The whitepaper is being finalised and will be published here soon.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
