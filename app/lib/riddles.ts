import "server-only";

export type Riddle = {
  id: number;
  slug: string;
  title: string;
  category: string;
  difficulty: "Hard" | "Brutal" | "Insane";
  question: string;
  visualizer: "rope" | "coins" | "bridge" | "switches" | "lock";
  accepted?: string[];
  requiredConcepts: string[][];
  forbiddenConcepts?: string[];
  solution: string;
  steps: string[];
};

export const RIDDLES: Riddle[] = [
  {
    id: 1,
    slug: "two-ropes-45-minutes",
    title: "The Two Ropes",
    category: "Lateral Thinking",
    difficulty: "Hard",
    question:
      "You have two ropes and a lighter. Each rope takes exactly 60 minutes to burn from one end to the other, but each burns at an uneven speed. You cannot cut or measure the ropes. How can you measure exactly 45 minutes?",
    visualizer: "rope",
    requiredConcepts: [
      ["both ends", "two ends", "both sides"],
      ["other rope", "second rope", "rope b"],
      ["one end", "one side"],
      ["light the other end", "light other end", "other side when", "second end when"],
    ],
    forbiddenConcepts: ["halfway", "half way", "cut the rope"],
    solution:
      "Light Rope A at both ends and Rope B at one end at the same time. Rope A finishes in exactly 30 minutes. The instant it finishes, light the other end of Rope B. Rope B then burns from both ends and finishes 15 minutes later. Total: 45 minutes.",
    steps: [
      "Light both ends of Rope A and one end of Rope B.",
      "Rope A burns out after exactly 30 minutes.",
      "Immediately light the other end of Rope B.",
      "Rope B now finishes in 15 more minutes.",
      "30 + 15 = 45 minutes.",
    ],
  },
  {
    id: 2,
    slug: "twelve-coins",
    title: "The Twelve Coins",
    category: "Deduction",
    difficulty: "Insane",
    question:
      "You have 12 identical-looking coins. Exactly one is counterfeit and is either heavier or lighter than the others. Using a balance scale only three times, determine exactly which coin is counterfeit and whether it is heavier or lighter.",
    visualizer: "coins",
    requiredConcepts: [
      ["4 vs 4", "four vs four", "4 against 4", "four against four"],
      ["heavier or lighter", "heavy or light", "both heavy and light"],
      ["three", "3"],
    ],
    forbiddenConcepts: ["6 vs 6", "six vs six", "use my hands"],
    solution:
      "A guaranteed solution uses a 4-vs-4 first weighing and a decision tree that preserves both possibilities: a suspect may be heavy or light. Across three weighings, the three-way outcomes must distinguish all 24 possible states (12 coins × heavy/light).",
    steps: [
      "Label the coins 1–12.",
      "Weigh 1,2,3,4 against 5,6,7,8.",
      "Use the first outcome to restrict which coins could be heavy or light.",
      "Choose a second mixed weighing that cuts the remaining states to at most three.",
      "Use the third weighing to identify the exact coin and whether it is heavy or light.",
    ],
  },
  {
    id: 3,
    slug: "bridge-at-night",
    title: "The Bridge at Night",
    category: "Strategy",
    difficulty: "Brutal",
    question:
      "Four people must cross a narrow bridge at night. They have one flashlight, at most two can cross at once, and a pair moves at the slower person's speed. Their times are 1, 2, 7, and 10 minutes. Can everyone cross in exactly 17 minutes?",
    visualizer: "bridge",
    requiredConcepts: [
      ["1 and 2", "1 & 2", "one and two"],
      ["1 returns", "one returns", "1 comes back", "one comes back"],
      ["7 and 10", "7 & 10", "seven and ten"],
      ["2 returns", "two returns", "2 comes back", "two comes back"],
      ["1 and 2", "1 & 2", "one and two"],
      ["17", "seventeen"],
    ],
    solution:
      "1 and 2 cross (2). 1 returns (1). 7 and 10 cross (10). 2 returns (2). 1 and 2 cross again (2). Total: 17 minutes.",
    steps: [
      "1 and 2 cross: 2 minutes.",
      "1 returns: 1 minute.",
      "7 and 10 cross: 10 minutes.",
      "2 returns: 2 minutes.",
      "1 and 2 cross again: 2 minutes.",
      "Total: 17 minutes.",
    ],
  },
  {
    id: 4,
    slug: "three-switches-one-bulb",
    title: "The Three Switches",
    category: "Observation",
    difficulty: "Hard",
    question:
      "Outside a closed room are three switches. Exactly one controls an old-fashioned light bulb inside. You may flip the switches however you like, but you may enter the room only once. How can you determine which switch controls the bulb?",
    visualizer: "switches",
    requiredConcepts: [
      ["turn one on", "switch on", "leave one on", "first switch"],
      ["wait", "few minutes", "heat", "warm", "hot"],
      ["turn it off", "switch it off", "first off"],
      ["turn another on", "second switch", "another switch"],
      ["enter", "go inside", "go into the room"],
      ["warm", "hot", "heat", "lit", "on", "cold", "cool"],
    ],
    solution:
      "Turn one switch on and leave it on long enough to heat the bulb. Turn that switch off, turn a second switch on, then enter the room. If the bulb is lit, the second switch controls it. If the bulb is off but warm, the first switch controls it. If it is off and cool, the third switch controls it.",
    steps: [
      "Turn Switch 1 on and wait long enough for the bulb to heat up.",
      "Turn Switch 1 off.",
      "Turn Switch 2 on.",
      "Enter the room once.",
      "Lit means Switch 2; off but warm means Switch 1; off and cool means Switch 3.",
    ],
  },
];

