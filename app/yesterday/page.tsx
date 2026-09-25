import Link from "next/link";
import { getPreviousRiddle } from "../lib/riddles";
import SecondaryHeader from "../components/SecondaryHeader";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function YesterdayPage() {
  const r = getPreviousRiddle(new Date());

  if (!r) {
    return (
      <main className="journal-page">
        <div className="journal-shell">
          <SecondaryHeader kicker="YESTERDAY'S SOLUTION" title="Daily Riddle" closeHref="/" closeLabel="Close solution" />
          <section className="no-reveal">
            <span>?</span>
            <h1>No unlocked answer yet.</h1>
            <p>Yesterday&apos;s solution appears here only after the daily rollover.</p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="journal-page solution-page">
      <div className="journal-shell">
        <SecondaryHeader kicker="YESTERDAY'S SOLUTION" title={r.title} closeHref="/" closeLabel="Close solution" />

        <section className="solution-heading">
          <span className="tiny-kicker">YESTERDAY&apos;S SOLUTION · #{String(r.id).padStart(3,"0")}</span>
          <h1>{r.title}</h1>
          <p>Here&apos;s how it works.</p>
          <svg className="solution-scribble" viewBox="0 0 170 38" aria-hidden="true"><path d="M5 25c39-21 84-23 156-7M144 8l18 10-15 11"/></svg>
        </section>

        <section className="solution-paper">
          <span className="paper-tape solution-tape" aria-hidden="true"/>
          <p className="solution-lead">{r.solution}</p>
          {r.visualizer === "lock" || r.visualizer === "cabinets" ? (
            <Link className="watch-solution-button" href={`/riddle/${r.id}`}>
              <span className="watch-play-icon">↻</span>
              <span><strong>Replay interactive puzzle</strong><small>Try yesterday&apos;s challenge again.</small></span>
              <span className="watch-arrow">→</span>
            </Link>
          ) : (
            <Link className="watch-solution-button" href="/yesterday/play">
              <span className="watch-play-icon">▶</span>
              <span><strong>Play solving animation</strong><small>Watch the puzzle solve itself step by step.</small></span>
              <span className="watch-arrow">→</span>
            </Link>
          )}
          <div className="solution-rule"><span>STEP BY STEP</span></div>
          <div className="solution-steps">
            {r.steps.map((step,index)=>(
              <div className="solution-step" key={step}>
                <span className="step-num">{index+1}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
