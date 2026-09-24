"use client";

import Link from "next/link";
import SoundToggle from "./SoundToggle";

export default function SecondaryHeader({
  kicker,
  title,
  closeHref,
  closeLabel,
}: {
  kicker: string;
  title: string;
  closeHref: string;
  closeLabel: string;
}) {
  return (
    <header className="secondary-topbar">
      <div className="secondary-topbar-copy">
        <span className="tiny-kicker">{kicker}</span>
        <strong>{title}</strong>
      </div>
      <div className="overlay-actions">
        <SoundToggle compact />
        <Link className="close-puzzle" href={closeHref} aria-label={closeLabel}>×</Link>
      </div>
    </header>
  );
}
