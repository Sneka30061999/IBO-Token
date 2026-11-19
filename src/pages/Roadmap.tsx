import { usePageMeta } from "../hooks/usePageMeta";
import RoadmapScene3D from "../components/RoadmapScene3D";

export default function Roadmap() {
  usePageMeta(
    "Roadmap | IBO Token",
    "IBO development milestones and future ecosystem direction.",
  );
  /* Full-screen 3D scene — no page chrome needed */
  return <RoadmapScene3D />;
}
