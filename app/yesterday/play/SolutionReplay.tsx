"use client";

import { useEffect, useMemo, useState } from "react";
import { playUiSound } from "../../components/SoundToggle";
import SecondaryHeader from "../../components/SecondaryHeader";

type ReplayType = "rope" | "coins" | "bridge" | "switches";

type ReplayStep = {
  title: string;
  text: string;
};

const COPY: Record<ReplayType, ReplayStep[]> = {
  coins: [
    { title: "Start with 24 possibilities", text: "Any one of the 12 coins could be heavy or light. This replay follows one complete branch where Coin 6 is lighter." },
    { title: "Weigh 1–4 against 5–8", text: "The left side drops. That means either 1–4 contains a heavy coin, or 5–8 contains a light coin." },
    { title: "Rearrange the suspects", text: "Weigh 1, 2, 5, 7 against 3, 6, 9, 10. Coins 9 and 10 are known-good references." },
    { title: "Use the third weighing", text: "The left side drops again. Now the candidates are Coin 1 heavy, Coin 2 heavy, or Coin 6 light. Weigh 1 against 2." },
    { title: "The scale balances", text: "Coins 1 and 2 are normal, so Coin 6 must be the counterfeit—and it must be lighter." },
  ],
  rope: [
    { title: "Light three ends at once", text: "Light both ends of Rope A and one end of Rope B at the same moment." },
    { title: "Wait for Rope A to finish", text: "Rope A burns from both ends, so its full 60-minute burn is compressed into 30 minutes." },
    { title: "Light Rope B's other end", text: "The instant Rope A finishes, ignite the unlit end of Rope B." },
    { title: "Rope B finishes 15 minutes later", text: "Half of Rope B's burn-time remains, but it is now burning from both ends. Total elapsed time: exactly 45 minutes." },
  ],
  bridge: [
    { title: "Send 1 and 2 across", text: "They cross together in 2 minutes." },
    { title: "Send 1 back", text: "The 1-minute traveler returns with the flashlight. Total: 3 minutes." },
    { title: "Send 7 and 10 across", text: "The two slowest cross together in 10 minutes. Total: 13 minutes." },
    { title: "Send 2 back", text: "The 2-minute traveler returns with the flashlight. Total: 15 minutes." },
    { title: "Send 1 and 2 across again", text: "They finish the crossing in 2 more minutes. Everyone is across in exactly 17." },
  ],
  switches: [
    { title: "Turn Switch 1 on", text: "Leave it on long enough for the bulb to heat up." },
    { title: "Turn Switch 1 off", text: "The bulb goes dark, but it stays warm for a while." },
    { title: "Turn Switch 2 on", text: "Now enter the room—this is your one allowed visit." },
    { title: "Read the bulb", text: "Lit means Switch 2. Off but warm means Switch 1. Off and cool means Switch 3." },
  ],
};

function CoinReplay({ step }: { step: number }) {
  const states = [
    { left: [] as number[], right: [] as number[], outcome: "READY", final: false },
    { left: [1,2,3,4], right: [5,6,7,8], outcome: "LEFT HEAVIER", final: false },
    { left: [1,2,5,7], right: [3,6,9,10], outcome: "LEFT HEAVIER", final: false },
    { left: [1], right: [2], outcome: "BALANCED", final: false },
    { left: [1], right: [2], outcome: "COIN 6 IS LIGHT", final: true },
  ];
  const state = states[Math.min(step, states.length - 1)];
  const onScale = new Set([...state.left, ...state.right]);
  const bench = Array.from({length:12},(_,i)=>i+1).filter(n=>!onScale.has(n));

  return (
    <div className="solution-replay-scene coin-replay-scene">
      <div className="replay-scale-status">{state.outcome}</div>
      <div className={`replay-scale ${state.outcome === "LEFT HEAVIER" ? "left-down" : state.outcome === "RIGHT HEAVIER" ? "right-down" : ""}`}>
        <div className="replay-scale-post"/>
        <div className="replay-scale-beam"><i/></div>
        <div className="replay-pans">
          <div className="replay-pan"><span>LEFT</span><div>{state.left.map(n=><b key={n} className="replay-coin">{n}</b>)}</div></div>
          <div className="replay-pan"><span>RIGHT</span><div>{state.right.map(n=><b key={n} className="replay-coin">{n}</b>)}</div></div>
        </div>
      </div>
      <div className="replay-coin-bench">
        {bench.map(n=><span key={n} className={`replay-coin ${state.final && n === 6 ? "identified" : ""}`}>{n}</span>)}
      </div>
      {state.final ? <div className="replay-diagnosis">✓ Coin 6 is the lighter counterfeit</div> : null}
      <small className="branch-note">Example branch shown: Coin 6 is lighter. Other outcomes follow the same decision-tree idea.</small>
    </div>
  );
}

