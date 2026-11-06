import { type DocPage, pages, searchableText } from "./docs";
import { frenchPages } from "./docs.fr";
import * as m from "./paraglide/messages";
import { getLocale } from "./paraglide/runtime";

// Keep translated data outside docs.ts to avoid a runtime import cycle.
export const localizedPages = () => (getLocale() === "fr" ? frenchPages : pages);
export const pageName = (page: DocPage) =>
  page.slug === "introduction" ? m.introduction() : page.title;
export function searchPages(query: string) {
  const terms = query.trim().toLocaleLowerCase(getLocale()).split(/\s+/).filter(Boolean);
  return terms.length
    ? localizedPages().filter((page) => {
        const text = `${pageName(page)} ${searchableText(page)}`.toLocaleLowerCase(getLocale());
        return terms.every((term) => text.includes(term));
      })
    : [];
}
export const groupName = (group: DocPage["group"]) =>
  ({
    "Start here": m.group_start,
    "Core concepts": m.group_core,
    "In practice": m.group_practice,
    Resources: m.group_resources,
  })[group]();

export function introductionPage() {
  const page = localizedPages().find((page) => page.slug === "introduction");
  if (!page) throw new Error("The localized introduction is missing.");
  return page;
}
