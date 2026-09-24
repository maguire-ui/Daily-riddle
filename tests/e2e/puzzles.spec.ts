import { expect, test, type Page } from "@playwright/test";

async function openPuzzle(page: Page, type: string, query = "") {
  await page.goto(`/test-puzzle/${type}${query}`);
  await page.waitForLoadState("domcontentloaded");
}

test("rope puzzle accepts the real method without leaking a usable clock", async ({ page }) => {
  await openPuzzle(page, "rope");

  await expect(page.getByText("CLOCK").first()).toBeVisible();
  await expect(page.getByText("HIDDEN").first()).toBeVisible();
  await expect(page.getByText(/MIN REMAINING/)).toHaveCount(0);
  await expect(page.getByText(/45:00/)).toHaveCount(0);

  const ropeA = page.locator(".rope-unit").filter({ hasText: "ROPE A" });
  const ropeB = page.locator(".rope-unit").filter({ hasText: "ROPE B" });

  await ropeA.getByRole("button", { name: /LIGHT LEFT/ }).click();
  await ropeA.getByRole("button", { name: /LIGHT RIGHT/ }).click();
  await ropeB.getByRole("button", { name: /LIGHT LEFT/ }).click();
  await page.getByRole("button", { name: "START BURN" }).click();

  await expect(page.getByText(/One rope burned out/)).toBeVisible();
  await ropeB.getByRole("button", { name: /LIGHT RIGHT/ }).click();
  await page.getByRole("button", { name: "CONTINUE BURN" }).click();

  await expect(page.getByText("Correct sequence.")).toBeVisible();
  await expect(page.getByText(/measured exactly 45 minutes/i)).toBeVisible();
});

test("coin puzzle weighs correctly, records evidence, and accepts a correct diagnosis", async ({ page }) => {
  await openPuzzle(page, "coins", "?coin=6&polarity=light");

  await page.getByRole("button", { name: "6", exact: true }).click();
  await page.getByRole("button", { name: "Place selected coin on left tray" }).click();
  await page.getByRole("button", { name: "1", exact: true }).click();
  await page.getByRole("button", { name: "Place selected coin on right tray" }).click();

  await page.getByRole("button", { name: "WEIGH NOW" }).click();
  await expect(page.locator(".scale-outcome")).toHaveText("RIGHT SIDE HEAVIER");
  await expect(page.getByText(/6 vs 1 · RIGHT HEAVIER/)).toBeVisible();

  await page.getByLabel("Counterfeit coin").selectOption("6");
  await page.getByLabel("Counterfeit weight").selectOption("light");
  await page.getByRole("button", { name: "LOCK DIAGNOSIS" }).click();

  await expect(page.getByText(/Correct — Coin 6 is light/)).toBeVisible();
});

function traveler(page: Page, value: number) {
  return page.locator("button.person-chip").filter({
    has: page.locator("strong", { hasText: new RegExp(`^${value}$`) }),
  });
}

async function cross(page: Page, people: number[], buttonName: RegExp) {
  for (const person of people) await traveler(page, person).click();
  await page.getByRole("button", { name: buttonName }).click();
  await expect(page.locator(".live-pill")).toContainText(/CROSSING/);
  await expect(page.locator(".live-pill")).toContainText("READY", { timeout: 3500 });
}

test("bridge puzzle completes the canonical 17-minute solution", async ({ page }) => {
  await openPuzzle(page, "bridge");

  await cross(page, [1, 2], /CROSS/);
  await cross(page, [1], /RETURN/);
  await cross(page, [7, 10], /CROSS/);
  await cross(page, [2], /RETURN/);
  await cross(page, [1, 2], /CROSS/);

  await expect(page.getByText(/Perfect — everyone crossed in exactly 17 minutes/)).toBeVisible();
  await expect(page.locator(".hud-stat").filter({ hasText: "ELAPSED" }).getByText("17:00")).toBeVisible();
});

async function prepareSwitchMethod(page: Page) {
  await page.getByRole("button", { name: /SWITCH 1/ }).click();
  await page.getByRole("button", { name: "WAIT A FEW MINUTES" }).click();
  await page.getByRole("button", { name: /SWITCH 1/ }).click();
  await page.getByRole("button", { name: /SWITCH 2/ }).click();
  await page.getByRole("button", { name: /ENTER ROOM/ }).click();
}

for (const control of [1, 2, 3] as const) {
  test(`three-switches puzzle works when switch ${control} is the hidden answer`, async ({ page }) => {
    await openPuzzle(page, "switches", `?control=${control}`);
    await prepareSwitchMethod(page);

    if (control === 2) {
      await expect(page.getByText("THE BULB IS ON")).toBeVisible();
    } else {
      await expect(page.getByText("THE BULB IS OFF")).toBeVisible();
      await page.getByRole("button", { name: "TOUCH BULB" }).click();
      await expect(page.getByText(control === 1 ? "The bulb feels warm." : "The bulb feels cool.")).toBeVisible();
    }

    await page.locator(".diagnosis-panel select").selectOption(String(control));
    await page.getByRole("button", { name: "SUBMIT" }).click();
    await expect(page.getByText(/Correct — you identified the controlling switch/)).toBeVisible();
  });
}