function BridgeReplay({ step }: { step: number }) {
  const states = [
    { left:[7,10], right:[1,2], returning:false, label:"1 + 2 cross", time:2 },
    { left:[1,7,10], right:[2], returning:true, label:"1 returns", time:3 },
    { left:[1], right:[2,7,10], returning:false, label:"7 + 10 cross", time:13 },
    { left:[1,2], right:[7,10], returning:true, label:"2 returns", time:15 },
    { left:[], right:[1,2,7,10], returning:false, label:"1 + 2 cross", time:17 },
  ];
  const s=states[Math.min(step,states.length-1)];
  return (
    <div className="solution-replay-scene bridge-replay-scene">
      <div className="replay-night"><span className="replay-moon"/><i/><i/><i/></div>
      <div className="replay-bank left"><small>START</small><div>{s.left.map(n=><span key={n} className="replay-person">{n}<em>min</em></span>)}</div></div>
      <div className="replay-bridge"><span className="replay-flashlight" data-side={s.returning ? "left" : "right"}/><div className="replay-bridge-deck"/></div>
      <div className="replay-bank right"><small>FINISH</small><div>{s.right.map(n=><span key={n} className="replay-person">{n}<em>min</em></span>)}</div></div>
      <div className="replay-time-chip">{s.time}:00</div>
      <div className="replay-move-label">{s.label}</div>
    </div>
  );
}

function RopeReplay({ step }: { step: number }) {
  const stages = [
    { aL:true,aR:true,bL:true,bR:false,a:0,b:0,label:"Light A at both ends + B at one end" },
    { aL:true,aR:true,bL:true,bR:false,a:100,b:50,label:"Rope A burns out" },
    { aL:false,aR:false,bL:true,bR:true,a:100,b:50,label:"Light the other end of Rope B" },
    { aL:false,aR:false,bL:true,bR:true,a:100,b:100,label:"Rope B finishes — exactly 45 minutes" },
  ];
  const s=stages[Math.min(step,stages.length-1)];
  return (
    <div className="solution-replay-scene rope-replay-scene">
      {(["A","B"] as const).map(id=>{
        const pct=id==="A"?s.a:s.b;
        const left=id==="A"?s.aL:s.bL;
        const right=id==="A"?s.aR:s.bR;
        return <div className="replay-rope-row" key={id}>
          <strong>ROPE {id}</strong>
          <span className={`replay-flame ${left?"lit":""}`}>◆</span>
          <div className="replay-rope"><i style={{width:`${pct}%`}}/></div>
          <span className={`replay-flame ${right?"lit":""}`}>◆</span>
        </div>;
      })}
      <div className="replay-move-label">{s.label}</div>
    </div>
  );
}

function SwitchReplay({ step }: { step: number }) {
  const states = [
    { one:true,two:false,door:false,bulb:false,warm:false,label:"Switch 1 ON — wait" },
    { one:false,two:false,door:false,bulb:false,warm:true,label:"Switch 1 OFF — bulb stays warm" },
    { one:false,two:true,door:false,bulb:true,warm:true,label:"Switch 2 ON" },
    { one:false,two:true,door:true,bulb:true,warm:true,label:"Enter once and inspect the bulb" },
  ];
  const s=states[Math.min(step,states.length-1)];
  return (
    <div className="solution-replay-scene switch-replay-scene">
      <div className="replay-switch-bank">
        {[1,2,3].map(n=>{
          const on=n===1?s.one:n===2?s.two:false;
          return <div className={`replay-switch ${on?"on":""}`} key={n}><span><i/></span><strong>{n}</strong></div>;
        })}
      </div>
      <div className={`replay-room ${s.door?"open":""}`}>
        <div className="replay-door">ROOM</div>
        <div className={`replay-bulb ${s.bulb?"on":""} ${s.warm?"warm":""}`}>💡</div>
      </div>
      <div className="replay-move-label">{s.label}</div>
    </div>
  );
}

export default function SolutionReplay({ type, title }: { type: ReplayType; title: string }) {
  const steps = COPY[type];
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    if (step >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => setStep(value => Math.min(steps.length - 1, value + 1)), 2200);
    return () => window.clearTimeout(timer);
  }, [playing, step, steps.length]);

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step, steps.length]);

  function restart() {
    playUiSound("tap");
    setStep(0);
    setPlaying(true);
  }

  function move(delta:number) {
    playUiSound("tap");
    setPlaying(false);
    setStep(value => Math.max(0, Math.min(steps.length - 1, value + delta)));
  }

  return (
    <main className="solution-player-page">
      <div className="solution-player-header-wrap">
        <SecondaryHeader kicker="VISUAL WALKTHROUGH" title={title} closeHref="/yesterday" closeLabel="Close solution animation" />
      </div>

      <div className="solution-player-shell">
        <section className="solution-player-copy">
          <span className="tiny-kicker">STEP {step + 1} OF {steps.length}</span>
          <h1>{steps[step].title}</h1>
          <p>{steps[step].text}</p>
        </section>

        <section className="solution-player-canvas" aria-live="polite">
          {type === "coins" ? <CoinReplay step={step}/> : null}
          {type === "bridge" ? <BridgeReplay step={step}/> : null}
          {type === "rope" ? <RopeReplay step={step}/> : null}
          {type === "switches" ? <SwitchReplay step={step}/> : null}
        </section>

        <div className="solution-progress"><i style={{width:`${progress}%`}}/></div>

        <div className="solution-player-controls">
          <button type="button" onClick={()=>move(-1)} disabled={step===0}>← Previous</button>
          <button className="play-solution-button" type="button" onClick={()=>{
            playUiSound("tap");
            if (step === steps.length - 1 && !playing) setStep(0);
            setPlaying(value=>!value);
          }}>{playing ? "Pause" : "▶ Play"}</button>
          <button type="button" onClick={()=>move(1)} disabled={step===steps.length-1}>Next →</button>
          <button className="replay-solution-button" type="button" onClick={restart}>↻ Replay</button>
        </div>
      </div>
    </main>
  );
}
