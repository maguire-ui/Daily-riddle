import { notFound } from "next/navigation";
import SecondaryHeader from "../../components/SecondaryHeader";
import PuzzleClient from "../../visualize/PuzzleClient";
import { RIDDLES, START_DAY, currentDayKey, dayDiff } from "../../lib/riddles";

export default async function PastRiddlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  const publishedCount = Math.max(
    0,
    Math.min(RIDDLES.length, dayDiff(START_DAY, currentDayKey(new Date())))
  );

  const index = RIDDLES.findIndex((riddle) => riddle.id === id);
  if (!Number.isInteger(id) || index < 0 || index >= publishedCount) notFound();

  const riddle = RIDDLES[index];

  return (
    <main className={`past-riddle-page riddle-theme riddle-${riddle.id}`}>
      <div className="past-riddle-shell">
        <SecondaryHeader
          kicker={`PAST RIDDLE · #${String(riddle.id).padStart(3, "0")}`}
          title={riddle.title}
          closeHref="/archive"
          closeLabel="Close past riddle"
        />

        <section className="past-riddle-intro">
          <span className="tiny-kicker">REPLAY CHALLENGE</span>
          <h1>{riddle.title}</h1>
          <div className="past-riddle-meta">
            <span>{riddle.category}</span><i/><span>{riddle.difficulty}</span>
          </div>
          <p>{riddle.question}</p>
        </section>

        <section className="past-riddle-game">
          <PuzzleClient type={riddle.visualizer} riddleId={riddle.id} embedded />
        </section>
      </div>
    </main>
  );
}
