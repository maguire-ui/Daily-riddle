import HomeClient from "./components/HomeClient";
import { getCurrentRiddle } from "./lib/riddles";
import { nextEdmontonMidnightISO } from "./lib/time";

export default function Page() {
  const riddle = getCurrentRiddle(new Date());
  if (!riddle) {
    return <main className="empty-day"><div><span>?</span><h1>New riddle coming soon.</h1><p>The published queue has ended. Old riddles will never be recycled.</p></div></main>;
  }

  const publicRiddle = {
    id: riddle.id,
    title: riddle.title,
    category: riddle.category,
    difficulty: riddle.difficulty,
    question: riddle.question,
    visualizer: riddle.visualizer,
  };

  return <HomeClient riddle={publicRiddle} unlockAt={nextEdmontonMidnightISO()} />;
}
