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
    const people = [
      { x: 48, label: "1" },
      { x: 79, label: "2" },
      { x: 110, label: "7" },
      { x: 141, label: "10" },
    ];

    return (
      <svg className="puzzle-illustration bridge-illustration literal-illustration" viewBox="0 0 420 240" role="img" aria-label="Four people with crossing times 1, 2, 7 and 10 minutes wait beside a narrow bridge at night with one flashlight">
        <rect className="bridge-night" x="10" y="18" width="400" height="204" rx="30"/>
        <circle className="moon-fill" cx="347" cy="50" r="21"/>
        <circle className="scene-star" cx="282" cy="45" r="2.5"/>
        <circle className="scene-star" cx="314" cy="77" r="2"/>
        <circle className="scene-star" cx="377" cy="89" r="2.5"/>

        <path className="river-line" d="M12 174c46-18 85 17 127-1s84-18 126 0 83 17 143-1"/>
        <path className="river-line faint" d="M23 194c51-15 89 12 132-2s88-13 125 1 76 14 118-1"/>

        <path className="bank-shape" d="M12 132h112l27 82H12z"/>
        <path className="bank-shape right" d="M296 132h112v82H269z"/>

        <g className="bridge-object">
          <path className="bridge-rope" d="M117 112c41-31 145-31 186 0"/>
          <path className="bridge-rope" d="M117 121c41-27 145-27 186 0"/>
          <path className="bridge-deck" d="M120 145h180"/>
          {[130,150,170,190,210,230,250,270,290].map((x) => (
            <path key={x} className="bridge-plank" d={`M${x} 139l8 17`} />
          ))}
          <path className="bridge-post" d="M120 106v51M300 106v51"/>
        </g>

        <g className="traveler-group">
          {people.map(({x,label}) => (
            <g key={label} transform={`translate(${x} 0)`}>
              <circle className="traveler-head" cx="0" cy="111" r="8"/>
              <path className="traveler-body" d="M0 120v27m-11-15 11-8 11 8M0 147l-9 15M0 147l9 15"/>
              <rect className="time-tag" x="-14" y="166" width="28" height="20" rx="8"/>
              <text className="time-tag-text" x="0" y="180" textAnchor="middle">{label}m</text>
            </g>
          ))}
        </g>

        <g className="flashlight-object" transform="translate(164 112)">
          <rect x="0" y="0" width="30" height="13" rx="5"/>
          <path className="flashlight-beam-literal" d="M30 2l45 12-45 12z"/>
          <path className="flashlight-ring" d="M6 1v11"/>
        </g>
        <text className="scene-caption-text" x="179" y="105">ONE FLASHLIGHT</text>
        <text className="scene-caption-text center" x="210" y="210" textAnchor="middle">MAX 2 PEOPLE AT A TIME</text>
      </svg>
    );
  }

  if (id === 1) {
    return (
      <svg className="puzzle-illustration literal-illustration" viewBox="0 0 420 240" role="img" aria-label="Two uneven-burning ropes and one lighter">
        <text className="scene-title-text" x="26" y="42">ROPE A</text>
        <path className="literal-rope" d="M31 70c45-25 74 28 119 3s75-20 112 2 74 14 126-5"/>
        <circle className="rope-end" cx="31" cy="70" r="6"/><circle className="rope-end" cx="388" cy="70" r="6"/>

        <text className="scene-title-text" x="26" y="120">ROPE B</text>
        <path className="literal-rope" d="M31 149c39 26 77-20 116 2s79 19 116-2 76-18 125 2"/>
        <circle className="rope-end" cx="31" cy="149" r="6"/><circle className="rope-end" cx="388" cy="151" r="6"/>

        <g className="lighter-object" transform="translate(180 178)">
          <rect className="lighter-body" x="0" y="10" width="57" height="42" rx="9"/>
          <rect className="lighter-top" x="12" y="0" width="34" height="17" rx="4"/>
          <path className="lighter-flame" d="M29 0c-8-11 5-15 5-25 12 10 15 18 7 27-5 5-9 5-12-2Z"/>
        </g>
        <text className="scene-caption-text center" x="210" y="226" textAnchor="middle">EACH ROPE BURNS FOR 60 MINUTES — NOT AT A STEADY RATE</text>
      </svg>
    );
  }

  if (id === 2) {
    const coins = Array.from({ length: 12 }, (_, index) => ({
      n: index + 1,
      x: 28 + (index % 6) * 42,
      y: index < 6 ? 42 : 82,
    }));

    return (
      <svg className="puzzle-illustration literal-illustration" viewBox="0 0 420 240" role="img" aria-label="Twelve numbered coins beside an empty balance scale">
        <g className="coin-row">
          {coins.map(({ n, x, y }) => (
            <g key={n}>
              <circle className="literal-coin" cx={x} cy={y} r="16"/>
              <text className="literal-coin-text" x={x} y={y + 4} textAnchor="middle">{n}</text>
            </g>
          ))}
        </g>

        <g className="literal-scale" transform="translate(265 48)">
          <path className="scale-ink" d="M62 14v122M26 148h72M4 42h116"/>
          <circle className="scale-pivot-dot" cx="62" cy="42" r="7"/>
          <path className="scale-ink thin" d="M16 43 2 91h43L31 43M104 43 89 91h44l-15-48"/>
          <path className="scale-pan" d="M2 91h43M89 91h44"/>
        </g>
        <text className="scene-caption-text" x="274" y="211">3 WEIGHINGS MAX</text>
      </svg>
    );
  }

  if (id === 4) {
    return (
      <svg className="puzzle-illustration literal-illustration" viewBox="0 0 420 240" role="img" aria-label="Three switches outside a closed room with one light bulb inside">
        <rect className="wall-panel" x="18" y="35" width="224" height="168" rx="19"/>
        <text className="scene-title-text" x="34" y="60">OUTSIDE THE ROOM</text>

        {[64,130,196].map((x, index) => (
          <g key={x}>
            <rect className="literal-switch-plate" x={x - 23} y="82" width="46" height="78" rx="10"/>
            <path className="literal-switch" d={`M${x} 101v39`}/>
            <circle className="literal-switch-knob" cx={x} cy="101" r="9"/>
            <text className="switch-number" x={x} y="183" textAnchor="middle">{index + 1}</text>
          </g>
        ))}

        <rect className="room-door" x="267" y="39" width="135" height="165" rx="8"/>
        <circle className="door-knob" cx="383" cy="125" r="5"/>
        <text className="scene-title-text" x="285" y="61">ROOM</text>
        <g transform="translate(334 98)">
          <circle className="bulb-glass-literal" cx="0" cy="0" r="25"/>
          <path className="bulb-base-literal" d="M-10 21h20v22h-20zM-12 28h24M-12 35h24"/>
          <path className="bulb-filament" d="M-8 1 0 10 8 1"/>
        </g>
        <text className="scene-caption-text center" x="334" y="177" textAnchor="middle">ENTER ONCE</text>
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

function SolvedToday({ riddle, remaining, guessCount, onRepeat }: { riddle: PublicRiddle; remaining: string; guessCount: number; onRepeat: () => void }) {
  return (
    <main className="solved-today-screen">
      <div className="solved-background-doodles" aria-hidden="true">
        <span>✦</span><span>○</span><span>✓</span>
      </div>
      <div className="solved-shell">
        <header className="game-topbar solved-topbar">
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

        <section className="solved-hero">
          <div className="solved-check-wrap">
            <span className="solved-check">✓</span>
            <span className="solved-spark one">✦</span>
            <span className="solved-spark two">✦</span>
            <span className="solved-spark three">•</span>
          </div>
          <span className="tiny-kicker">TODAY&apos;S RIDDLE · #{String(riddle.id).padStart(3,"0")}</span>
          <h1>You solved today&apos;s riddle!</h1>
          <p className="solved-riddle-name">{riddle.title}</p>
          <p className="solved-copy">
            Nice work. Your solve is saved on this device{guessCount > 0 ? ` after ${guessCount} ${guessCount === 1 ? "guess" : "guesses"}` : ""}.
          </p>

          <div className="solved-links">
            <Link href="/yesterday">Yesterday&apos;s solution</Link>
            <span>•</span>
            <Link href="/archive">Past riddles</Link>
          </div>
        </section>

        <section className="next-riddle-countdown" aria-label="Countdown until next riddle">
          <span>Next riddle arrives in</span>
          <strong>{remaining || "--:--:--"}</strong>
          <small>Resets at midnight · America/Edmonton</small>
        </section>
      </div>

      <button className="repeat-riddle-float" type="button" onClick={onRepeat}>
        <span className="repeat-icon">↻</span>
        <span><strong>Repeat riddle</strong><small>Play it again</small></span>
      </button>
    </main>
  );
}

export default function HomeClient({ riddle, unlockAt }: { riddle: PublicRiddle; unlockAt: string }) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<null | boolean>(null);
  const [guessCount, setGuessCount] = useState(0);
  const [solved, setSolved] = useState(false);
  const [remaining, setRemaining] = useState("");
  const [puzzleOpen, setPuzzleOpen] = useState(false);
  const [repeating, setRepeating] = useState(false);

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
        setRepeating(false);
        setPuzzleOpen(false);
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
      setRepeating(false);
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

  if (solved && !repeating) {
    return (
      <SolvedToday
        riddle={riddle}
        remaining={remaining}
        guessCount={guessCount}
        onRepeat={() => {
          playUiSound("tap");
          setRepeating(true);
          setResult(null);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    );
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
            </div>
            <figure className="illustration-wrap">
              <PuzzleIllustration id={riddle.id}/>
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
