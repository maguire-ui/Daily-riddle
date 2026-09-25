import Link from "next/link";
import { RIDDLES, getPreviousRiddle, isRiddlePublished } from "../../lib/riddles";
import SolutionReplay from "./SolutionReplay";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function YesterdayPlayPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const raw = Array.isArray(query.riddle) ? query.riddle[0] : query.riddle;
  const requestedId = Number(raw);

  const requested =
    Number.isInteger(requestedId) && isRiddlePublished(requestedId, new Date())
      ? RIDDLES.find((item) => item.id === requestedId) ?? null
      : null;

  const riddle = requested ?? getPreviousRiddle(new Date());

  if (!riddle) {
    return <main className="empty-day"><div><span>?</span><h1>No unlocked solution yet.</h1><p>The visual walkthrough appears after the daily rollover.</p><Link className="ghost" href="/">Back home</Link></div></main>;
  }

  if (riddle.visualizer === "lock" || riddle.visualizer === "cabinets") {
    return <main className="empty-day"><div><span>?</span><h1>Animated walkthrough coming soon.</h1><p>The full written solution is available, and the interactive puzzle can still be replayed from Past riddles.</p><Link className="ghost" href="/yesterday">Back to solution</Link></div></main>;
  }

  return <SolutionReplay type={riddle.visualizer} title={riddle.title} />;
}
