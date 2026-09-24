import { NextRequest, NextResponse } from "next/server";
import { answerIsCorrect, getCurrentRiddle } from "../../lib/riddles";

export async function POST(req: NextRequest) {
  const riddle = getCurrentRiddle(new Date());
  if (!riddle) return NextResponse.json({ correct: false, unavailable: true }, { status: 503 });
  const body = await req.json().catch(() => ({}));
  const answer = typeof body.answer === "string" ? body.answer.slice(0, 2000) : "";
  return NextResponse.json({ correct: answerIsCorrect(riddle, answer) });
}
