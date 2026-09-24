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

export default function HomeClient({ riddle, unlockAt }: { riddle: PublicRiddle; unlockAt: string }) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<null | boolean>(null);
  const [guessCount, setGuessCount] = useState(0);
  const [solved, setSolved] = useState(false);
  const [remaining, setRemaining] = useState("");

  const storageKey = useMemo(() => `daily-riddle-${riddle.id}`, [riddle.id]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
    setGuessCount(Number(saved.guesses || 0));
    setSolved(Boolean(saved.solved));
  }, [storageKey]);

  useEffect(() => {
    const tick = () => {
      const ms = Math.max(0, new Date(unlockAt).getTime() - Date.now());
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      setRemaining(`${String(h).padStart(2,"0")} : ${String(m).padStart(2,"0")} : ${String(s).padStart(2,"0")}`);
      if (ms === 0) window.location.reload();
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [unlockAt]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!answer.trim()) return;
    const next = guessCount + 1;
    setGuessCount(next);
    const res = await fetch("/api/answer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answer }) });
    const data = await res.json();
    const ok = Boolean(data.correct);
    setResult(ok);
    if (ok) setSolved(true);
    localStorage.setItem(storageKey, JSON.stringify({ guesses: next, solved: ok || solved }));
  }

  return (
    <main className="app shell">
      <header className="topbar">
        <div className="brand">Daily Riddle</div>
        <nav className="nav">
          <Link className="nav-button" href="/archive">Archive</Link>
        </nav>
      </header>

      <section className="hero">
        <div className="kicker">Today&apos;s riddle · #{riddle.id}</div>
        <h1>{riddle.title}</h1>
        <div className="meta">
          <span className="chip">{riddle.category}</span>
          <span className="chip">{riddle.difficulty}</span>
          {solved && <span className="chip">Solved on this device</span>}
        </div>
      </section>

      <section className="card">
        <p className="question">{riddle.question}</p>

        <form className="answer-wrap" onSubmit={submit}>
          <input
            className="answer-input"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your solution..."
            aria-label="Your answer"
            autoComplete="off"
          />
          <button className="primary" type="submit">CHECK ANSWER</button>
          <div aria-live="polite">
            {result === true && <div className="result good">Correct! You solved it.</div>}
            {result === false && <div className="result bad">Incorrect — try again.</div>}
          </div>
          <div className="subtle">Guesses on this device: {guessCount}. Different wording counts if the core method is correct.</div>
        </form>

        <div className="actions">
          <Link className="ghost" href="/visualize">Visualize / Interactive Puzzle</Link>
          <Link className="ghost" href="/yesterday">Yesterday&apos;s Answer</Link>
        </div>

        <div className="countdown">
          <div className="countdown-label">Next riddle / answer unlocks in</div>
          <div className="countdown-time">{remaining || "-- : -- : --"}</div>
        </div>
      </section>
    </main>
  );
}
