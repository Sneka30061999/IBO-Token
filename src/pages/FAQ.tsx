import { usePageMeta } from "../hooks/usePageMeta";
import FaqScene3D from "../components/FaqScene3D";

export default function FAQ() {
  usePageMeta(
    "FAQ | IBO Token",
    "Answers to common questions about IBO supply, allocation, burns, liquidity and the official contract.",
  );
  return <FaqScene3D />;
}
