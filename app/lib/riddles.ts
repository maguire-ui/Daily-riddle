import "server-only";

export type Riddle = {
  id: number;
  slug: string;
  title: string;
  category: string;
  difficulty: "Hard" | "Brutal" | "Insane";
  question: string;
  visualizer: "rope" | "coins" | "bridge";
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
    accepted: ["17", "17 minutes", "yes 17", "yes, 17 minutes"],
    requiredConcepts: [
      ["1 and 2", "1 & 2", "one and two"],
      ["7 and 10", "7 & 10", "seven and ten"],
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
];

export const START_DAY = "2026-09-23";

export function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function answerIsCorrect(riddle: Riddle, raw: string) {
  const answer = normalize(raw);
  if (!answer) return false;

  if (riddle.forbiddenConcepts?.some((x) => answer.includes(normalize(x)))) return false;

  if (riddle.accepted?.some((x) => answer === normalize(x))) return true;

  return riddle.requiredConcepts.every((group) =>
    group.some((phrase) => answer.includes(normalize(phrase)))
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
