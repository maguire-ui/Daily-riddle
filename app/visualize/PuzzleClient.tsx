"use client";

import Link from "next/link";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { playUiSound } from "../components/SoundToggle";

type PuzzleType = "rope" | "coins" | "bridge" | "switches";

function saveSolved(riddleId: number) {
  const key = `daily-riddle-${riddleId}`;
  let saved: Record<string, unknown> = {};
  try {
    saved = JSON.parse(localStorage.getItem(key) || "{}");
  } catch {}
  localStorage.setItem(key, JSON.stringify({ ...saved, solved: true }));
  window.dispatchEvent(new CustomEvent("daily-riddle-solved", { detail: { riddleId } }));
  playUiSound("success");
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
  type RopeId = "A" | "B";
  type RopeState = {
    leftLit: boolean;
    rightLit: boolean;
    burnUnits: number;
    done: boolean;
  };

  const fresh = (): RopeState => ({ leftLit: false, rightLit: false, burnUnits: 0, done: false });
  const [ropes, setRopes] = useState<Record<RopeId, RopeState>>({ A: fresh(), B: fresh() });
  const [started, setStarted] = useState(false);
  const [running, setRunning] = useState(false);
  const [checkpoint, setCheckpoint] = useState(false);
  const [correctPath, setCorrectPath] = useState(false);
  const [slowRope, setSlowRope] = useState<RopeId | null>(null);
  const [solved, setSolved] = useState(false);
  const [failed, setFailed] = useState(false);
  const [log, setLog] = useState<string[]>([
    "Choose which rope ends to light. The clock is hidden on purpose.",
  ]);

  function litCount(rope: RopeState) {
    return Number(rope.leftLit) + Number(rope.rightLit);
  }

  function visualBurn(rope: RopeState) {
    const progress = Math.max(0, Math.min(1, rope.burnUnits / 60));
    // Intentionally nonlinear: visual rope length is NOT a clock.
    return Math.round(Math.pow(progress, 0.72) * 100);
  }

  function toggleSetup(id: RopeId, end: "left" | "right") {
    if (started) return;
    setRopes((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [end === "left" ? "leftLit" : "rightLit"]: !prev[id][end === "left" ? "leftLit" : "rightLit"],
      },
    }));
  }

  function startBurn() {
    const a = litCount(ropes.A);
    const b = litCount(ropes.B);
    if (a === 0 && b === 0) return;

    const validOpening = (a === 2 && b === 1) || (a === 1 && b === 2);
    const slower: RopeId | null = a === 1 && b === 2 ? "A" : b === 1 && a === 2 ? "B" : null;

    setStarted(true);
    setCorrectPath(validOpening);
    setSlowRope(slower);
    setFailed(false);
    setLog((items) => [
      validOpening
        ? "Burn started. Watch for a rope to burn out — that event is your only timing clue."
        : "Burn started. No exact time will be shown; use only what the ropes physically tell you.",
      ...items,
    ].slice(0, 6));
    runToNextEvent(ropes, validOpening, slower);
  }

  function runToNextEvent(
    snapshot = ropes,
    pathIsCorrect = correctPath,
    trackedSlow = slowRope,
  ) {
    const candidates = (["A", "B"] as RopeId[])
      .filter((id) => !snapshot[id].done && litCount(snapshot[id]) > 0)
      .map((id) => ({
        id,
        rate: litCount(snapshot[id]),
        untilDone: (60 - snapshot[id].burnUnits) / litCount(snapshot[id]),
      }));

    if (candidates.length === 0) {
      setFailed(true);
      setLog((items) => ["Nothing is burning. Reset and try a different setup.", ...items].slice(0, 6));
      return;
    }

    const delta = Math.min(...candidates.map((item) => item.untilDone));
    setRunning(true);
    setCheckpoint(false);

    window.setTimeout(() => {
      let newlyFinished: RopeId[] = [];
      const next: Record<RopeId, RopeState> = {
        A: { ...snapshot.A },
        B: { ...snapshot.B },
      };

      for (const id of ["A", "B"] as RopeId[]) {
        const rope = snapshot[id];
        if (rope.done) continue;
        const rate = litCount(rope);
        if (rate === 0) continue;

        const burnUnits = Math.min(60, rope.burnUnits + rate * delta);
        const done = burnUnits >= 59.999;
        if (done && !rope.done) newlyFinished.push(id);
        next[id] = { ...rope, burnUnits, done };
      }

      setRopes(next);
      setRunning(false);
      setCheckpoint(true);

      const correctFirstCheckpoint =
        pathIsCorrect &&
        trackedSlow !== null &&
        newlyFinished.length === 1 &&
        newlyFinished[0] !== trackedSlow &&
        !next[trackedSlow].done;

      if (correctFirstCheckpoint && next[trackedSlow].burnUnits < 59.999) {
        setLog((items) => [
          "One rope burned out. The simulation paused automatically. What should you light now?",
          ...items,
        ].slice(0, 6));
        return;
      }

      if (trackedSlow !== null && newlyFinished.includes(trackedSlow) && pathIsCorrect && litCount(next[trackedSlow]) === 2) {
        setSolved(true);
        saveSolved(riddleId);
        setLog((items) => [
          "Solved. Your sequence measures exactly 45 minutes without ever reading a clock.",
          ...items,
        ].slice(0, 6));
        return;
      }

      const allDone = next.A.done && next.B.done;
      if (allDone) {
        setFailed(true);
        setLog((items) => [
          "Both ropes are finished, but that sequence did not prove exactly 45 minutes. Reset and try again.",
          ...items,
        ].slice(0, 6));
      } else {
        setLog((items) => [
          "A natural burn event occurred. The simulator paused, but your sequence is not yet a proven 45-minute measurement.",
          ...items,
        ].slice(0, 6));
      }
    }, 1800);
  }

  function igniteAtCheckpoint(id: RopeId, end: "left" | "right") {
    if (!started || running || !checkpoint || ropes[id].done) return;
    const key = end === "left" ? "leftLit" : "rightLit";
    if (ropes[id][key]) return;

    const next = {
      ...ropes,
      [id]: { ...ropes[id], [key]: true },
    };
    setRopes(next);

    const stillCorrect =
      correctPath &&
      slowRope === id &&
      litCount(next[id]) === 2;

    setCorrectPath(stillCorrect);
    setLog((items) => [
      `Lit Rope ${id}'s other end at the burn-out checkpoint.`,
      ...items,
    ].slice(0, 6));
  }

  function resume() {
    if (!checkpoint || running || solved || failed) return;
    if (slowRope && correctPath && litCount(ropes[slowRope]) !== 2) {
      setCorrectPath(false);
    }
    runToNextEvent(ropes, correctPath && (!slowRope || litCount(ropes[slowRope]) === 2), slowRope);
  }

  function reset() {
    setRopes({ A: fresh(), B: fresh() });
    setStarted(false);
    setRunning(false);
    setCheckpoint(false);
    setCorrectPath(false);
    setSlowRope(null);
    setSolved(false);
    setFailed(false);
    setLog(["Choose which rope ends to light. The clock is hidden on purpose."]);
  }

  return (
    <div className="puzzle-shell">
      <div className="puzzle-hud rope-safe-hud" aria-label="Rope puzzle status">
        <div className="hud-stat">
          <span className="hud-icon"><StatusIcon kind="moves" /></span>
          <span><small>PHASE</small><strong>{!started ? "SETUP" : running ? "BURNING" : checkpoint ? "CHECKPOINT" : "READY"}</strong></span>
        </div>
        <div className="hud-stat">
          <span className="hud-icon"><StatusIcon kind="target" /></span>
          <span><small>GOAL</small><strong>EXACTLY 45 MIN</strong></span>
        </div>
        <div className="hud-stat">
          <span className="hud-icon"><StatusIcon kind="time" /></span>
          <span><small>CLOCK</small><strong>HIDDEN</strong></span>
        </div>
      </div>

      <section className="game-stage rope-stage">
        <div className="stage-head">
          <div>
            <span className="stage-label">BURN TEST</span>
            <h2>Use the ropes — not a timer</h2>
          </div>
          <span className={`live-pill ${running ? "active" : ""}`}><i /> {running ? "BURNING" : solved ? "SOLVED" : "READY"}</span>
        </div>

        <div className="anti-cheat-note">
          <span>NO CLOCK READOUT</span>
          <p>The rope graphics are intentionally uneven and not proportional to time. A rope burning out is a valid clue; a percentage or countdown is not.</p>
        </div>

        <div className="rope-bay">
          {(["A", "B"] as RopeId[]).map((id) => {
            const rope = ropes[id];
            const pct = visualBurn(rope);
            const style = {
              "--burn-left": rope.leftLit ? `${Math.min(100, pct)}%` : "0%",
              "--burn-right": rope.rightLit ? `${Math.min(100, pct * 0.62)}%` : "0%",
            } as CSSProperties;

            return (
              <div className={`rope-unit ${rope.done ? "rope-done" : ""}`} key={id}>
                <div className="rope-unit-head">
                  <span className="rope-name">ROPE {id}</span>
                  <span className="rope-status">{rope.done ? "BURNED OUT" : running && litCount(rope) > 0 ? "BURNING" : litCount(rope) > 0 ? "LIT / READY" : "UNLIT"}</span>
                </div>
                <div className="rope-control-row">
                  <button
                    className={`igniter ${rope.leftLit ? "lit" : ""}`}
                    disabled={running || rope.done || (started && !checkpoint) || rope.leftLit}
                    onClick={() => started ? igniteAtCheckpoint(id, "left") : toggleSetup(id, "left")}
                  >
                    <span className="flame">◆</span><span>{rope.leftLit ? "LEFT LIT" : "LIGHT LEFT"}</span>
                  </button>

                  <div className="rope-graphic" style={style}>
                    <div className="rope-cord" />
                    <div className="rope-char rope-char-left" />
                    <div className="rope-char rope-char-right" />
                    {rope.leftLit && !rope.done ? <span className="rope-flame left">◆</span> : null}
                    {rope.rightLit && !rope.done ? <span className="rope-flame right">◆</span> : null}
                  </div>

                  <button
                    className={`igniter ${rope.rightLit ? "lit" : ""}`}
                    disabled={running || rope.done || (started && !checkpoint) || rope.rightLit}
                    onClick={() => started ? igniteAtCheckpoint(id, "right") : toggleSetup(id, "right")}
                  >
                    <span className="flame">◆</span><span>{rope.rightLit ? "RIGHT LIT" : "LIGHT RIGHT"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {solved ? (
          <div className="success-banner" role="status">
            <span className="success-mark">✓</span>
            <div><strong>Correct sequence.</strong><small>You measured exactly 45 minutes using only burn-out events.</small></div>
          </div>
        ) : null}

        {failed ? <div className="error-banner">That sequence cannot prove exactly 45 minutes. Reset and try another setup.</div> : null}

        <div className="control-dock rope-controls">
          {!started ? (
            <button className="action-button" onClick={startBurn} disabled={litCount(ropes.A) + litCount(ropes.B) === 0}>START BURN</button>
          ) : (
            <button className="action-button" onClick={resume} disabled={!checkpoint || running || solved || failed}>CONTINUE BURN</button>
          )}
          <button className="control-button danger-lite" onClick={reset}>RESET</button>
        </div>
      </section>

      <section className="telemetry-card">
        <div className="telemetry-head"><span>OBSERVATION LOG</span><span>NO TIMES SHOWN</span></div>
        <div className="event-log">
          {log.map((item, index) => <div key={`${item}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></div>)}
        </div>
      </section>
    </div>
  );
}

type HiddenCoin = { coin: number; polarity: "heavy" | "light" };

function CoinsPuzzle({ riddleId, testHidden }: { riddleId: number; testHidden?: HiddenCoin }) {
  const [hidden, setHidden] = useState<HiddenCoin | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [left, setLeft] = useState<number[]>([]);
  const [right, setRight] = useState<number[]>([]);
  const [snapshots, setSnapshots] = useState<Array<{ left: number[]; right: number[] }>>([]);
  const [history, setHistory] = useState<Array<{ left:number[]; right:number[]; outcome:string }>>([]);
  const [lastOutcome, setLastOutcome] = useState<"balance" | "left" | "right" | null>(null);
  const [finalCoin, setFinalCoin] = useState<number | null>(null);
  const [heavyLight, setHeavyLight] = useState<"heavy" | "light">("heavy");
  const [message, setMessage] = useState("");

  function newRound() {
    if (testHidden) {
      setHidden(testHidden);
    } else {
      const values = new Uint32Array(2);
      crypto.getRandomValues(values);
      setHidden({ coin: (values[0] % 12) + 1, polarity: values[1] % 2 === 0 ? "heavy" : "light" });
    }
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
    setHistory((items) => [...items, { left:[...left], right:[...right], outcome:label }]);
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
          <button className="action-button" onClick={weigh} disabled={!hidden || history.length >= 3 || (left.length === 0 && right.length === 0)}>WEIGH NOW</button>
        </div>

        <div className="weigh-history">
          {[0, 1, 2].map((index) => { const item=history[index]; return <div key={index} className={item ? "filled" : ""}><span>0{index + 1}</span><strong>{item ? `${item.left.join(",") || "—"} vs ${item.right.join(",") || "—"} · ${item.outcome}` : "Awaiting result"}</strong></div>; })}
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

function SwitchesPuzzle({ riddleId, testControl }: { riddleId: number; testControl?: 1 | 2 | 3 }) {
  const [control, setControl] = useState<1 | 2 | 3 | null>(testControl ?? null);

  useEffect(() => {
    if (testControl || control !== null) return;
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    setControl(((values[0] % 3) + 1) as 1 | 2 | 3);
  }, [control, testControl]);
  const [switches, setSwitches] = useState<Record<1 | 2 | 3, boolean>>({ 1:false, 2:false, 3:false });
  const [heat, setHeat] = useState(0);
  const [entered, setEntered] = useState(false);
  const [touched, setTouched] = useState(false);
  const [guess, setGuess] = useState<1 | 2 | 3 | null>(null);
  const [message, setMessage] = useState("");

  function toggle(id: 1 | 2 | 3) {
    if (entered) return;
    setSwitches((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function wait() {
    if (entered) return;
    if (control !== null && switches[control]) setHeat((value) => Math.min(3, value + 1));
  }

  function enterRoom() {
    if (entered) return;
    setEntered(true);
  }

  function submit() {
    if (guess === null) return;
    if (control !== null && guess === control) {
      setMessage("Correct — you identified the controlling switch.");
      saveSolved(riddleId);
    } else {
      setMessage("Wrong switch. Use the bulb evidence, reset, and try the method again.");
    }
  }

  const bulbOn = control !== null ? switches[control] : false;

  function resetSwitches() {
    setSwitches({1:false,2:false,3:false});
    setHeat(0);
    setEntered(false);
    setTouched(false);
    setGuess(null);
    setMessage("");
    if (!testControl) {
      const values = new Uint32Array(1);
      crypto.getRandomValues(values);
      setControl(((values[0] % 3) + 1) as 1 | 2 | 3);
    }
  }

  return (
    <div className="puzzle-shell">
      <div className="puzzle-hud">
        <div className="hud-stat"><span className="hud-icon"><StatusIcon kind="moves" /></span><span><small>ROOM ENTRIES</small><strong>{entered ? "1 / 1" : "0 / 1"}</strong></span></div>
        <div className="hud-stat"><span className="hud-icon"><StatusIcon kind="target" /></span><span><small>SWITCHES</small><strong>3</strong></span></div>
        <div className="hud-stat"><span className="hud-icon"><StatusIcon kind="time" /></span><span><small>BULB</small><strong>{entered ? (bulbOn ? "ON" : "OFF") : "HIDDEN"}</strong></span></div>
      </div>

      <section className="game-stage switch-stage">
        <div className="stage-head">
          <div><span className="stage-label">ELECTRICAL TEST</span><h2>Three switches. One room entry.</h2></div>
          <span className="live-pill active"><i /> {entered ? "INSIDE ROOM" : "OUTSIDE ROOM"}</span>
        </div>

        <div className="switch-layout">
          <div className="switch-bank">
            {[1,2,3].map((raw) => {
              const id = raw as 1|2|3;
              return <button key={id} className={`wall-switch ${switches[id] ? "on" : ""}`} onClick={() => toggle(id)} disabled={entered || control === null}>
                <span className="switch-track"><i /></span>
                <strong>SWITCH {id}</strong>
                <small>{switches[id] ? "ON" : "OFF"}</small>
              </button>;
            })}
            <button className="control-button wait-button" onClick={wait} disabled={entered || control === null}>WAIT A FEW MINUTES</button>
          </div>

          <div className={`bulb-room ${entered ? "open" : ""}`}>
            <div className="door">{entered ? <span>ROOM OPEN</span> : <span>ROOM CLOSED</span>}</div>
            {entered ? (
              <div className={`bulb-fixture ${bulbOn ? "on" : ""}`}>
                <div className="bulb-glow" />
                <div className="bulb" />
                <strong>{bulbOn ? "THE BULB IS ON" : "THE BULB IS OFF"}</strong>
                <button className="control-button" onClick={() => setTouched(true)}>TOUCH BULB</button>
                {touched ? <small>{heat > 0 ? "The bulb feels warm." : "The bulb feels cool."}</small> : null}
              </div>
            ) : null}
          </div>
        </div>

        {!entered ? (
          <div className="control-dock"><button className="action-button" onClick={enterRoom} disabled={control === null}>{control === null ? "CALIBRATING…" : "ENTER ROOM — ONE CHANCE"}</button></div>
        ) : (
          <div className="diagnosis-panel">
            <div><span className="stage-label">FINAL ANSWER</span><h3>Which switch controls the bulb?</h3></div>
            <div className="diagnosis-controls">
              <select value={guess ?? ""} onChange={(e) => setGuess((Number(e.target.value) || null) as 1|2|3|null)}>
                <option value="">Choose switch</option><option value="1">Switch 1</option><option value="2">Switch 2</option><option value="3">Switch 3</option>
              </select>
              <button className="action-button" onClick={submit} disabled={guess === null}>SUBMIT</button>
            </div>
            {message ? <div className={message.startsWith("Correct") ? "success-banner compact" : "error-banner"}>{message}</div> : null}
            <button className="text-button" onClick={resetSwitches}>Reset puzzle</button>
          </div>
        )}
      </section>
    </div>
  );
}

export default function PuzzleClient({ type, riddleId, testHiddenCoin, testSwitchControl, embedded = false }: { type: PuzzleType; riddleId: number; testHiddenCoin?: HiddenCoin; testSwitchControl?: 1|2|3; embedded?: boolean }) {
  function tactilePuzzlePress(event: React.PointerEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    const button = target.closest("button, [role='button']");
    if (!button) return;
    if (button.classList.contains("wall-switch")) playUiSound("switch");
    else playUiSound("tap");
  }

  return (
    <div className={embedded ? "puzzle-client puzzle-client-embedded" : "puzzle-client"} onPointerDownCapture={tactilePuzzlePress}>
      {type === "rope" ? <RopePuzzle riddleId={riddleId} /> : null}
      {type === "coins" ? <CoinsPuzzle riddleId={riddleId} testHidden={testHiddenCoin} /> : null}
      {type === "bridge" ? <BridgePuzzle riddleId={riddleId} /> : null}
      {type === "switches" ? <SwitchesPuzzle riddleId={riddleId} testControl={testSwitchControl} /> : null}
      {!embedded ? <div className="puzzle-footer"><Link href="/">← Back to today&apos;s riddle</Link><span>Progress saves on this device.</span></div> : null}
    </div>
  );
}
