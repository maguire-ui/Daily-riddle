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
  await page.waitForTimeout(750);
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

test("typed bridge answer rejects only-the-number and accepts the actual method", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");

  const input = page.getByLabel("Your solution");
  await input.fill("17");
  await page.getByRole("button", { name: "CHECK ANSWER" }).click();
  await expect(page.getByText("Not quite.")).toBeVisible();

  await input.fill("1 and 2 cross, 1 returns, 7 and 10 cross, 2 returns, then 1 and 2 cross again for 17 minutes.");
  await page.getByRole("button", { name: "CHECK ANSWER" }).click();
  await expect(page.getByText("Correct.")).toBeVisible();
});
