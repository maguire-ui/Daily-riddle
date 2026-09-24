"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import PuzzleClient from "../visualize/PuzzleClient";
import SoundToggle, { playUiSound } from "./SoundToggle";

type PublicRiddle = {
  id: number;
  title: string;
  category: string;
  difficulty: string;
  question: string;
  visualizer: "rope" | "coins" | "bridge" | "switches";
};

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M14 7l5 5-5 5"/></svg>;
}

function PuzzleIllustration({ id }: { id: number }) {
  if (id === 3) {
    return (
      <svg className="puzzle-illustration bridge-illustration" viewBox="0 0 420 240" role="img" aria-label="Sketch of a bridge at night">
        <path className="ink-line" d="M48 170c32-55 64-83 97-83s67 28 101 83M175 170c33-55 66-83 99-83s66 28 98 83"/>
        <path className="heavy-line" d="M42 171h338"/>
        <path className="soft-line" d="M63 171l22 28m33-28 22 28m34-28 22 28m33-28 22 28m34-28 22 28m34-28 22 28"/>
        <circle className="moon-fill" cx="330" cy="52" r="25"/>
        <path className="scribble" d="M61 54l8 8m-4-4 7-8M119 42l3 8m-4-3 8-2M249 53l6 5m-3-3 6-6"/>
        <path className="accent-line" d="M85 127c18-13 38-21 57-21"/>
        <path className="accent-line arrow" d="M139 101l10 5-7 8"/>
        <path className="flashlight-beam" d="M132 147l56-23 10 14-62 18z"/>
        <circle className="coral-fill" cx="123" cy="149" r="8"/>
        <path className="sketch-note" d="M34 94c8-18 18-26 31-28"/>
        <path className="sketch-note" d="M57 59l8 6-9 4"/>
      </svg>
    );
  }
  if (id === 1) {
    return (
      <svg className="puzzle-illustration" viewBox="0 0 420 240" role="img" aria-label="Sketch of two ropes and a lighter">
        <path className="rope-line" d="M42 102c55-36 96 38 151 3s98-29 183 10"/>
        <path className="rope-line second" d="M51 158c48-29 93 21 141-3s100-35 179 0"/>
        <path className="accent-line" d="M47 96c-12-16-9-29 8-37"/>
        <path className="accent-line" d="M368 149c14-13 18-28 8-41"/>
        <path className="flame-sketch" d="M47 85c-7-13 6-17 7-29 12 11 14 19 5 28-5 5-8 5-12 1Z"/>
        <path className="flame-sketch" d="M367 143c-7-13 6-17 7-29 12 11 14 19 5 28-5 5-8 5-12 1Z"/>
        <circle className="teal-ring" cx="205" cy="105" r="34"/>
        <path className="scribble" d="M209 47c14 0 27 5 38 14m-14-1 14 1-5 12"/>
      </svg>
    );
  }
  if (id === 2) {
    return (
      <svg className="puzzle-illustration" viewBox="0 0 420 240" role="img" aria-label="Sketch of balance scale and coins">
        <path className="heavy-line" d="M210 57v111M165 178h90"/>
        <path className="heavy-line" d="M100 88h220"/>
        <path className="ink-line" d="M100 88l-42 66h84L100 88Zm220 0-42 66h84l-42-66Z"/>
        <circle className="coin-fill" cx="89" cy="139" r="13"/><circle className="coin-fill" cx="113" cy="139" r="13"/>
        <circle className="coin-fill" cx="307" cy="139" r="13"/><circle className="coin-fill" cx="331" cy="139" r="13"/>
        <path className="scribble" d="M49 54c22-14 44-17 67-8m-9-6 11 6-7 10"/>
        <circle className="teal-ring" cx="323" cy="139" r="39"/>
      </svg>
    );
  }
  if (id === 4) {
    return (
      <svg className="puzzle-illustration" viewBox="0 0 420 240" role="img" aria-label="Sketch of three switches and a light bulb">
        {[110, 210, 310].map((x, index) => (
          <g key={x}>
            <rect className="switch-plate" x={x - 28} y="106" width="56" height="78" rx="10"/>
            <path className="heavy-line" d={`M${x} 125v40`} />
            <circle className={index === 1 ? "coral-fill" : "teal-fill"} cx={x} cy="128" r="10"/>
          </g>
        ))}
        <path className="bulb-line" d="M210 28c-27 0-46 19-46 44 0 19 10 30 23 41v15h46v-15c13-11 23-22 23-41 0-25-19-44-46-44Z"/>
        <path className="scribble" d="M157 41l-17-15m8 34-23-4m138-15 17-15m-8 34 23-4"/>
      </svg>
    );
  }
  return (
    <svg className="puzzle-illustration" viewBox="0 0 420 240" aria-hidden="true">
      <path className="ink-line" d="M139 82c12-31 39-47 72-47 43 0 75 27 75 65 0 31-18 46-42 61-19 12-23 18-23 37"/>
      <circle className="coral-fill" cx="220" cy="221" r="10"/>
    </svg>
  );
}

