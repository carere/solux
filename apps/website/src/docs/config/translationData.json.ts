/**
 * * Configuration of the i18n system data files and text translations
 * Example translations below are for English and French, with textTranslations used in src/layouts/BlogLayoutCenter.astro and src/components/hero/[hero].astro
 */

/**
 * * Data file configuration for the i18n system
 * Every {Data} key must exist in the below object
 */
import siteDataEn from "./en/siteData.json";
import navDataEn from "./en/navData.json";
import sidebarNavDataEn from "./en/sidebarNavData.json";
import testimonialDataEn from "./en/testimonialData.json";
import siteDataFr from "./fr/siteData.json";
import navDataFr from "./fr/navData.json";
import sidebarNavDataFr from "./fr/sidebarNavData.json";
import testimonialDataFr from "./fr/testimonialData.json";

export const dataTranslations = {
	en: {
		siteData: siteDataEn,
		navData: navDataEn,
		sidebarNavData: sidebarNavDataEn,
		testimonialData: testimonialDataEn,
	},
	fr: {
		siteData: siteDataFr,
		navData: navDataFr,
		sidebarNavData: sidebarNavDataFr,
		testimonialData: testimonialDataFr,
	},
} as const;

/**
 * * Text translations are used with the `useTranslation` function from src/js/i18nUtils.ts to translate various strings on your site.
 *
 * ## Examples
 *
 * ```ts
 * import { getLocaleFromUrl } from "@/docs/js/localeUtils";
 * import { useTranslations } from "@/docs/js/translationUtils";
 * const currLocale = getLocaleFromUrl(Astro.url);
 * const t = useTranslations(currLocale);
 * t("back_to_all_posts"); // this would be "Retour à tous les articles" if the current locale is "fr"
 * ```
 * or
 * ```ts
 * import { useTranslations } from "@/docs/js/translationUtils";
 * const t = useTranslations("fr");
 * t("back_to_all_posts"); // this would be "Retour à tous les articles"
 * ```
 */
export const textTranslations = {
	en: {
		hero_description: `A modern, fast, and feature-rich documentation theme built with Astro v5 and Tailwind CSS v4. This theme is the documentation for itself, explore and learn!`,
		back_to_all_posts: "Back to all posts",
	},
	fr: {
		hero_description:
			"Je ne parle pas vraiment français donc j'utilise Google Translate pour quelques parties de cette démo.",
		back_to_all_posts: "Retour à tous les articles",
	},
} as const;

/**
 * * Route translations are used to translate route names for the language switcher component
 * This can be useful for SEO reasons. The key does not matter, it just needs to match between languages
 *
 * ## Examples
 *
 * These routes must be everything after the base domain. So if this is "atlas.com/blog", the route would be "blog"
 * Or if this is "atlas.com/blog/my-post", the route would be "blog/my-post"
 */
export const routeTranslations = {
	en: {
		overviewKey: "overview",
	},
	fr: {
		overviewKey: "apercu",
	},
} as const;
