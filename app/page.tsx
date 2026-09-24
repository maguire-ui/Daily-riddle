import HomeClient from "./components/HomeClient";
import { getCurrentRiddle } from "./lib/riddles";
import { nextEdmontonMidnightISO } from "./lib/time";

export default function Page() {
  const riddle = getCurrentRiddle(new Date());
  if (!riddle) {
    return <main className="shell"><div className="card empty"><h1>New riddle coming soon.</h1><p className="subtle">The published queue has ended. We do not repeat old riddles.</p></div></main>;
  }
  const publicRiddle = {
    id: riddle.id,
    title: riddle.title,
    category: riddle.category,
    difficulty: riddle.difficulty,
    question: riddle.question,
  };
  return <HomeClient riddle={publicRiddle} unlockAt={nextEdmontonMidnightISO()} />;
}
