import Link from "next/link";
import { getPreviousRiddle } from "../../lib/riddles";
import SolutionReplay from "./SolutionReplay";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function YesterdayPlayPage() {
  const riddle = getPreviousRiddle(new Date());

  if (!riddle) {
    return <main className="empty-day"><div><span>?</span><h1>No unlocked solution yet.</h1><p>The visual walkthrough appears after the daily rollover.</p><Link className="ghost" href="/">Back home</Link></div></main>;
  }

  if (riddle.visualizer === "lock") {
    return <main className="empty-day"><div><span>?</span><h1>No replay available.</h1><p>This test puzzle is not part of the permanent published history.</p><Link className="ghost" href="/">Back home</Link></div></main>;
  }

  return <SolutionReplay type={riddle.visualizer} title={riddle.title} />;
}
