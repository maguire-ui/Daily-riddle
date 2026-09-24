import HomeClient from "./components/HomeClient";
import { getCurrentRiddle } from "./lib/riddles";

function nextEdmontonMidnight() {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Edmonton",
    year: "numeric", month: "2-digit", day: "2-digit"
  });
  const [y,m,d] = fmt.format(now).split("-").map(Number);
  // September 2026 is MDT (UTC-6). A server-authoritative API should replace this
  // if the project later expands across DST boundaries.
  return new Date(Date.UTC(y, m - 1, d + 1, 6, 0, 0)).toISOString();
}

export default function Page() {
  const riddle = getCurrentRiddle(new Date());
  if (!riddle) {
    return <main className="shell"><div className="card empty"><h1>New riddle coming soon.</h1><p className="subtle">The published queue has ended. We do not repeat old riddles.</p></div></main>;
  }
  const publicRiddle = { id:riddle.id,title:riddle.title,category:riddle.category,difficulty:riddle.difficulty,question:riddle.question };
  return <HomeClient riddle={publicRiddle} unlockAt={nextEdmontonMidnight()} />;
}
