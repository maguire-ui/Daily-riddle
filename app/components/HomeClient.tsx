"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import PuzzleClient from "../visualize/PuzzleClient";
import SoundToggle, { playUiSound } from "./SoundToggle";

type PublicRiddle = {
  id: number;
  title: string;
  category: string;
  difficulty: string;
  question: string;
  visualizer: "rope" | "coins" | "bridge" | "switches" | "lock" | "cabinets";
};

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M14 7l5 5-5 5"/></svg>;
}

function PuzzleIllustration({ id }: { id: number }) {
  if (id === 3) {
    return (
      <svg className="puzzle-illustration bridge-illustration simple-scene-illustration" viewBox="0 0 420 240" role="img" aria-label="Four people waiting on one side of a bridge at night">
        <rect className="bridge-night" x="12" y="18" width="396" height="204" rx="30"/>
        <circle className="moon-fill" cx="350" cy="50" r="21"/>
        <circle className="scene-star" cx="284" cy="45" r="2.5"/>
        <circle className="scene-star" cx="315" cy="76" r="2"/>
        <circle className="scene-star" cx="377" cy="89" r="2.5"/>

        <path className="river-line" d="M12 176c48-17 86 16 128-1s84-18 126 0 84 17 142-1"/>
        <path className="bank-shape" d="M12 132h128l28 82H12z"/>
        <path className="bank-shape right" d="M292 132h116v82H264z"/>

        <g className="bridge-object">
          <path className="bridge-rope" d="M146 112c35-30 111-30 146 0"/>
          <path className="bridge-rope" d="M146 121c35-25 111-25 146 0"/>
          <path className="bridge-deck" d="M148 145h144"/>
          {[158,176,194,212,230,248,266,284].map((x) => (
            <path key={x} className="bridge-plank" d={`M${x} 139l8 17`} />
          ))}
          <path className="bridge-post" d="M148 106v51M292 106v51"/>
        </g>

        <g className="traveler-group simple-travelers">
          {[38,64,90,116].map((x) => (
            <g key={x} transform={`translate(${x} 0)`}>
              <circle className="traveler-head" cx="0" cy="116" r="7"/>
              <path className="traveler-body" d="M0 124v24m-9-12 9-7 9 7M0 148l-8 13M0 148l8 13"/>
            </g>
          ))}
        </g>
      </svg>
    );
  }

  if (id === 1) {
    return (
      <svg className="puzzle-illustration simple-scene-illustration" viewBox="0 0 420 240" role="img" aria-label="Two ropes and a lighter">
        <path className="literal-rope" d="M38 76c47-25 78 27 124 2s78-20 114 1 71 12 108-4"/>
        <path className="literal-rope" d="M38 148c44 24 78-18 120 1s83 20 122-1 72-15 104 2"/>
        <circle className="rope-end" cx="38" cy="76" r="6"/><circle className="rope-end" cx="384" cy="75" r="6"/>
        <circle className="rope-end" cx="38" cy="148" r="6"/><circle className="rope-end" cx="384" cy="150" r="6"/>
        <g className="lighter-object" transform="translate(181 174)">
          <rect className="lighter-body" x="0" y="10" width="57" height="42" rx="9"/>
          <rect className="lighter-top" x="12" y="0" width="34" height="17" rx="4"/>
          <path className="lighter-flame" d="M29 0c-8-11 5-15 5-25 12 10 15 18 7 27-5 5-9 5-12-2Z"/>
        </g>
      </svg>
    );
  }

  if (id === 2) {
    const coins = Array.from({ length: 12 }, (_, index) => ({
      x: 34 + (index % 6) * 40,
      y: index < 6 ? 57 : 97,
    }));

    return (
      <svg className="puzzle-illustration simple-scene-illustration" viewBox="0 0 420 240" role="img" aria-label="Twelve coins beside a balance scale">
        <g className="coin-row">
          {coins.map(({ x, y }, index) => <circle key={index} className="literal-coin" cx={x} cy={y} r="15"/>)}
        </g>
        <g className="literal-scale" transform="translate(268 48)">
          <path className="scale-ink" d="M62 14v122M26 148h72M4 42h116"/>
          <circle className="scale-pivot-dot" cx="62" cy="42" r="7"/>
          <path className="scale-ink thin" d="M16 43 2 91h43L31 43M104 43 89 91h44l-15-48"/>
          <path className="scale-pan" d="M2 91h43M89 91h44"/>
        </g>
      </svg>
    );
  }

  if (id === 4) {
    return (
      <svg className="puzzle-illustration simple-scene-illustration" viewBox="0 0 420 240" role="img" aria-label="Three switches beside a closed room">
        <rect className="wall-panel" x="25" y="45" width="214" height="150" rx="19"/>
        {[68,132,196].map((x) => (
          <g key={x}>
            <rect className="literal-switch-plate" x={x - 22} y="82" width="44" height="74" rx="10"/>
            <path className="literal-switch" d={`M${x} 101v36`}/>
            <circle className="literal-switch-knob" cx={x} cy="101" r="9"/>
          </g>
        ))}
        <rect className="room-door" x="276" y="43" width="118" height="154" rx="8"/>
        <circle className="door-knob" cx="378" cy="121" r="5"/>
      </svg>
    );
  }

  if (id === 5) {
    const keys = [
      [272,82],[310,82],[348,82],
      [272,118],[310,118],[348,118],
      [272,154],[310,154],[348,154],
      [310,190],
    ];
    return (
      <svg className="puzzle-illustration simple-scene-illustration lock-illustration" viewBox="0 0 420 240" role="img" aria-label="A black-glass vault with a four-digit keypad">
        <rect className="museum-case" x="28" y="38" width="190" height="164" rx="24"/>
        <rect className="museum-glass" x="48" y="58" width="150" height="124" rx="18"/>
        <path className="museum-object" d="M84 157h77M94 157l13-58h30l14 58M109 111h27M103 128h40"/>
        <rect className="keypad-shell" x="240" y="42" width="140" height="166" rx="22"/>
        <rect className="keypad-display" x="264" y="58" width="92" height="18" rx="8"/>
        {keys.map(([x,y],index)=><circle key={index} className="keypad-dot" cx={x} cy={y} r="10"/>)}
        <path className="lock-latch" d="M213 110h28"/>
      </svg>
    );
  }

  if (id === 6) {
    const cabinets = [34, 84, 134, 184, 234, 284, 334];
    return (
      <svg className="puzzle-illustration simple-scene-illustration cabinet-illustration" viewBox="0 0 420 240" role="img" aria-label="Seven locked cabinets in a dim gallery">
        <rect className="cabinet-wall" x="18" y="28" width="384" height="184" rx="28"/>
        <path className="cabinet-floor" d="M29 190h362"/>
        {cabinets.map((x,index)=>(
          <g key={x} transform={`translate(${x} 0)`}>
            <rect className="cabinet-door" x="0" y={index % 2 === 0 ? 66 : 72} width="38" height="108" rx="7"/>
            <circle className="cabinet-knob" cx="29" cy={index % 2 === 0 ? 121 : 127} r="3.5"/>
            <path className="cabinet-plaque-line" d={`M7 ${index % 2 === 0 ? 86 : 92}h24`}/>
          </g>
        ))}
        <path className="cabinet-light" d="M207 36 178 63h58z"/>
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

          <button className="repeat-riddle-button" type="button" onClick={onRepeat}>
            <span className="repeat-icon">↻</span>
            <span><strong>Repeat riddle</strong><small>Play it again</small></span>
          </button>
        </section>

        <section className="next-riddle-countdown" aria-label="Countdown until next riddle">
          <span>Next riddle arrives in</span>
          <strong>{remaining || "--:--:--"}</strong>
          <small>Resets at midnight · America/Edmonton</small>
        </section>
      </div>

    </main>
  );
}

export default function HomeClient({ riddle, unlockAt }: { riddle: PublicRiddle; unlockAt: string }) {
  const router = useRouter();
  const rolloverHandled = useRef(false);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<null | boolean>(null);
  const [guessCount, setGuessCount] = useState(0);
  const [solved, setSolved] = useState(false);
  const [remaining, setRemaining] = useState("");
  const [puzzleOpen, setPuzzleOpen] = useState(false);
  const [repeating, setRepeating] = useState(false);
  const [loadedStorageKey, setLoadedStorageKey] = useState<string | null>(null);

  const storageKey = useMemo(() => `daily-riddle-${riddle.id}`, [riddle.id]);

  useEffect(() => {
    setRepeating(false);
    setResult(null);
    setAnswer("");
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
      setGuessCount(Number(saved.guesses || 0));
      setSolved(Boolean(saved.solved));
    } catch {
      setGuessCount(0);
      setSolved(false);
    } finally {
      setLoadedStorageKey(storageKey);
    }
  }, [storageKey]);

  useEffect(() => {
    rolloverHandled.current = false;

    const tick = () => {
      const rawMs = new Date(unlockAt).getTime() - Date.now();
      const ms = Math.max(0, rawMs);
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      setRemaining(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);

      if (rawMs <= 0 && !rolloverHandled.current) {
        rolloverHandled.current = true;
        router.refresh();
      }
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [router, unlockAt]);

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

  if (loadedStorageKey === storageKey && solved && !repeating) {
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
