"use client";

import Link from "next/link";
import { CSSProperties, useEffect, useRef, useState } from "react";

type PuzzleType = "rope" | "coins" | "bridge";

function saveSolved(riddleId: number) {
  const key = `daily-riddle-${riddleId}`;
  let saved: Record<string, unknown> = {};
  try {
    saved = JSON.parse(localStorage.getItem(key) || "{}");
  } catch {}
  localStorage.setItem(key, JSON.stringify({ ...saved, solved: true }));
}

function formatPuzzleTime(value: number) {
  const mins = Math.max(0, Math.floor(value));
  const secs = Math.max(0, Math.min(59, Math.floor((value - mins) * 60)));
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function StatusIcon({ kind }: { kind: "time" | "moves" | "target" }) {
  if (kind === "time") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="7.5"/><path d="M12 9v4.5l3 1.5M9 3h6M12 3v2"/></svg>;
  }
  if (kind === "moves") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h11M13 4l3 3-3 3M19 17H8M11 14l-3 3 3 3"/></svg>;
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/></svg>;
}

type RopeEndState = {
  leftLit: boolean;
  rightLit: boolean;
  burnedLeft: number;
  burnedRight: number;
  doneAt: number | null;
};

type RopeGame = {
  simTime: number;
  paused: boolean;
  ropes: Record<"A" | "B", RopeEndState>;
};

const freshRope = (): RopeEndState => ({
  leftLit: false,
  rightLit: false,
  burnedLeft: 0,
  burnedRight: 0,
  doneAt: null,
});

