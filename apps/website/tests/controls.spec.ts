import { expect, test } from "@playwright/test";

test("the Zaidan language selector keeps its chevron centered and clear of both labels", async ({
  page,
}) => {
  await page.goto("/");
  for (const locale of ["en", "fr"]) {
    const select = page.locator('[data-slot="native-select"]');
    await expect(select).toHaveCount(1);
    await select.selectOption(locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await page.evaluate(() => document.fonts.ready);
    const geometry = await select.evaluate((node) => {
      const field = node as HTMLSelectElement;
      const icon = field.parentElement?.querySelector('[data-slot="native-select-icon"]');
      const rect = field.getBoundingClientRect();
      const iconRect = icon?.getBoundingClientRect();
      const style = getComputedStyle(field);
      const context = document.createElement("canvas").getContext("2d");
      if (context) context.font = style.font;
      const textWidth = context?.measureText(field.selectedOptions[0]?.text ?? "").width ?? 0;
      return {
        appearance: style.appearance,
        centered: iconRect
          ? Math.abs(iconRect.y + iconRect.height / 2 - rect.y - rect.height / 2)
          : 99,
        textGap: iconRect
          ? iconRect.left - rect.left - Number.parseFloat(style.paddingLeft) - textWidth
          : -1,
        endGap: iconRect ? rect.right - iconRect.right : -1,
        iconWidth: iconRect?.width ?? 0,
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    expect(geometry.appearance).toBe("none");
    expect(geometry.centered).toBeLessThanOrEqual(1);
    expect(geometry.textGap).toBeGreaterThanOrEqual(4);
    expect(geometry.endGap).toBeGreaterThanOrEqual(8);
    expect(geometry.iconWidth).toBe(16);
    expect(geometry.overflow).toBe(false);
  }
});

test("website actions and action links use Zaidan button primitives", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("button:not(.z-button)")).toHaveCount(0);
  await expect(
    page.locator("a:not(.z-button):not(.z-sidebar-menu-button):not(.skip-link)"),
  ).toHaveCount(0);
  const actions = page.locator(".landing-actions a");
  await expect(actions).toHaveCount(2);
  for (const action of await actions.all()) {
    await expect(action).toHaveAttribute("data-slot", "button");
    await expect(action).toHaveClass(/z-button/);
  }
  const copy = page.getByRole("button", { name: "Copy install command", exact: true });
  await expect(copy).toHaveAttribute("data-slot", "button");
  await expect(copy).toHaveClass(/z-button-size-icon/);
  await actions.first().click();
  await expect(page).toHaveURL(/\/docs\/getting-started$/);
  await expect(page.getByRole("main")).toBeFocused();
});
