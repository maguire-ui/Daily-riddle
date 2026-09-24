import PuzzleClient from "./PuzzleClient";
import { getCurrentRiddle } from "../lib/riddles";

export default function VisualizePage(){
  const riddle=getCurrentRiddle(new Date());
  if(!riddle)return <main className="shell"><div className="card">No active riddle.</div></main>;
  return <main className="app shell"><div className="kicker">Interactive visualization</div><h1>{riddle.title}</h1><PuzzleClient type={riddle.visualizer} riddleId={riddle.id}/></main>;
}
