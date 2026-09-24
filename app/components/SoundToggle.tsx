"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "daily-riddle-sound";

export function soundEnabled() {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(STORAGE_KEY) !== "off";
}

export function playUiSound(kind: "tap" | "success" | "wrong" | "switch" = "tap") {
  if (typeof window === "undefined" || !soundEnabled()) return;

  const W = window as typeof window & { webkitAudioContext?: typeof AudioContext };
  const AudioCtx = window.AudioContext || W.webkitAudioContext;
  if (!AudioCtx) return;

  const ctx = new AudioCtx();
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);

  const tone = (frequency: number, start: number, duration: number, volume = 0.035, type: OscillatorType = "sine") => {
    const osc = ctx.createOscillator();
    const localGain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime + start);
    localGain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
    localGain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + start + 0.01);
    localGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
    osc.connect(localGain);
    localGain.connect(ctx.destination);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + duration + 0.02);
  };

  if (kind === "success") {
    tone(523.25, 0, 0.14, 0.038);
    tone(659.25, 0.08, 0.16, 0.036);
    tone(783.99, 0.16, 0.22, 0.034);
  } else if (kind === "wrong") {
    tone(220, 0, 0.1, 0.025, "triangle");
    tone(185, 0.08, 0.12, 0.02, "triangle");
  } else if (kind === "switch") {
    tone(520, 0, 0.045, 0.022, "square");
  } else {
    tone(390, 0, 0.055, 0.018, "triangle");
  }

  window.setTimeout(() => void ctx.close(), 600);
}

export default function SoundToggle({ compact = false }: { compact?: boolean }) {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(soundEnabled());
    const sync = () => setEnabled(soundEnabled());
    window.addEventListener("daily-riddle-sound", sync);
    return () => window.removeEventListener("daily-riddle-sound", sync);
  }, []);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
    window.dispatchEvent(new Event("daily-riddle-sound"));
    if (next) playUiSound("tap");
  }

  return (
    <button
      type="button"
      className={`sound-toggle ${compact ? "compact" : ""}`}
      onClick={toggle}
      aria-label={enabled ? "Turn sound effects off" : "Turn sound effects on"}
      aria-pressed={enabled}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 10v4h4l5 4V6L8 10H4Z" />
        {enabled ? <><path d="M16 9.5c.8.7 1.2 1.5 1.2 2.5S16.8 13.8 16 14.5" /><path d="M18.4 7.4c1.4 1.2 2.1 2.7 2.1 4.6s-.7 3.4-2.1 4.6" /></> : <path d="m17 9 4 4m0-4-4 4" />}
      </svg>
      {!compact ? <span>{enabled ? "Sound on" : "Sound off"}</span> : null}
    </button>
  );
}