export const TEST_RIDDLE: Riddle = {
  id: 5,
  slug: "black-glass-vault",
  title: "The Black Glass Vault",
  category: "Code Breaking",
  difficulty: "Brutal",
  question:
    "A black-glass vault uses a 4-digit code with no repeated digits. Each clue is exact: 2589 — three digits are in the code, all in the wrong positions. 9452 — two digits are in the code, both in the wrong positions. 9458 — two digits are in the code: one is in the correct position and one is in the wrong position. 6517 — two digits are in the code, both in the wrong positions. 0748 — two digits are in the code, and both are in the correct positions. What is the code?",
  visualizer: "lock",
  accepted: ["5728"],
  requiredConcepts: [["5728"]],
  solution:
    "The unique code is 5728. The five clues form a Mastermind-style constraint system: every line gives an exact count of matching digits and exact placement information. Working through the overlaps leaves only 5, 7, 2, and 8, with 7 fixed second and 8 fixed fourth by 0748. The remaining placement constraints force 5 first and 2 third.",
  steps: [
    "Treat every clue as exact: no extra hidden matches are allowed.",
    "0748 says two digits are correct and correctly placed. Combined with the other clues, those positions resolve to 7 in position 2 and 8 in position 4.",
    "2589 contains three correct digits, all misplaced. With 8 already known, the other two surviving digits from that clue must be 5 and 2.",
    "9452 and 6517 rule out the remaining alternate placements for 5 and 2.",
    "The only 4-digit no-repeat code satisfying all five clues is 5728.",
  ],
};

export const START_DAY = "2026-09-22";

export function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function normalizeMeaning(s: string) {
  return normalize(s)
    .replace(/\bthe\b/g, " ")
    .replace(/\bone\b/g, "1")
    .replace(/\btwo\b/g, "2")
    .replace(/\bseven\b/g, "7")
    .replace(/\bten\b/g, "10")
    .replace(/\bseventeen\b/g, "17")
    .replace(/\s+/g, " ")
    .trim();
}

function bridgeAnswerIsCorrect(raw: string) {
  const answer = normalizeMeaning(raw);
  if (!answer.includes("17")) return false;

  // Natural-language bridge answers vary a lot: "take 1 and 2 down",
  // "send 1 & 2 across", "bring 1 back", etc. Judge the move sequence,
  // not the exact verbs used.
  const pair12 = /\b1\s+(?:(?:and|with)\s+)?2\b/g;
  const pair710 = /\b7\s+(?:(?:and|with)\s+)?10\b/g;
  const return1 = /\b(?:(?:bring|take|send|move)\s+)?1\s+(?:back|return|returns|returned|comes?\s+back)\b/g;
  const return2 = /\b(?:(?:bring|take|send|move)\s+)?2\s+(?:back|return|returns|returned|comes?\s+back)\b/g;

  const pair12Matches = [...answer.matchAll(pair12)].map((match) => match.index ?? -1);
  if (pair12Matches.length < 2) return false;

  const first12 = pair12Matches[0];
  const r1 = return1.exec(answer)?.index ?? -1;
  const sevenTen = pair710.exec(answer)?.index ?? -1;
  const r2 = return2.exec(answer)?.index ?? -1;
  const last12 = pair12Matches.find((index) => index > r2) ?? -1;

  return first12 >= 0 && r1 > first12 && sevenTen > r1 && r2 > sevenTen && last12 > r2;
}

export function answerIsCorrect(riddle: Riddle, raw: string) {
  const answer = normalize(raw);
  if (!answer) return false;

  if (riddle.forbiddenConcepts?.some((x) => answer.includes(normalize(x)))) return false;

  if (riddle.id === 3) return bridgeAnswerIsCorrect(raw);

  if (riddle.accepted?.some((x) => answer === normalize(x))) return true;

  const meaning = normalizeMeaning(raw);
  return riddle.requiredConcepts.every((group) =>
    group.some((phrase) => meaning.includes(normalizeMeaning(phrase)))
  );
}

export function currentDayKey(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Edmonton",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function dayDiff(a: string, b: string) {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.floor((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
}

export function getCurrentRiddle(now = new Date()) {
  const index = dayDiff(START_DAY, currentDayKey(now));
  if (index < 0) return RIDDLES[0];
  if (index >= RIDDLES.length) return null; // never wrap; wrapping would repeat a riddle
  return RIDDLES[index];
}

export function getPreviousRiddle(now = new Date()) {
  const index = dayDiff(START_DAY, currentDayKey(now)) - 1;
  return index >= 0 && index < RIDDLES.length ? RIDDLES[index] : null;
}

// Temporary live override for the requested one-off test.
// It intentionally does not enter RIDDLES, so archive/history and the permanent
// no-repeat schedule remain untouched.
export const TEST_RIDDLE_DAY = "2026-09-24";

export function getLiveRiddle(now = new Date()) {
  return currentDayKey(now) === TEST_RIDDLE_DAY ? TEST_RIDDLE : getCurrentRiddle(now);
}
