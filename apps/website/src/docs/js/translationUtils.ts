import { getRelativeLocaleUrl } from "astro:i18n";

// data
import {
	textTranslations,
	dataTranslations,
	routeTranslations,
} from "@/docs/config/translationData.json";
import { locales, defaultLocale } from "@/docs/config/siteSettings.json";

/**
 * * text translation helper function
 * @param locale: Language to use for translation, one of the locales
 * @returns function you can use to translate strings according to the src/config/translations.json file
 *
 * ## Example
 *
 * ```ts
 * import { useTranslations, getLocaleFromUrl } from "@/docs/js/i18nUtils";
 * const currLocale = getLocaleFromUrl(Astro.url);
 * const t = useTranslations(currLocale);
 * t("blog.time"); // translated string for key "blog.time" in the current locale
 * ```
 */
export function useTranslations(locale: keyof typeof textTranslations) {
	return function t(key: keyof (typeof textTranslations)[typeof locale]) {
		return textTranslations[locale][key] || textTranslations[defaultLocale][key];
	};
}

type Locale = keyof typeof dataTranslations;
type DataKey<T extends Locale> = keyof (typeof dataTranslations)[T];
/**
 * * data file translation helper function
 * @param data: key in the data file to translate, like "siteData" or "navData"
 * @param locale: Language to use for translation, one of the locales
 * @returns appropriate data file as specified in src/config/i18nData.json.ts
 *
 * ## Example
 *
 * ```ts
 * import { getLocaleFromUrl } from "@/docs/js/i18nUtils";
 * import { getTranslatedData } from "@/docs/js/translationUtils";
 * const currLocale = getLocaleFromUrl(Astro.url);
 * const siteData = getTranslatedData("siteData", currLocale);
 * ```
 */
export function getTranslatedData<T extends Locale, K extends DataKey<T>>(
	data: K,
	locale: T,
): (typeof dataTranslations)[T][K] {
	return dataTranslations[locale][data] || dataTranslations[defaultLocale as T][data];
}

/**
 * * take in a language (ex "de"), and the current URL, and return correct URL for the passed language
 * This is really only used in the language switcher component
 *
 * @param locale: new language
 * @param url: current URL (Astro.url)
 * @returns new URL pathname as a string
 */
export function getLocalizedPathname(locale: (typeof locales)[number], url: URL): string {
	// figure out if the current URL has a language in it's path
	const [, lang, ...rest] = url.pathname.split("/");

	const getKeyByValue = (obj: Record<string, string>, value: string): string | undefined => {
		return Object.keys(obj).find((key) => obj[key] === value.replace(/\/$/, "").replace(/^\//, ""));
	};

	let oldPath: string, currLocale: (typeof locales)[number];
	//@ts-ignore
	if (locales.includes(lang)) {
		// remove locale from URL if it's already there
		oldPath = rest.join("/");
		currLocale = lang as (typeof locales)[number];
		// newPath = getRelativeLocaleUrl(locale, rest.join("/"));
	} else {
		// otherwise, just create the URL from the existing path
		// this is the case if default locale and Astro config has `prefixDefaultLocale: false`
		oldPath = url.pathname;
		currLocale = defaultLocale;
		// newPath = getRelativeLocaleUrl(locale, url.pathname);
	}

	// trim any starting and ending slashes for comparison
	const routeStringTrimmed = oldPath.replace(/\/$/, "").replace(/^\//, "");

	// first find out if the passed value maps to a key for route translations
	const routeTranslationsKey = getKeyByValue(routeTranslations[currLocale], routeStringTrimmed);

	// if there is a key, then use that key to get the translated route
	const translatedRoute = routeTranslationsKey
		? routeTranslations[locale][routeTranslationsKey]
		: routeStringTrimmed;

	return getRelativeLocaleUrl(locale, translatedRoute);
}
