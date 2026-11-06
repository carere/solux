import { expect, type Page, test } from "@playwright/test";

async function openMenuIfMobile(page: Page) {
  const button = page.getByRole("button", { name: "Menu", exact: true });
  if (await button.isVisible()) await button.click();
}

test("counter dispatches public events and updates Solid derivations", async ({ page }) => {
  await page.goto("/");
  const demo = page.getByRole("region", { name: "Live counter example" });
  await expect(demo.getByLabel("Counter value", { exact: true })).toHaveText("0");
  await demo.getByRole("button", { name: "Increment +1" }).click();
  await demo.getByRole("button", { name: "Increment +1" }).click();
  await expect(demo.getByLabel("Counter value", { exact: true })).toHaveText("2");
  await expect(demo.getByLabel("Doubled value")).toHaveText("4");
  await expect(demo.locator(".event-log li").first()).toHaveText(
    '{"type":"counter/increment","payload":1}',
  );
  await demo.getByRole("button", { name: "Decrement −1" }).click();
  await expect(demo.getByLabel("Counter value", { exact: true })).toHaveText("1");
  await demo.getByRole("button", { name: "Reset counter" }).click();
  await expect(demo.getByLabel("Doubled value")).toHaveText("0");
  await expect(demo.locator(".event-log li").first()).toHaveText('{"type":"counter/reset"}');
});

test("chart stores stay independent across disposal, late dispatch, and recreation", async ({
  page,
}) => {
  await page.goto("/docs/store-lifecycle");
  const a = page.getByRole("region", { name: "Chart A", exact: true });
  const b = page.getByRole("region", { name: "Chart B", exact: true });
  await a.getByRole("button", { name: "Add point", exact: true }).click();
  await expect(a.getByTestId("points-A")).toHaveText("5");
  await expect(a.getByTestId("notifications-A")).toHaveText("1");
  await expect(b.getByTestId("points-B")).toHaveText("4");
  await expect(b.getByTestId("notifications-B")).toHaveText("0");
  const finalA = await a.getByTestId("state-A").textContent();
  await a.getByRole("button", { name: "Dispose", exact: true }).click();
  await expect(a.getByRole("button", { name: "Dispose", exact: true })).toBeDisabled();
  await a.getByRole("button", { name: "Try dispatch after disposal" }).click();
  await expect(a.getByTestId("state-A")).toHaveText(finalA ?? "");
  await expect(a.getByTestId("notifications-A")).toHaveText("1");
  await b.getByRole("button", { name: "Add point", exact: true }).click();
  await expect(b.getByTestId("points-B")).toHaveText("5");
  await expect(b.getByTestId("notifications-B")).toHaveText("1");
  await a.getByRole("button", { name: "Recreate" }).click();
  await expect(a.getByTestId("points-A")).toHaveText("4");
  await expect(a.getByTestId("notifications-A")).toHaveText("0");
  await expect(b.getByTestId("points-B")).toHaveText("5");
  await a.getByRole("button", { name: "Add point", exact: true }).click();
  await expect(a.getByTestId("notifications-A")).toHaveText("1");
  // A route change unmounts these owners; returning creates fresh stores.
  await openMenuIfMobile(page);
  await page
    .getByRole("navigation", { name: "Documentation", exact: true })
    .getByRole("link", { name: "Introduction", exact: true })
    .click();
  await page.goBack();
  await expect(page.getByTestId("points-A")).toHaveText("4");
  await expect(page.getByTestId("points-B")).toHaveText("4");
});

test("docs have distinct history routes, titles, deep links, and a recovery page", async ({
  page,
}) => {
  await page.goto("/");
  await openMenuIfMobile(page);
  const navigation = page.getByRole("navigation", { name: "Documentation", exact: true });
  await navigation.getByRole("link", { name: "Get started", exact: true }).click();
  await expect(page).toHaveURL(/\/docs\/getting-started$/);
  await expect(page).toHaveTitle("Get started · Solux");
  await expect(page.getByRole("main")).toBeFocused();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Get started", exact: true })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveTitle("Introduction · Solux");
  await page.goForward();
  await expect(page).toHaveTitle("Get started · Solux");
  await page.goto("/docs/devtools#commands");
  await expect(
    page.getByRole("heading", { name: "What the commands actually do" }),
  ).toBeInViewport();
  await page.goto("/docs/does-not-exist");
  await expect(page).toHaveTitle("Page not found · Solux");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await page.getByRole("link", { name: "Back to the introduction" }).click();
  await expect(page).toHaveURL(/\/docs\/introduction$/);
  await page.goto("/unknown");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});

test("full-text search supports keyboard selection, escape, and no results", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("/");
  const search = page.getByRole("searchbox", { name: "Search documentation" });
  await expect(search).toBeFocused();
  await search.fill("intro");
  await expect(
    page
      .getByRole("region", { name: "Search results" })
      .getByRole("link", { name: /^Introduction/ }),
  ).toBeVisible();
  await search.fill("sortComparer");
  await expect(page.getByRole("region", { name: "Search results" })).toBeVisible();
  await search.press("ArrowDown");
  await expect(page.locator(".search-result").first()).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/docs\/entity-adapter$/);
  await expect(page.getByRole("main")).toBeFocused();
  await page.keyboard.press("Control+k");
  await search.fill("zz_no_matching_document");
  await expect(page.getByText(/No matching pages/)).toBeVisible();
  await search.press("Escape");
  await expect(page.getByRole("region", { name: "Search results" })).not.toBeVisible();
  await expect(search).toBeFocused();
  await search.fill("dispose");
  await expect(page.locator(".search-result")).not.toHaveCount(0);
});

test("theme follows the system and persists an explicit preference", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await openMenuIfMobile(page);
  await page.getByLabel("Appearance").selectOption("dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await openMenuIfMobile(page);
  await expect(page.getByLabel("Appearance")).toHaveValue("dark");
  await page.getByLabel("Appearance").selectOption("system");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("skip link, mobile disclosure, and layout remain usable", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  if (testInfo.project.name === "mobile") {
    const menu = page.getByRole("button", { name: "Menu", exact: true });
    await expect(
      page.getByRole("navigation", { name: "Documentation", exact: true }),
    ).not.toBeVisible();
    await menu.click();
    await expect(page.getByRole("button", { name: "Close menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expect(
      page
        .getByRole("navigation", { name: "Documentation", exact: true })
        .getByRole("link", { name: "Introduction", exact: true }),
    ).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(menu).toBeFocused();
    await menu.click();
    await page
      .getByRole("navigation", { name: "Documentation", exact: true })
      .getByRole("link", { name: "DevTools & time travel" })
      .click();
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("main")).toBeFocused();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test("copy buttons copy complete executable example source", async ({
  page,
  context,
}, testInfo) => {
  test.skip(
    testInfo.project.name === "mobile",
    "Desktop Chromium verifies the browser clipboard permission path.",
  );
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page
    .getByRole("button", { name: "Copy counter.ts · the running example", exact: true })
    .click();
  await expect(page.getByText("Copied!", { exact: true })).toBeVisible();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toContain('from "@carere/solux"');
  expect(clipboard).toContain("export function createCounterStore()");
});
