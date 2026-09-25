import Link from "next/link";
import PuzzleClient from "./PuzzleClient";
import SecondaryHeader from "../components/SecondaryHeader";
import { getLiveRiddle } from "../lib/riddles";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function VisualizePage() {
  const riddle = getLiveRiddle(new Date());

  if (!riddle) {
    return <main className="shell"><div className="card empty"><h1>No active riddle.</h1><Link href="/">Back home</Link></div></main>;
  }

  return (
    <main className={`app shell shell-wide riddle-theme riddle-${riddle.id}`}>
      <SecondaryHeader kicker="PUZZLE MODE" title={riddle.title} closeHref="/" closeLabel="Close puzzle mode" />

      <section className="lab-heading">
        <div>
          <span className="stage-label">RIDDLE #{String(riddle.id).padStart(3, "0")} · {riddle.category}</span>
          <h1>{riddle.title}</h1>
          <p>{riddle.question}</p>
        </div>
        <div className="difficulty-stamp"><small>DIFFICULTY</small><strong>{riddle.difficulty.toUpperCase()}</strong></div>
      </section>

      <PuzzleClient type={riddle.visualizer} riddleId={riddle.id} />
    </main>
  );
}
