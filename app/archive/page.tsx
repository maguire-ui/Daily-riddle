import Link from "next/link";
import { RIDDLES, START_DAY, currentDayKey, dayDiff } from "../lib/riddles";

export default function ArchivePage(){
  const publishedCount=Math.max(0,Math.min(RIDDLES.length,dayDiff(START_DAY,currentDayKey(new Date()))+1));
  const published=RIDDLES.slice(0,publishedCount);
  return <main className="shell"><div className="topbar"><div className="brand">Archive</div><Link className="nav-button" href="/">Today</Link></div><h1>Past riddles</h1>{published.map(r=><section className="card" key={r.id} style={{marginBottom:12}}><div className="kicker">Riddle #{r.id} · {r.difficulty}</div><h2>{r.title}</h2><p className="subtle">{r.category}</p></section>)}</main>;
}