function RopePuzzle({ riddleId }: { riddleId: number }) {
  const [speed, setSpeed] = useState(1);
  const [game, setGame] = useState<RopeGame>({
    simTime: 0,
    paused: false,
    ropes: { A: freshRope(), B: freshRope() },
  });
  const [log, setLog] = useState<string[]>(["Simulation ready. Light any rope end to start the clock."]);
  const [solved, setSolved] = useState(false);
  const lastTick = useRef(0);
  const seenDone = useRef<Record<"A" | "B", number | null>>({ A: null, B: null });

  useEffect(() => {
    lastTick.current = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const realSeconds = Math.min(0.25, (now - lastTick.current) / 1000);
      lastTick.current = now;

      setGame((prev) => {
        if (prev.paused) return prev;

        const hasBurning = (["A", "B"] as const).some((id) => {
          const rope = prev.ropes[id];
          return rope.doneAt === null && (rope.leftLit || rope.rightLit);
        });
        if (!hasBurning) return prev;

        const simDelta = realSeconds * speed;
        const nextTime = prev.simTime + simDelta;
        const nextRopes = { ...prev.ropes };

        for (const id of ["A", "B"] as const) {
          const rope = prev.ropes[id];
          if (rope.doneAt !== null || (!rope.leftLit && !rope.rightLit)) continue;

          const leftAdd = rope.leftLit ? simDelta : 0;
          const rightAdd = rope.rightLit ? simDelta : 0;
          const before = rope.burnedLeft + rope.burnedRight;
          const requested = leftAdd + rightAdd;
          const available = Math.max(0, 60 - before);
          const factor = requested > 0 ? Math.min(1, available / requested) : 0;

          const burnedLeft = rope.burnedLeft + leftAdd * factor;
          const burnedRight = rope.burnedRight + rightAdd * factor;
          const finished = burnedLeft + burnedRight >= 59.999;
          let doneAt: number | null = rope.doneAt;

          if (finished && doneAt === null) {
            const rate = (rope.leftLit ? 1 : 0) + (rope.rightLit ? 1 : 0);
            doneAt = prev.simTime + (60 - before) / Math.max(1, rate);
          }

          nextRopes[id] = { ...rope, burnedLeft, burnedRight, doneAt };
        }

        return { ...prev, simTime: nextTime, ropes: nextRopes };
      });
    }, 100);

    return () => window.clearInterval(timer);
  }, [speed]);

  useEffect(() => {
    for (const id of ["A", "B"] as const) {
      const doneAt = game.ropes[id].doneAt;
      if (doneAt !== null && seenDone.current[id] === null) {
        seenDone.current[id] = doneAt;
        setLog((items) => [`Rope ${id} finished at ${formatPuzzleTime(doneAt)}.`, ...items].slice(0, 6));
        if (Math.abs(doneAt - 45) < 0.2) {
          setSolved(true);
          saveSolved(riddleId);
        }
      }
    }
  }, [game.ropes, riddleId]);

  function ignite(id: "A" | "B", end: "left" | "right") {
    setGame((prev) => {
      const rope = prev.ropes[id];
      if (rope.doneAt !== null) return prev;
      const key = end === "left" ? "leftLit" : "rightLit";
      if (rope[key]) return prev;
      return {
        ...prev,
        ropes: { ...prev.ropes, [id]: { ...rope, [key]: true } },
      };
    });
    setLog((items) => [`Lit Rope ${id} — ${end} end at ${formatPuzzleTime(game.simTime)}.`, ...items].slice(0, 6));
  }

  function reset() {
    seenDone.current = { A: null, B: null };
    setSolved(false);
    setGame({ simTime: 0, paused: false, ropes: { A: freshRope(), B: freshRope() } });
    setLog(["Simulation reset."]);
  }

  const isRunning = (["A", "B"] as const).some((id) => {
    const rope = game.ropes[id];
    return rope.doneAt === null && (rope.leftLit || rope.rightLit);
  });

  return (
    <div className="puzzle-shell">
      <div className="puzzle-hud" aria-label="Simulation status">
        <div className="hud-stat">
          <span className="hud-icon"><StatusIcon kind="time" /></span>
          <span><small>PUZZLE CLOCK</small><strong>{formatPuzzleTime(game.simTime)}</strong></span>
        </div>
        <div className="hud-stat">
          <span className="hud-icon"><StatusIcon kind="target" /></span>
          <span><small>TARGET</small><strong>45:00</strong></span>
        </div>
        <div className="hud-stat">
          <span className="hud-icon"><StatusIcon kind="moves" /></span>
          <span><small>TIME SCALE</small><strong>{speed}×</strong></span>
        </div>
      </div>

      <section className="game-stage rope-stage">
        <div className="stage-head">
          <div>
            <span className="stage-label">TIMING LAB</span>
            <h2>Two uneven-burning ropes</h2>
          </div>
          <span className={`live-pill ${isRunning && !game.paused ? "active" : ""}`}>
            <i /> {game.paused ? "PAUSED" : isRunning ? "RUNNING" : "READY"}
          </span>
        </div>

        <div className="speed-control" aria-label="Simulation speed">
          <span>Simulation speed</span>
          <div className="segmented">
            {[1, 2, 4].map((value) => (
              <button key={value} className={speed === value ? "selected" : ""} onClick={() => setSpeed(value)}>
                {value}×
              </button>
            ))}
          </div>
          <small>At 1×, one real second represents one puzzle minute.</small>
        </div>

        <div className="rope-bay">
          {(["A", "B"] as const).map((id) => {
            const rope = game.ropes[id];
            const leftPct = Math.min(100, (rope.burnedLeft / 60) * 100);
            const rightPct = Math.min(100, (rope.burnedRight / 60) * 100);
            const ropeStyle = {
              "--burn-left": `${leftPct}%`,
              "--burn-right": `${rightPct}%`,
            } as CSSProperties;

            return (
              <div className="rope-unit" key={id}>
                <div className="rope-unit-head">
                  <span className="rope-name">ROPE {id}</span>
                  <span className="rope-status">
                    {rope.doneAt !== null ? `FINISHED · ${formatPuzzleTime(rope.doneAt)}` : `${Math.max(0, Math.round(60 - rope.burnedLeft - rope.burnedRight))} MIN REMAINING`}
                  </span>
                </div>
                <div className="rope-control-row">
                  <button className={`igniter ${rope.leftLit ? "lit" : ""}`} disabled={rope.leftLit || rope.doneAt !== null} onClick={() => ignite(id, "left")}>
                    <span className="flame">◆</span><span>LEFT END</span>
                  </button>

                  <div className="rope-graphic" style={ropeStyle}>
                    <div className="rope-cord" />
                    <div className="rope-char rope-char-left" />
                    <div className="rope-char rope-char-right" />
                    {rope.leftLit && rope.doneAt === null ? <span className="rope-flame left">◆</span> : null}
                    {rope.rightLit && rope.doneAt === null ? <span className="rope-flame right">◆</span> : null}
                  </div>

                  <button className={`igniter ${rope.rightLit ? "lit" : ""}`} disabled={rope.rightLit || rope.doneAt !== null} onClick={() => ignite(id, "right")}>
                    <span className="flame">◆</span><span>RIGHT END</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {solved ? (
          <div className="success-banner" role="status">
            <span className="success-mark">✓</span>
            <div><strong>45 minutes measured.</strong><small>The interactive puzzle is complete.</small></div>
          </div>
        ) : null}

        <div className="control-dock">
          <button className="control-button" onClick={() => setGame((prev) => ({ ...prev, paused: !prev.paused }))} disabled={!isRunning}>
            {game.paused ? "Resume" : "Pause"}
          </button>
          <button className="control-button danger-lite" onClick={reset}>Reset simulation</button>
        </div>
      </section>

      <section className="telemetry-card">
        <div className="telemetry-head"><span>EVENT LOG</span><span>LIVE</span></div>
        <div className="event-log">
          {log.map((item, index) => <div key={`${item}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></div>)}
        </div>
      </section>
    </div>
  );
}

type HiddenCoin = { coin: number; polarity: "heavy" | "light" };

function CoinsPuzzle({ riddleId }: { riddleId: number }) {
  const [hidden, setHidden] = useState<HiddenCoin | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [left, setLeft] = useState<number[]>([]);
  const [right, setRight] = useState<number[]>([]);
  const [snapshots, setSnapshots] = useState<Array<{ left: number[]; right: number[] }>>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [lastOutcome, setLastOutcome] = useState<"balance" | "left" | "right" | null>(null);
  const [finalCoin, setFinalCoin] = useState<number | null>(null);
  const [heavyLight, setHeavyLight] = useState<"heavy" | "light">("heavy");
  const [message, setMessage] = useState("");

  function newRound() {
    const values = new Uint32Array(2);
    crypto.getRandomValues(values);
    setHidden({ coin: (values[0] % 12) + 1, polarity: values[1] % 2 === 0 ? "heavy" : "light" });
    setSelected(null);
    setLeft([]);
    setRight([]);
    setSnapshots([]);
    setHistory([]);
    setLastOutcome(null);
    setFinalCoin(null);
    setHeavyLight("heavy");
    setMessage("");
  }

  useEffect(() => {
    newRound();
  }, []);

  function pushSnapshot() {
    setSnapshots((items) => [...items, { left: [...left], right: [...right] }].slice(-20));
  }

  function place(side: "left" | "right") {
    if (selected === null) return;
    pushSnapshot();
    setLeft((items) => items.filter((coin) => coin !== selected));
    setRight((items) => items.filter((coin) => coin !== selected));
    if (side === "left") setLeft((items) => [...items, selected]);
    else setRight((items) => [...items, selected]);
    setSelected(null);
    setLastOutcome(null);
  }

  function returnToBench(coin: number) {
    pushSnapshot();
    setLeft((items) => items.filter((item) => item !== coin));
    setRight((items) => items.filter((item) => item !== coin));
    setLastOutcome(null);
  }

  function undoMove() {
    const previous = snapshots.at(-1);
    if (!previous) return;
    setLeft(previous.left);
    setRight(previous.right);
    setSnapshots((items) => items.slice(0, -1));
    setLastOutcome(null);
  }

  function weigh() {
    if (!hidden || history.length >= 3 || (left.length === 0 && right.length === 0)) return;
    const coinWeight = (coin: number) => {
      if (coin !== hidden.coin) return 1;
      return hidden.polarity === "heavy" ? 1.18 : 0.82;
    };
    const l = left.reduce((sum, coin) => sum + coinWeight(coin), 0);
    const r = right.reduce((sum, coin) => sum + coinWeight(coin), 0);
    const outcome = Math.abs(l - r) < 0.01 ? "balance" : l > r ? "left" : "right";
    const label = outcome === "balance" ? "BALANCED" : outcome === "left" ? "LEFT HEAVIER" : "RIGHT HEAVIER";
    setLastOutcome(outcome);
    setHistory((items) => [...items, label]);
  }

  function submitGuess() {
    if (!hidden || finalCoin === null) return;
    if (hidden.coin === finalCoin && hidden.polarity === heavyLight) {
      setMessage(`Correct — Coin ${hidden.coin} is ${hidden.polarity}.`);
      saveSolved(riddleId);
    } else {
      setMessage("That diagnosis is wrong. Use the scale evidence and try again.");
    }
  }

  const bench = Array.from({ length: 12 }, (_, index) => index + 1).filter((coin) => !left.includes(coin) && !right.includes(coin));
  const tiltClass = lastOutcome === "left" ? "tilt-left" : lastOutcome === "right" ? "tilt-right" : "";

  return (
    <div className="puzzle-shell">
      <div className="puzzle-hud">
        <div className="hud-stat"><span className="hud-icon"><StatusIcon kind="moves" /></span><span><small>WEIGHINGS</small><strong>{history.length} / 3</strong></span></div>
        <div className="hud-stat"><span className="hud-icon"><StatusIcon kind="target" /></span><span><small>STATES</small><strong>24</strong></span></div>
        <div className="hud-stat"><span className="hud-icon"><StatusIcon kind="time" /></span><span><small>ROUND</small><strong>{hidden ? "LIVE" : "..."}</strong></span></div>
      </div>

      <section className="game-stage coin-stage">
        <div className="stage-head">
          <div><span className="stage-label">FORENSIC SCALE</span><h2>Find the counterfeit</h2></div>
          <span className="live-pill active"><i /> CASE ACTIVE</span>
        </div>

        <div className="coin-bench">
          <div className="bench-head"><span>COIN BENCH</span><small>{selected ? `Coin ${selected} selected — choose a tray` : "Tap a coin, then tap a tray"}</small></div>
          <div className="coin-grid">
            {bench.map((coin) => (
              <button key={coin} className={`coin-token ${selected === coin ? "selected" : ""}`} onClick={() => setSelected(selected === coin ? null : coin)}>
                <span>{coin}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={`balance-machine ${tiltClass}`}>
          <div className="scale-outcome">
            {lastOutcome === null ? "READY TO WEIGH" : lastOutcome === "balance" ? "BALANCED" : lastOutcome === "left" ? "LEFT SIDE HEAVIER" : "RIGHT SIDE HEAVIER"}
          </div>
          <div className="scale-beam-wrap">
            <div className="scale-post" />
            <div className="scale-beam">
              <span className="pivot" />
            </div>
          </div>
          <div className="scale-trays">
            <button className="scale-tray" onClick={() => place("left")} aria-label="Place selected coin on left tray">
              <span className="tray-label">LEFT</span>
              <div className="tray-coins">{left.map((coin) => <span role="button" tabIndex={0} key={coin} className="mini-coin" onClick={(event) => { event.stopPropagation(); returnToBench(coin); }}>{coin}</span>)}</div>
            </button>
            <button className="scale-tray" onClick={() => place("right")} aria-label="Place selected coin on right tray">
              <span className="tray-label">RIGHT</span>
              <div className="tray-coins">{right.map((coin) => <span role="button" tabIndex={0} key={coin} className="mini-coin" onClick={(event) => { event.stopPropagation(); returnToBench(coin); }}>{coin}</span>)}</div>
            </button>
          </div>
        </div>

        <div className="control-dock">
          <button className="control-button" onClick={undoMove} disabled={snapshots.length === 0}>Undo move</button>
          <button className="control-button" onClick={() => { pushSnapshot(); setLeft([]); setRight([]); setLastOutcome(null); }}>Clear trays</button>
          <button className="action-button" onClick={weigh} disabled={history.length >= 3 || (left.length === 0 && right.length === 0)}>WEIGH NOW</button>
        </div>

        <div className="weigh-history">
          {[0, 1, 2].map((index) => <div key={index} className={history[index] ? "filled" : ""}><span>0{index + 1}</span><strong>{history[index] || "Awaiting result"}</strong></div>)}
        </div>

        <div className="diagnosis-panel">
          <div><span className="stage-label">FINAL DIAGNOSIS</span><h3>Which coin is fake?</h3></div>
          <div className="diagnosis-controls">
            <select value={finalCoin ?? ""} onChange={(event) => setFinalCoin(Number(event.target.value) || null)} aria-label="Counterfeit coin">
              <option value="">Choose coin</option>
              {Array.from({ length: 12 }, (_, index) => <option value={index + 1} key={index + 1}>Coin {index + 1}</option>)}
            </select>
            <select value={heavyLight} onChange={(event) => setHeavyLight(event.target.value as "heavy" | "light")} aria-label="Counterfeit weight">
              <option value="heavy">Heavier</option>
              <option value="light">Lighter</option>
            </select>
            <button className="action-button" onClick={submitGuess} disabled={finalCoin === null}>LOCK DIAGNOSIS</button>
          </div>
          {message ? <div className={message.startsWith("Correct") ? "success-banner compact" : "error-banner"}>{message}</div> : null}
        </div>

        <button className="text-button" onClick={newRound}>Generate a new hidden counterfeit</button>
      </section>
    </div>
  );
}

type BridgePerson = 1 | 2 | 7 | 10;

function BridgePuzzle({ riddleId }: { riddleId: number }) {
  const [left, setLeft] = useState<BridgePerson[]>([1, 2, 7, 10]);
  const [right, setRight] = useState<BridgePerson[]>([]);
  const [flashlight, setFlashlight] = useState<"left" | "right">("left");
  const [selected, setSelected] = useState<BridgePerson[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [moves, setMoves] = useState<string[]>([]);
  const [moving, setMoving] = useState(false);
  const [message, setMessage] = useState("");

  const activeSide = flashlight === "left" ? left : right;

  function togglePerson(person: BridgePerson) {
    if (moving || !activeSide.includes(person)) return;
    setSelected((items) => items.includes(person) ? items.filter((item) => item !== person) : items.length < 2 ? [...items, person] : items);
  }

  function cross() {
    if (moving || selected.length < 1 || selected.length > 2) return;
    const cost = Math.max(...selected);
    const origin = flashlight;
    const destination = origin === "left" ? "right" : "left";
    setMoving(true);
    setMessage("");

    window.setTimeout(() => {
      if (origin === "left") {
        setLeft((items) => items.filter((person) => !selected.includes(person)));
        setRight((items) => [...items, ...selected].sort((a, b) => a - b) as BridgePerson[]);
      } else {
        setRight((items) => items.filter((person) => !selected.includes(person)));
        setLeft((items) => [...items, ...selected].sort((a, b) => a - b) as BridgePerson[]);
      }

      const nextElapsed = elapsed + cost;
      setElapsed(nextElapsed);
      setMoves((items) => [...items, `${selected.join(" & ")} crossed ${origin === "left" ? "→" : "←"} · +${cost} min`]);
      setFlashlight(destination);
      setSelected([]);
      setMoving(false);

      const everyoneAcross = origin === "left" && left.length === selected.length;
      if (everyoneAcross) {
        if (nextElapsed === 17) {
          setMessage("Perfect — everyone crossed in exactly 17 minutes.");
          saveSolved(riddleId);
        } else {
          setMessage(`Everyone crossed in ${nextElapsed} minutes. The target is exactly 17.`);
        }
      }
    }, 650);
  }

  function reset() {
    setLeft([1, 2, 7, 10]);
    setRight([]);
    setFlashlight("left");
    setSelected([]);
    setElapsed(0);
    setMoves([]);
    setMoving(false);
    setMessage("");
  }

  return (
    <div className="puzzle-shell">
      <div className="puzzle-hud">
        <div className="hud-stat"><span className="hud-icon"><StatusIcon kind="time" /></span><span><small>ELAPSED</small><strong>{elapsed}:00</strong></span></div>
        <div className="hud-stat"><span className="hud-icon"><StatusIcon kind="target" /></span><span><small>TARGET</small><strong>17:00</strong></span></div>
        <div className="hud-stat"><span className="hud-icon"><StatusIcon kind="moves" /></span><span><small>MOVES</small><strong>{moves.length}</strong></span></div>
      </div>

      <section className="game-stage bridge-stage">
        <div className="stage-head">
          <div><span className="stage-label">NIGHT CROSSING</span><h2>Get everyone across</h2></div>
          <span className={`live-pill ${moving ? "active" : ""}`}><i /> {moving ? "CROSSING" : "READY"}</span>
        </div>

        <div className="bridge-scene">
          <div className="night-sky"><span className="moon" /><i className="star one" /><i className="star two" /><i className="star three" /></div>
          <div className="bridge-side left-bank">
            <span className="bank-label">START</span>
            <div className="people-stack">
              {left.map((person) => <button key={person} className={`person-chip ${selected.includes(person) ? "selected" : ""}`} onClick={() => togglePerson(person)} disabled={flashlight !== "left" || moving}><strong>{person}</strong><small>MIN</small></button>)}
            </div>
          </div>
          <div className="bridge-span">
            <div className="bridge-rails" />
            <div className={`flashlight ${flashlight} ${moving ? "moving" : ""}`}><span /></div>
          </div>
          <div className="bridge-side right-bank">
            <span className="bank-label">FINISH</span>
            <div className="people-stack">
              {right.map((person) => <button key={person} className={`person-chip ${selected.includes(person) ? "selected" : ""}`} onClick={() => togglePerson(person)} disabled={flashlight !== "right" || moving}><strong>{person}</strong><small>MIN</small></button>)}
            </div>
          </div>
        </div>

        <div className="bridge-instruction">
          <span>FLASHLIGHT: {flashlight.toUpperCase()} BANK</span>
          <strong>{selected.length === 0 ? "Select one or two travelers" : `Selected: ${selected.join(" + ")} · Move costs ${Math.max(...selected)} min`}</strong>
        </div>

        <div className="control-dock">
          <button className="control-button" onClick={reset}>Reset</button>
          <button className="action-button" onClick={cross} disabled={moving || selected.length === 0}>{moving ? "CROSSING…" : flashlight === "left" ? "CROSS →" : "← RETURN"}</button>
        </div>

        {message ? <div className={message.startsWith("Perfect") ? "success-banner compact" : "error-banner"}>{message}</div> : null}

        <div className="move-log">
          <div className="telemetry-head"><span>MOVE HISTORY</span><span>{moves.length}/5 typical</span></div>
          {moves.length === 0 ? <p>No crossings yet.</p> : moves.map((move, index) => <div key={`${move}-${index}`}><span>0{index + 1}</span><strong>{move}</strong></div>)}
        </div>
      </section>
    </div>
  );
}

export default function PuzzleClient({ type, riddleId }: { type: PuzzleType; riddleId: number }) {
  return (
    <>
      {type === "rope" ? <RopePuzzle riddleId={riddleId} /> : null}
      {type === "coins" ? <CoinsPuzzle riddleId={riddleId} /> : null}
      {type === "bridge" ? <BridgePuzzle riddleId={riddleId} /> : null}
      <div className="puzzle-footer"><Link href="/">← Back to today&apos;s riddle</Link><span>Progress saves on this device.</span></div>
    </>
  );
}
