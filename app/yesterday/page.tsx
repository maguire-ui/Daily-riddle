import Link from "next/link";
import { getPreviousRiddle } from "../lib/riddles";
import SoundToggle from "../components/SoundToggle";

export default function YesterdayPage() {
  const r = getPreviousRiddle(new Date());

  if (!r) {
    return (
      <main className="journal-page">
        <div className="journal-shell">
          <header className="journal-topbar">
            <Link href="/" className="journal-brand">Daily Riddle</Link>
            <SoundToggle compact />
          </header>
          <section className="no-reveal">
            <span>?</span>
            <h1>No unlocked answer yet.</h1>
            <p>Yesterday&apos;s solution appears here only after the daily rollover.</p>
            <Link className="ghost" href="/">Back to today</Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="journal-page solution-page">
      <div className="journal-shell">
        <header className="journal-topbar">
          <Link href="/" className="journal-brand">Daily Riddle</Link>
          <div className="topbar-actions"><SoundToggle compact /><Link className="ghost mini" href="/">Today</Link></div>
        </header>

        <section className="solution-heading">
          <span className="tiny-kicker">YESTERDAY&apos;S SOLUTION · #{String(r.id).padStart(3,"0")}</span>
          <h1>{r.title}</h1>
          <p>Here&apos;s how it works.</p>
          <svg className="solution-scribble" viewBox="0 0 170 38" aria-hidden="true"><path d="M5 25c39-21 84-23 156-7M144 8l18 10-15 11"/></svg>
        </section>

        <section className="solution-paper">
          <span className="paper-tape solution-tape" aria-hidden="true"/>
          <p className="solution-lead">{r.solution}</p>
          <Link className="watch-solution-button" href="/yesterday/play">
            <span className="watch-play-icon">▶</span>
            <span><strong>Play solving animation</strong><small>Watch the puzzle solve itself step by step.</small></span>
            <span className="watch-arrow">→</span>
          </Link>
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

        <Link className="back-journal" href="/">← Back to today&apos;s riddle</Link>
      </div>
    </main>
  );
}
