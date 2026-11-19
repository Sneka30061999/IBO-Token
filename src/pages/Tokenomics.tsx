import { PageHeader, SectionTitle } from "../components/Bits";
import TokenomicsSpiral from "../components/TokenomicsSpiral";
import AllocationCards from "../components/AllocationCards";
import { usePageMeta } from "../hooks/usePageMeta";

export default function Tokenomics() {
  usePageMeta(
    "Tokenomics | IBO Token",
    "Complete IBO token supply and allocation: 46,000,000 IBO across eight categories.",
  );

  return (
    <div>
      <PageHeader
        eyebrow="Tokenomics"
        title={<>IBO <span className="gradient-text">TOKENOMICS</span></>}
        subtitle="46,000,000 IBO — Total Supply. Drag the chart to rotate · hover a segment to inspect."
      />

      {/* 3D spiral donut chart — full width */}
      <TokenomicsSpiral />

      {/* Allocation breakdown cards */}
      <section className="pb-8 sm:pb-10">
        <div className="container-x">
          <SectionTitle eyebrow="Breakdown" title="What each allocation is for" />
          <AllocationCards />
        </div>
      </section>
    </div>
  );
}