function Confetti() {
  return <span className="confetti" aria-hidden="true">{Array.from({length:12},(_,i)=><i key={i} style={{"--i":i} as React.CSSProperties}/>)}</span>;
}

export default function HomeClient({ riddle, unlockAt }: { riddle: PublicRiddle; unlockAt: string }) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<null | boolean>(null);
  const [guessCount, setGuessCount] = useState(0);
  const [solved, setSolved] = useState(false);
  const [remaining, setRemaining] = useState("");
  const [puzzleOpen, setPuzzleOpen] = useState(false);

  const storageKey = useMemo(() => `daily-riddle-${riddle.id}`, [riddle.id]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
      setGuessCount(Number(saved.guesses || 0));
      setSolved(Boolean(saved.solved));
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    const tick = () => {
      const ms = Math.max(0, new Date(unlockAt).getTime() - Date.now());
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      setRemaining(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
      if (ms === 0) window.location.reload();
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [unlockAt]);

  useEffect(() => {
    const onSolved = (event: Event) => {
      const detail = (event as CustomEvent<{ riddleId: number }>).detail;
      if (detail?.riddleId === riddle.id) {
        setSolved(true);
      }
    };
    window.addEventListener("daily-riddle-solved", onSolved);
    return () => window.removeEventListener("daily-riddle-solved", onSolved);
  }, [riddle.id]);

  useEffect(() => {
    document.body.classList.toggle("modal-open", puzzleOpen);
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPuzzleOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", close);
    };
  }, [puzzleOpen]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!answer.trim()) return;

    const next = guessCount + 1;
    setGuessCount(next);
    const response = await fetch("/api/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer }),
    });
    const data = await response.json();
    const correct = Boolean(data.correct);
    setResult(correct);

    if (correct) {
      setSolved(true);
      playUiSound("success");
    } else {
      playUiSound("wrong");
    }

    localStorage.setItem(storageKey, JSON.stringify({ guesses: next, solved: correct || solved }));
  }

  function tactilePress(event: React.PointerEvent<HTMLElement>) {
    const target = event.target as HTMLElement;
    if (target.closest("button, a, [role='button']")) playUiSound("tap");
  }

  return (
    <main className={`game-home riddle-theme riddle-${riddle.id}`} onPointerDownCapture={tactilePress}>
      <div className="ambient-doodles" aria-hidden="true">
        <span className="doodle-question">?</span><span className="doodle-star">✦</span>
        <svg viewBox="0 0 120 80"><path d="M7 54c26-33 59-41 104-22M91 20l21 12-18 14"/></svg>
      </div>

      <div className="home-shell">
        <header className="game-topbar">
          <Link className="game-brand" href="/" aria-label="Daily Riddle home">
            <span className="brand-mark"><i/><i/><i/></span>
            <span><strong>Daily Riddle</strong><small>one clever challenge a day</small></span>
          </Link>
          <div className="topbar-actions">
            <SoundToggle compact />
            <Link className="icon-link" href="/archive" aria-label="Open riddle archive">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14v12H5zM8 4h8v3H8zM9 11h6M9 15h4"/></svg>
            </Link>
          </div>
        </header>

        <section className="daily-heading">
          <div>
            <span className="today-label">TODAY&apos;S RIDDLE</span>
            <div className="title-row">
              <h1>{riddle.title}</h1>
              <span className="riddle-number">#{String(riddle.id).padStart(3, "0")}</span>
            </div>
            <div className="riddle-meta">
              <span>{riddle.category}</span><i/><span>{riddle.difficulty}</span>
              {solved ? <><i/><span className="solved-stamp">Solved ✓</span></> : null}
            </div>
          </div>
          <div className="drop-clock" aria-label="Time until next riddle">
            <small>Next puzzle</small><strong>{remaining || "--:--:--"}</strong>
          </div>
        </section>

        <section className="daily-paper">
          <span className="paper-tab">DAILY CHALLENGE</span>
          <span className="paper-tape" aria-hidden="true"/>
          <div className="paper-layout">
            <div className="prompt-column">
              <span className="tiny-kicker">THE SETUP</span>
              <p className="riddle-question">{riddle.question}</p>
              <p className="hand-note">No hints hiding in the UI. Promise.</p>
            </div>
            <figure className="illustration-wrap">
              <PuzzleIllustration id={riddle.id}/>
              <figcaption>Sketch it. Move it. Test the idea.</figcaption>
            </figure>
          </div>

          <button className="chunky-button play-now" type="button" onClick={() => setPuzzleOpen(true)}>
            <span className="button-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 7 8 5-8 5V7Z"/></svg>
            </span>
            <span><strong>Try the interactive puzzle</strong><small>Solve it by doing, not just typing.</small></span>
            <ArrowIcon/>
          </button>

          <form className={`answer-area ${result === false ? "wrong-bump" : ""}`} onSubmit={submit}>
            <div className="answer-label-row">
              <div><span>Your solution</span><small>Explain the method in your own words.</small></div>
              <span className="guess-count">{guessCount} {guessCount === 1 ? "guess" : "guesses"}</span>
            </div>
            <div className="answer-entry">
              <textarea
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="I would start by…"
                aria-label="Your solution"
                rows={3}
              />
              <button className="chunky-button check-button" type="submit">
                <span>Check answer</span>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M14 7l5 5-5 5"/></svg>
              </button>
            </div>

            <div className="feedback-space" aria-live="polite">
              {result === true ? (
                <div className="friendly-feedback correct-feedback">
                  <Confetti/>
                  <span className="drawn-check"><svg viewBox="0 0 36 36"><path d="m9 19 6 6 13-15"/></svg></span>
                  <div><strong>You got it!</strong><small>Your reasoning matches the solution.</small></div>
                </div>
              ) : null}
              {result === false ? (
                <div className="friendly-feedback wrong-feedback">
                  <span className="sketch-x">×</span>
                  <div><strong>Not quite — give it another shot.</strong><small>Unlimited guesses. Try changing one part of your method.</small></div>
                </div>
              ) : null}
            </div>
          </form>
        </section>

        <section className="after-puzzle-links" aria-label="More riddle options">
          <Link href="/yesterday" className="journal-link">
            <span className="journal-icon">↗</span>
            <span><strong>Yesterday&apos;s solution</strong><small>See how the previous puzzle works.</small></span>
          </Link>
          <Link href="/archive" className="journal-link">
            <span className="journal-icon">≋</span>
            <span><strong>Past riddles</strong><small>Browse puzzles that have already been published.</small></span>
          </Link>
        </section>
      </div>

      {puzzleOpen ? (
        <div className="puzzle-overlay" role="dialog" aria-modal="true" aria-label={`Interactive puzzle: ${riddle.title}`}>
          <div className="puzzle-overlay-bar">
            <div><span className="tiny-kicker">PUZZLE MODE</span><strong>{riddle.title}</strong></div>
            <div className="overlay-actions"><SoundToggle compact/><button className="close-puzzle" type="button" onClick={() => setPuzzleOpen(false)} aria-label="Close interactive puzzle">×</button></div>
          </div>
          <div className="puzzle-overlay-scroll">
            <PuzzleClient type={riddle.visualizer} riddleId={riddle.id} embedded />
          </div>
        </div>
      ) : null}
    </main>
  );
}
