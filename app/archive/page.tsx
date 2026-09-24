import Link from "next/link";
import { RIDDLES, START_DAY, currentDayKey, dayDiff } from "../lib/riddles";
import SecondaryHeader from "../components/SecondaryHeader";

export default function ArchivePage() {
  const publishedCount = Math.max(0, Math.min(RIDDLES.length, dayDiff(START_DAY, currentDayKey(new Date()))));
  const published = RIDDLES.slice(0, publishedCount);

  return (
    <main className="journal-page archive-page">
      <div className="journal-shell">
        <SecondaryHeader kicker="PUZZLE JOURNAL" title="Past riddles" closeHref="/" closeLabel="Close archive" />

        <section className="archive-heading">
          <span className="tiny-kicker">PUZZLE JOURNAL</span>
          <h1>Past riddles</h1>
          <p>Only challenges that have already been published. Replay any of them whenever you want.</p>
          <svg viewBox="0 0 120 56" aria-hidden="true"><path d="M6 36c28-24 60-30 103-21M94 7l16 8-12 12"/></svg>
        </section>

        <div className="archive-list">
          {published.length === 0 ? <p className="subtle">No past riddles yet.</p> : null}
          {published.map((r,index)=>(
            <Link
              className="archive-entry archive-replay-entry"
              key={r.id}
              href={`/riddle/${r.id}`}
              aria-label={`Replay ${r.title}`}
            >
              <span className="archive-index">{String(index+1).padStart(2,"0")}</span>
              <div>
                <span className="archive-meta">#{String(r.id).padStart(3,"0")} · {r.category} · {r.difficulty}</span>
                <h2>{r.title}</h2>
                <small className="archive-replay-label">Replay interactive puzzle</small>
              </div>
              <span className="archive-mark replay-mark" aria-hidden="true">↻</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
