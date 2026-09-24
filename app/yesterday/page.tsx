import Link from "next/link";
import { getPreviousRiddle } from "../lib/riddles";

export default function YesterdayPage(){
  const r=getPreviousRiddle(new Date());
  if(!r)return <main className="shell"><div className="card empty"><h1>No unlocked answer yet.</h1><Link className="ghost" href="/">Back</Link></div></main>;
  return <main className="shell"><div className="kicker">Yesterday&apos;s answer · #{r.id}</div><h1>{r.title}</h1><section className="card"><p className="question">{r.solution}</p><h2 className="section-title">How it works</h2>{r.steps.map((s,i)=><div className="solution-step" key={s}><span className="step-num">{i+1}</span><div>{s}</div></div>)}</section><div style={{marginTop:12}}><Link className="ghost" href="/">Today&apos;s riddle</Link></div></main>;
}
