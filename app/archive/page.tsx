import Link from "next/link";
import { RIDDLES, START_DAY, currentDayKey, dayDiff } from "../lib/riddles";
import SoundToggle from "../components/SoundToggle";

export default function ArchivePage() {
  const publishedCount = Math.max(0, Math.min(RIDDLES.length, dayDiff(START_DAY, currentDayKey(new Date()))));
  const published = RIDDLES.slice(0, publishedCount);

  return (
    <main className="journal-page archive-page">
      <div className="journal-shell">
        <header className="journal-topbar">
          <Link href="/" className="journal-brand">Daily Riddle</Link>
          <div className="topbar-actions"><SoundToggle compact /><Link className="ghost mini" href="/">Today</Link></div>
        </header>

        <section className="archive-heading">
          <span className="tiny-kicker">PUZZLE JOURNAL</span>
          <h1>Past riddles</h1>
          <p>Only challenges that have already been published. No peeking ahead.</p>
          <svg viewBox="0 0 120 56" aria-hidden="true"><path d="M6 36c28-24 60-30 103-21M94 7l16 8-12 12"/></svg>
        </section>

        <div className="archive-list">
          {published.length === 0 ? <p className="subtle">No past riddles yet.</p> : null}
          {published.map((r,index)=>(
            <article className="archive-entry" key={r.id}>
              <span className="archive-index">{String(index+1).padStart(2,"0")}</span>
              <div>
                <span className="archive-meta">#{String(r.id).padStart(3,"0")} · {r.category} · {r.difficulty}</span>
                <h2>{r.title}</h2>
              </div>
              <span className="archive-mark" aria-hidden="true">{index % 2 === 0 ? "○" : "✦"}</span>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
