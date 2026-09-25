import { NextRequest, NextResponse } from "next/server";
import { RIDDLES, answerIsCorrect, getLiveRiddle, isRiddlePublished } from "../../lib/riddles";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const requestedId = Number(body.riddleId);
  const current = getLiveRiddle(new Date());

  let riddle = current;
  if (Number.isInteger(requestedId)) {
    const requested = RIDDLES.find((item) => item.id === requestedId) ?? null;
    const allowed =
      requested &&
      (requested.id === current?.id || isRiddlePublished(requested.id, new Date()));
    riddle = allowed ? requested : null;
  }

  if (!riddle) return NextResponse.json({ correct: false, unavailable: true }, { status: 404 });

  const answer = typeof body.answer === "string" ? body.answer.slice(0, 2000) : "";
  return NextResponse.json({ correct: answerIsCorrect(riddle, answer) });
}