test("live black-glass vault rejects a wrong code and accepts the unique code", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");

  await expect(page.getByRole("heading", { name: "The Black Glass Vault" })).toBeVisible();
  await expect(page.getByText(/2589 — three digits/i)).toBeVisible();

  const input = page.getByLabel("Your solution");
  await input.fill("5278");
  await page.getByRole("button", { name: "CHECK ANSWER" }).click();
  await expect(page.getByText(/Not quite/)).toBeVisible();

  await input.fill("The code is 5728.");
  await page.getByRole("button", { name: "CHECK ANSWER" }).click();

  await expect(page.getByRole("heading", { name: /You solved today's riddle/i })).toBeVisible();
  await expect(page.getByText("The Black Glass Vault")).toBeVisible();
  await expect(page.getByText("Next riddle arrives in")).toBeVisible();
  await expect(page.locator(".next-riddle-countdown strong")).toHaveText(/\d{2}:\d{2}:\d{2}/);

  await page.getByRole("button", { name: /Repeat riddle/i }).click();
  await expect(page.getByRole("heading", { name: "The Black Glass Vault" })).toBeVisible();
});


test("home opens the interactive puzzle in-place and returns without navigation", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");

  const before = page.url();
  await page.getByRole("button", { name: /Try the interactive puzzle/i }).click();
  const dialog = page.getByRole("dialog", { name: /Interactive puzzle/i });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Crack the vault code")).toBeVisible();
  expect(page.url()).toBe(before);

  await page.getByRole("button", { name: "Close interactive puzzle" }).click();
  await expect(dialog).toHaveCount(0);
  expect(page.url()).toBe(before);
});

test("interactive vault keypad solves with the correct four-digit code", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");

  await page.getByRole("button", { name: /Try the interactive puzzle/i }).click();
  const dialog = page.getByRole("dialog", { name: /Interactive puzzle/i });

  for (const digit of ["5", "7", "2", "8"]) {
    await dialog.getByRole("button", { name: digit, exact: true }).click();
  }
  await dialog.getByRole("button", { name: "TRY CODE" }).click();

  await expect(dialog).toHaveCount(0, { timeout: 3000 });
  await expect(page.getByRole("heading", { name: /You solved today's riddle/i })).toBeVisible();
  await expect(page.getByText("The Black Glass Vault")).toBeVisible();
});


test("sound preference is remembered locally", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");

  const offButton = page.getByRole("button", { name: "Turn sound effects off" });
  await expect(offButton).toBeVisible();
  await offButton.click();

  await page.reload();
  await expect(page.getByRole("button", { name: "Turn sound effects on" })).toBeVisible();

  // Restore the default for any later test in the same browser context.
  await page.getByRole("button", { name: "Turn sound effects on" }).click();
});

for (const viewport of [
  { width: 375, height: 812, label: "narrow phone" },
  { width: 430, height: 932, label: "large phone" },
  { width: 768, height: 1024, label: "tablet" },
  { width: 1440, height: 900, label: "desktop" },
]) {
  test(`layout has no horizontal overflow on ${viewport.label}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    if (viewport.width <= 430) {
      await page.getByRole("button", { name: /Try the interactive puzzle/i }).click();
      const overlayOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overlayOverflow).toBeLessThanOrEqual(1);
      await expect(page.getByRole("button", { name: "Close interactive puzzle" })).toBeVisible();
    }
  });
}

test("solution reveal and archive pages load in the same visual system", async ({ page }) => {
  await page.goto("/yesterday");
  await page.waitForLoadState("domcontentloaded");
  await expect(page.getByText("YESTERDAY'S SOLUTION", { exact: true })).toBeVisible();
  await expect(page.getByText(/Here's how it works/i)).toBeVisible();

  await page.goto("/archive");
  await page.waitForLoadState("domcontentloaded");
  await expect(page.getByRole("heading", { name: "Past riddles", exact: true })).toBeVisible();
  await expect(page.getByText(/Replay any of them whenever you want/i)).toBeVisible();
});


test("yesterday solution offers an animated visual walkthrough", async ({ page }) => {
  await page.goto("/yesterday");
  await page.waitForLoadState("domcontentloaded");

  const replayLink = page.getByRole("link", { name: /Play solving animation/i });
  await expect(replayLink).toBeVisible();
  await replayLink.click();

  await expect(page).toHaveURL(/\/yesterday\/play/);
  await expect(page.getByText("VISUAL WALKTHROUGH")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Start with 24 possibilities" })).toBeVisible();

  await page.getByRole("button", { name: /Play/ }).click();
  await expect(page.getByRole("heading", { name: "Weigh 1–4 against 5–8" })).toBeVisible({ timeout: 4500 });
  await expect(page.locator(".replay-scale")).toHaveClass(/left-down/, { timeout: 6500 });
});


test("coin solution replay visibly moves coins before the scale settles", async ({ page }) => {
  await page.goto("/yesterday/play");
  await page.waitForLoadState("domcontentloaded");

  const coinOne = page.locator(".moving-coin").filter({ hasText: /^1$/ });
  const before = await coinOne.boundingBox();
  expect(before).not.toBeNull();

  await page.getByRole("button", { name: "Next →", exact: true }).click();
  await expect(page.getByText("PLACING COINS…")).toBeVisible();

  await page.waitForTimeout(350);
  const during = await coinOne.boundingBox();
  expect(during).not.toBeNull();

  await page.waitForTimeout(1450);
  const after = await coinOne.boundingBox();
  expect(after).not.toBeNull();

  expect(Math.abs((during?.x ?? 0) - (before?.x ?? 0))).toBeGreaterThan(2);
  expect(Math.abs((after?.x ?? 0) - (during?.x ?? 0))).toBeGreaterThan(2);
  await expect(page.locator(".replay-scale")).toHaveClass(/left-down/);
});

test("archive entries open playable past riddles", async ({ page }) => {
  await page.goto("/archive");
  await page.waitForLoadState("domcontentloaded");

  const replay = page.getByRole("link", { name: /Replay The Two Ropes/i });
  await expect(replay).toBeVisible();
  await replay.click();

  await expect(page).toHaveURL(/\/riddle\/1$/);
  await expect(page.getByRole("heading", { name: "The Two Ropes" })).toBeVisible();
  await expect(page.getByText("Use the ropes — not a timer")).toBeVisible();
  await expect(page.getByRole("link", { name: "Close past riddle" })).toBeVisible();
  await expect(page.getByText(/Back to today's riddle/i)).toHaveCount(0);
});

test("saved solve loads directly into the solved-today screen and can repeat", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("daily-riddle-5", JSON.stringify({ solved: true, guesses: 4 }));
  });
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");

  await expect(page.getByRole("heading", { name: /You solved today's riddle/i })).toBeVisible();
  await expect(page.getByText(/after 4 guesses/)).toBeVisible();

  const linksBox = await page.locator(".solved-links").boundingBox();
  const repeatButton = page.getByRole("button", { name: /Repeat riddle/i });
  const repeatBox = await repeatButton.boundingBox();
  const countdownBox = await page.locator(".next-riddle-countdown").boundingBox();
  const viewport = page.viewportSize();

  expect(linksBox).not.toBeNull();
  expect(repeatBox).not.toBeNull();
  expect(countdownBox).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect((repeatBox?.y ?? 0)).toBeGreaterThan((linksBox?.y ?? 0) + (linksBox?.height ?? 0));
  expect((repeatBox?.y ?? 0) + (repeatBox?.height ?? 0)).toBeLessThan(countdownBox?.y ?? Infinity);
  expect(Math.abs((repeatBox?.x ?? 0) + (repeatBox?.width ?? 0) / 2 - (viewport?.width ?? 0) / 2)).toBeLessThan(18);

  await repeatButton.click();
  await expect(page.getByText("THE SETUP")).toBeVisible();
});

test("solved screen stays inside a narrow phone viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.addInitScript(() => {
    window.localStorage.setItem("daily-riddle-5", JSON.stringify({ solved: true, guesses: 2 }));
  });
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.locator(".next-riddle-countdown strong")).toBeVisible();
  await expect(page.getByRole("button", { name: /Repeat riddle/i })).toBeVisible();
});


test("temporary test riddle keeps the normal midnight countdown", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");

  await expect(page.getByText("Next puzzle", { exact: true })).toBeVisible();
  await expect(page.locator(".drop-clock strong")).toHaveText(/\d{2}:\d{2}:\d{2}/);
});


test("homepage illustration stays scene-first instead of repeating riddle instructions", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");

  const illustration = page.locator("figure.illustration-wrap");
  await expect(illustration.locator("svg")).toBeVisible();
  await expect(illustration.locator("svg text")).toHaveCount(0);
});

test("secondary pages use the same top-right close pattern", async ({ page }) => {
  await page.goto("/yesterday");
  await expect(page.getByRole("link", { name: "Close solution" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Today", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Back to today's riddle/i })).toHaveCount(0);

  await page.goto("/archive");
  await expect(page.getByRole("link", { name: "Close archive" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Today", exact: true })).toHaveCount(0);

  await page.goto("/yesterday/play");
  await expect(page.getByRole("link", { name: "Close solution animation" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Solution$/ })).toHaveCount(0);
});
