import { expect, test } from "@playwright/test";

const slugs = [
  "introduction",
  "getting-started",
  "events-and-slices",
  "reactive-state",
  "store-lifecycle",
  "devtools",
  "middleware-and-epics",
  "entity-adapter",
  "api-reference",
  "migration",
  "contributing",
];

test("cookie SSR locales remain isolated under concurrent requests", async ({ request }) => {
  const responses = await Promise.all(
    Array.from({ length: 24 }, async (_, index) => {
      const locale = index % 2 ? "fr" : "en";
      const response = await request.get("/docs/getting-started", {
        headers: { Cookie: `solux_locale=${locale}` },
      });
      expect(response.status()).toBe(200);
      expect(response.headers()["content-language"]).toBe(locale);
      expect(response.headers()["cache-control"]).toBe("private, no-store");
      expect(response.headers().vary).toMatch(/cookie/i);
      const html = await response.text();
      expect(html).toMatch(new RegExp(`<html[^>]+lang="${locale}"`));
      expect(html).toContain(locale === "fr" ? "Premiers pas" : "Get started");
      expect(html).toContain(
        locale === "fr" ? "Rechercher dans la documentation" : "Search documentation",
      );
      return locale;
    }),
  );
  expect(responses.filter((locale) => locale === "fr")).toHaveLength(12);
  const fallback = await request.get("/", {
    headers: { Cookie: "solux_locale=invalid", "Accept-Language": "fr" },
  });
  expect(fallback.headers()["content-language"]).toBe("en");
});

test("all documentation pages render HTML without JavaScript in both languages", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const locale of ["en", "fr"]) {
    await context.addCookies([
      { name: "solux_locale", value: locale, url: baseURL ?? "http://127.0.0.1:4173" },
    ]);
    for (const slug of slugs) {
      const response = await page.goto(`/docs/${slug}`);
      expect(response?.status(), slug).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toBeVisible();
    }
    for (const path of ["/unknown", "/docs/does-not-exist"]) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(404);
      await expect(
        page.getByRole("heading", {
          name: locale === "en" ? "Page not found" : "Page introuvable",
        }),
      ).toBeVisible();
    }
  }
  await context.close();
});

test("French hydrates, localizes controls and search, and persists locale on the same URL", async ({
  page,
  context,
  baseURL,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await context.addCookies([
    { name: "solux_locale", value: "fr", url: baseURL ?? "http://127.0.0.1:4173" },
  ]);
  await page.goto("/?ref=language#the-event-flow");
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await page.getByRole("button", { name: "Incrémenter +1", exact: true }).click();
  await expect(page.getByLabel("Valeur du compteur", { exact: true })).toHaveText("1");
  await page.getByRole("button", { name: "Réinitialiser le compteur" }).click();
  await expect(page.getByLabel("Valeur du compteur", { exact: true })).toHaveText("0");
  const search = page.getByRole("searchbox", { name: "Rechercher dans la documentation" });
  await search.fill("libération");
  await expect(page.locator(".search-result")).not.toHaveCount(0);
  await search.fill("zzzzz_no_match");
  await expect(
    page.getByRole("region", { name: "Résultats de recherche" }).getByRole("status"),
  ).toContainText("Aucune page trouvée");
  await search.press("Escape");
  await page.getByLabel("Langue", { exact: true }).selectOption("en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page).toHaveURL(/\/?\?ref=language#the-event-flow$/);
  expect((await context.cookies()).find((cookie) => cookie.name === "solux_locale")?.value).toBe(
    "en",
  );
  await expect(page.getByLabel("Counter value", { exact: true })).toHaveText("0");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByLabel("Language", { exact: true }).selectOption("fr");
  await expect(page.getByRole("button", { name: "Incrémenter +1", exact: true })).toBeVisible();
  await expect(page.getByLabel("Langue", { exact: true })).toHaveValue("fr");
  expect(errors).toEqual([]);
});

test("French chart lifecycle controls and copy status are translated", async ({
  page,
  context,
  baseURL,
}, info) => {
  await context.addCookies([
    { name: "solux_locale", value: "fr", url: baseURL ?? "http://127.0.0.1:4173" },
  ]);
  await page.goto("/docs/store-lifecycle");
  const a = page.getByRole("region", { name: "Graphique A", exact: true });
  await a.getByRole("button", { name: "Ajouter un point" }).click();
  await expect(a.getByTestId("points-A")).toHaveText("5");
  await a.getByRole("button", { name: "Libérer", exact: true }).click();
  await expect(a.getByText(/Libéré/)).toBeVisible();
  await a.getByRole("button", { name: "Essayer un envoi après libération" }).click();
  await expect(a.getByTestId("points-A")).toHaveText("5");
  await a.getByRole("button", { name: "Recréer" }).click();
  await expect(a.getByTestId("points-A")).toHaveText("4");
  if (info.project.name === "desktop") {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.getByRole("button", { name: /^Copier chart.ts/ }).click();
    await expect(page.getByText("Copié !", { exact: true })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("createChartStore");
  }
});
