import { expect, test } from "@playwright/test";

test.describe("Signal Atlas server rendering", () => {
  test.use({ javaScriptEnabled: false });

  test("the chosen identity and stylesheet render before JavaScript in both languages", async ({
    page,
    context,
    baseURL,
  }) => {
    for (const locale of ["en", "fr"]) {
      await context.addCookies([
        { name: "solux_locale", value: locale, url: baseURL ?? "http://127.0.0.1:4173" },
      ]);
      const response = await page.goto("/");
      expect(response?.status()).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("data-design", "atlas");
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toBeVisible();
      const stylesheet = await page.locator('link[rel="stylesheet"]').first().getAttribute("href");
      expect(stylesheet).toBeTruthy();
      const css = await page.request.get(new URL(stylesheet ?? "", page.url()).href);
      expect(css.status()).toBe(200);
      expect(css.headers()["content-type"]).toContain("text/css");
      await expect(
        page.getByRole("region", {
          name: locale === "en" ? "Live counter example" : "Exemple de compteur interactif",
          exact: true,
        }),
      ).toHaveCount(1);
    }
  });
});

test("Signal Atlas keeps its live example and identity across documentation, locale, and theme", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const demo = page.getByRole("region", { name: "Live counter example", exact: true });
  await expect(demo).toHaveCount(1);
  await demo.getByRole("button", { name: "Increment +1", exact: true }).click();
  await expect(demo.getByLabel("Counter value", { exact: true })).toHaveText("1");
  await expect(demo.getByLabel("Doubled value", { exact: true })).toHaveText("2");
  await expect(demo.locator(".event-log li").first()).toHaveText(
    '{"type":"counter/increment","payload":1}',
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.locator(".landing-actions").getByRole("link", { name: "Get started" }).click();
  await expect(page).toHaveURL(/\/docs\/getting-started$/);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-design", "atlas");
  await page.getByLabel("Language", { exact: true }).selectOption("fr");
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(page).toHaveURL(/\/docs\/getting-started$/);
  await page.getByRole("button", { name: "Changer le thème", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-design", "atlas");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test("old comparison URLs cannot select another identity or propagate comparison parameters", async ({
  page,
}) => {
  await page.goto("/?design=workshop");
  await expect(page.locator("html")).toHaveAttribute("data-design", "atlas");
  await expect(page.locator(".design-comparison")).toHaveCount(0);
  await page.locator(".landing-actions").getByRole("link", { name: "Get started" }).click();
  await expect(page).toHaveURL(/\/docs\/getting-started$/);
});

test("each dispatch renews its activity cue and reduced motion keeps state updates", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const demo = page.getByRole("region", { name: "Live counter example", exact: true });
  await expect(demo.getByLabel("Counter value", { exact: true })).toHaveText("0");
  await demo.getByRole("button", { name: "Increment +1", exact: true }).click();
  await expect(demo.getByLabel("Counter value", { exact: true })).toHaveText("1");
  const renewed = await page.evaluate(() => {
    const button = document.querySelector<HTMLButtonElement>(".demo .button-row button");
    const flow = document.querySelector(".event-flow");
    button?.click();
    const first = flow?.getAnimations()[0];
    button?.click();
    const second = flow?.getAnimations()[0];
    return Boolean(first && second && first !== second && first.playState === "idle");
  });
  expect(renewed).toBe(true);
  await expect(demo.getByLabel("Counter value", { exact: true })).toHaveText("3");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await demo.getByRole("button", { name: "Reset counter", exact: true }).click();
  await expect(demo.getByLabel("Counter value", { exact: true })).toHaveText("0");
  await expect(page.locator(".event-flow")).toContainText("counter/reset");
  await expect(page.locator(".event-flow")).toContainText("value = 0");
  expect(await page.locator(".event-flow").evaluate((flow) => flow.getAnimations().length)).toBe(0);
});
