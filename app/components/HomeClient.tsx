"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type PublicRiddle = {
  id: number;
  title: string;
  category: string;
  difficulty: string;
  question: string;
};

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M14 7l5 5-5 5"/></svg>;
}

export default function HomeClient({ riddle, unlockAt }: { riddle: PublicRiddle; unlockAt: string }) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<null | boolean>(null);
  const [guessCount, setGuessCount] = useState(0);
  const [solved, setSolved] = useState(false);
  const [remaining, setRemaining] = useState("");

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
    if (correct) setSolved(true);

    localStorage.setItem(storageKey, JSON.stringify({ guesses: next, solved: correct || solved }));
  }

  return (
    <main className="app shell">
      <header className="site-header">
        <Link className="wordmark" href="/">
          <span className="wordmark-box">DR</span>
          <span><strong>DAILY RIDDLE</strong><small>ONE PROBLEM. EVERY DAY.</small></span>
        </Link>
        <nav className="site-nav">
          <span className="server-status"><i /> LIVE</span>
          <Link href="/archive">Archive</Link>
        </nav>
      </header>

      <section className="challenge-head">
        <div className="challenge-index">
          <span>DAILY CHALLENGE</span>
          <strong>#{String(riddle.id).padStart(3, "0")}</strong>
        </div>

        <div className="challenge-title">
          <div className="meta-line">
            <span>{riddle.category}</span>
            <i />
            <span>{riddle.difficulty}</span>
            {solved ? <><i /><span className="solved-label">SOLVED</span></> : null}
          </div>
          <h1>{riddle.title}</h1>
        </div>

        <div className="countdown-panel">
          <small>NEXT DROP</small>
          <strong>{remaining || "--:--:--"}</strong>
          <span>America / Edmonton</span>
        </div>
      </section>

      <section className="riddle-panel">
        <div className="panel-rule">
          <span>THE PROBLEM</span>
          <span>NO HINTS · UNLIMITED GUESSES</span>
        </div>

        <p className="riddle-question">{riddle.question}</p>

        <div className="play-callout">
          <div className="play-copy">
            <span className="play-number">01</span>
            <div><strong>Want to work it out visually?</strong><small>Open the interactive version and solve it by doing.</small></div>
          </div>
          <Link className="play-button" href="/visualize">OPEN PUZZLE <ArrowIcon /></Link>
        </div>

        <form className="answer-console" onSubmit={submit}>
          <div className="answer-console-head">
            <div><span>YOUR SOLUTION</span><small>Explain the method, not just the final number.</small></div>
            <span className="guess-counter">{String(guessCount).padStart(2, "0")} GUESSES</span>
          </div>
          <div className="answer-row">
            <input
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Describe how you would solve it…"
              aria-label="Your solution"
              autoComplete="off"
            />
            <button type="submit">CHECK ANSWER</button>
          </div>
          <div aria-live="polite">
            {result === true ? <div className="answer-result good"><span>✓</span><div><strong>Correct.</strong><small>Your method matches the solution.</small></div></div> : null}
            {result === false ? <div className="answer-result bad"><span>×</span><div><strong>Not quite.</strong><small>Keep the same idea and try another approach.</small></div></div> : null}
          </div>
        </form>
      </section>

      <section className="secondary-grid">
        <Link className="secondary-card" href="/yesterday">
          <span>YESTERDAY</span>
          <strong>Reveal the previous solution</strong>
          <small>Unlocks only after the daily reset.</small>
          <b>→</b>
        </Link>
        <Link className="secondary-card" href="/archive">
          <span>ARCHIVE</span>
          <strong>Past daily challenges</strong>
          <small>Only riddles that have already been published.</small>
          <b>→</b>
        </Link>
      </section>
    </main>
  );
}
