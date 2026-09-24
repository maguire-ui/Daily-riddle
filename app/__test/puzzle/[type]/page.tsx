import { notFound } from "next/navigation";
import PuzzleClient from "../../../visualize/PuzzleClient";

const TYPES = ["rope", "coins", "bridge", "switches"] as const;
type PuzzleType = (typeof TYPES)[number];

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PuzzleTestPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (process.env.E2E_TEST !== "1") notFound();

  const { type } = await params;
  const query = await searchParams;
  if (!TYPES.includes(type as PuzzleType)) notFound();

  const coinRaw = Number(first(query.coin) ?? "6");
  const polarityRaw = first(query.polarity) === "heavy" ? "heavy" : "light";
  const switchRaw = Number(first(query.control) ?? "1");
  const control = ([1,2,3].includes(switchRaw) ? switchRaw : 1) as 1|2|3;

  return (
    <main className={`app shell shell-wide riddle-theme riddle-99`}>
      <PuzzleClient
        type={type as PuzzleType}
        riddleId={999}
        testHiddenCoin={{ coin: Math.min(12, Math.max(1, coinRaw)), polarity: polarityRaw }}
        testSwitchControl={control}
      />
    </main>
  );
}
