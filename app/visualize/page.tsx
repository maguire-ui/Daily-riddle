import Link from "next/link";
import PuzzleClient from "./PuzzleClient";
import { getCurrentRiddle } from "../lib/riddles";

export default function VisualizePage() {
  const riddle = getCurrentRiddle(new Date());

  if (!riddle) {
    return <main className="shell"><div className="card empty"><h1>No active riddle.</h1><Link href="/">Back home</Link></div></main>;
  }

  return (
    <main className="app shell shell-wide">
      <header className="site-header">
        <Link className="wordmark" href="/">
          <span className="wordmark-box">DR</span>
          <span><strong>PUZZLE LAB</strong><small>INTERACTIVE MODE</small></span>
        </Link>
        <Link className="back-link" href="/">← Exit lab</Link>
      </header>

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
