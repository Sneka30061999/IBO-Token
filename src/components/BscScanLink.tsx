import { ExternalLink } from "lucide-react";
import { bscScan, isAddress, shorten, tokenConfig } from "../config/token";

type Props =
  | { kind: "token"; label?: string; className?: string }
  | { kind: "address" | "tx"; value: string; label?: string; className?: string };

export default function BscScanLink(props: Props) {
  let href: string | null = null;
  let text = props.label;

  if (props.kind === "token") {
    href = isAddress(tokenConfig.contractAddress) ? bscScan.token() : null;
    text ??= "View on BscScan";
  } else if (props.kind === "address") {
    href = isAddress(props.value) ? bscScan.address(props.value) : null;
    text ??= shorten(props.value);
  } else {
    href = /^0x[a-fA-F0-9]{64}$/.test(props.value) ? bscScan.tx(props.value) : null;
    text ??= shorten(props.value, 8, 6);
  }

  const cls = props.className ?? "inline-flex items-center gap-1 font-mono text-[#2EE5A8] hover:text-[#a8f5df] hover:underline";
  if (!href) return <span className={props.className ? props.className : "font-mono text-slate-400"}>{text}</span>;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer nofollow" className={cls}>
      {text}
      <ExternalLink size={13} aria-hidden="true" />
    </a>
  );
}
