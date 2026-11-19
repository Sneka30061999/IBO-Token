import type { TxType } from "../lib/bscscan";

export type Filter = "All" | TxType;
const options: Filter[] = ["All", "Transfer", "Burn", "Liquidity"];

export default function TransactionFilter({ value, onChange }: { value: Filter; onChange: (f: Filter) => void }) {
  return (
    <div role="tablist" aria-label="Filter transactions" className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          role="tab"
          aria-selected={value === o}
          onClick={() => onChange(o)}
          className={`min-h-[40px] rounded-full border px-4 text-sm font-medium transition ${
            value === o
              ? "border-[#2EE5A8] bg-[#2EE5A8]/15 text-[#2EE5A8]"
              : "border-white/10 bg-white/5 text-slate-300 hover:border-white/25"
          }`}
        >
          {o === "All" ? "All" : o === "Transfer" ? "Transfers" : o === "Burn" ? "Burns" : "Liquidity"}
        </button>
      ))}
    </div>
  );
}
