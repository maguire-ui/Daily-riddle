"use client";
import Link from "next/link";
import { useState } from "react";

export default function PuzzleClient({ type, riddleId }: { type:"rope"|"coins"|"bridge"; riddleId:number }) {
  const [lit, setLit] = useState<string[]>([]);
  const [phase, setPhase] = useState(0);
  const [selected, setSelected] = useState<number|null>(null);
  const [left, setLeft] = useState<number[]>([]);
  const [right, setRight] = useState<number[]>([]);
  const [weighings, setWeighings] = useState<string[]>([]);
  const [finalCoin, setFinalCoin] = useState<number|null>(null);
  const [heavyLight, setHeavyLight] = useState<"heavy"|"light">("heavy");
  const [message, setMessage] = useState("");

  const markSolved = () => localStorage.setItem(`daily-riddle-${riddleId}`, JSON.stringify({ solved:true, guesses:0 }));

  if (type === "rope") {
    const ignite = (key:string) => {
      const next = Array.from(new Set([...lit,key]));
      setLit(next);
      if (phase===0 && next.includes("A-L") && next.includes("A-R") && (next.includes("B-L") || next.includes("B-R"))) {
        setPhase(1); setMessage("Rope A is burning from both ends. Rope B is burning from one end.");
      } else if (phase===1 && next.length===4) {
        setPhase(2); setMessage("Correct sequence! 30 minutes + 15 minutes = 45 minutes."); markSolved();
      }
    };
    return <div className="puzzle">
      <div className="card">
        <p className="subtle">Tap rope ends to ignite them. The visual burn is intentionally uneven.</p>
        {["A","B"].map(r=><div key={r}>
          <div className="rope-row">
            <button className={"rope-end "+(lit.includes(`${r}-L`)?"lit":"")} onClick={()=>ignite(`${r}-L`)}>Light {r} left</button>
            <strong>Rope {r}</strong>
            <button className={"rope-end "+(lit.includes(`${r}-R`)?"lit":"")} onClick={()=>ignite(`${r}-R`)}>Light {r} right</button>
          </div>
          <div className={"rope "+(lit.some(x=>x.startsWith(r))?"burning":"")} />
        </div>)}
        {message && <div className={phase===2?"result good":"result"}>{message}</div>}
        <div className="toolbar"><button className="small" onClick={()=>{setLit([]);setPhase(0);setMessage("")}}>Reset</button></div>
      </div>
      <Link className="ghost" href="/">Back to riddle</Link>
    </div>;
  }

  if (type === "coins") {
    const place=(side:"left"|"right")=>{
      if(selected==null)return;
      setLeft(a=>a.filter(x=>x!==selected)); setRight(a=>a.filter(x=>x!==selected));
      side==="left"?setLeft(a=>[...a,selected]):setRight(a=>[...a,selected]); setSelected(null);
    };
    const weigh=()=>{
      if(weighings.length>=3)return;
      // Deterministic hidden demo state: coin 6 is lighter.
      const weight=(arr:number[])=>arr.reduce((s,n)=>s+(n === 6 ? 0.8 : 1),0);
      const l=weight(left),r=weight(right);
      const outcome=Math.abs(l-r)<.01?"Balance":l>r?"Left heavier":"Right heavier";
      setWeighings(w=>[...w,outcome]); setLeft([]);setRight([]);
    };
    const submit=()=>{
      if(finalCoin===6&&heavyLight==="light"){setMessage("Correct! Coin 6 is the lighter counterfeit.");markSolved()}
      else setMessage("Not quite. Reset or use the remaining weighings and try again.");
    };
    const available=Array.from({length:12},(_,i)=>i+1).filter(n=>!left.includes(n)&&!right.includes(n));
    return <div className="puzzle card">
      <p className="subtle">Tap a coin, then tap a tray. You get three weighings.</p>
      <div className="coins">{available.map(n=><button key={n} className={"coin "+(selected===n?"selected":"")} onClick={()=>setSelected(n)}>{n}</button>)}</div>
      <div className="scale">
        <button className="tray" onClick={()=>place("left")}><strong>LEFT TRAY</strong><div className="coins">{left.map(n=><span className="coin" key={n}>{n}</span>)}</div></button>
        <button className="tray" onClick={()=>place("right")}><strong>RIGHT TRAY</strong><div className="coins">{right.map(n=><span className="coin" key={n}>{n}</span>)}</div></button>
      </div>
      <div className="toolbar">
        <button className="small" onClick={weigh} disabled={weighings.length>=3}>WEIGH ({weighings.length}/3)</button>
        <button className="small" onClick={()=>{setLeft([]);setRight([])}}>Clear trays</button>
      </div>
      <p className="subtle">History: {weighings.join(" · ") || "No weighings yet"}</p>
      <div className="toolbar">
        <select className="small" value={finalCoin??""} onChange={e=>setFinalCoin(Number(e.target.value)||null)} aria-label="Choose counterfeit coin">
          <option value="">Choose coin</option>{Array.from({length:12},(_,i)=><option key={i+1}>{i+1}</option>)}
        </select>
        <select className="small" value={heavyLight} onChange={e=>setHeavyLight(e.target.value as "heavy"|"light")}><option value="heavy">Heavier</option><option value="light">Lighter</option></select>
        <button className="primary" onClick={submit}>SUBMIT SOLUTION</button>
      </div>
      {message&&<div className={message.startsWith("Correct")?"result good":"result bad"}>{message}</div>}
      <Link className="ghost" href="/">Back to riddle</Link>
    </div>;
  }

  return <div className="card"><p className="question">Bridge visualization: move the 1, 2, 7 and 10 minute travelers across with the flashlight in no more than 17 minutes.</p><p className="subtle">Full interactive bridge controls are coming in the next build.</p><Link className="ghost" href="/">Back</Link></div>;
}
