import type { DocSection } from "@/docs/config/types/configDataTypes";
import { getTranslatedData } from "./translationUtils";
import { locales, defaultLocale } from "@/docs/config/siteSettings.json";
import { getCollection } from "astro:content";
import { filterCollectionByLanguage } from "./localeUtils";

type LocaleType = (typeof locales)[number];

// Cache for translated sections to avoid repeated data fetching
const sectionCache = new Map<LocaleType, DocSection[]>();

/**
 * Get translated sections data with caching
 */
const getTranslatedSections = (locale: LocaleType): DocSection[] => {
	if (!sectionCache.has(locale)) {
		sectionCache.set(locale, getTranslatedData("sidebarNavData", locale) as DocSection[]);
	}
	return sectionCache.get(locale)!;
};

/**
 * Get an array of section IDs in the order they should appear in navigation
 */
export const getOrderedSectionIds = (locale: LocaleType): string[] => {
	return getTranslatedSections(locale).map((section) => section.id);
};

/**
 * Get the section details by ID
 */
export const getSectionById = (id: string, locale: LocaleType): DocSection | undefined => {
	return getTranslatedSections(locale).find((section) => section.id === id);
};

/**
 * Get the title for a documentation section
 */
export const getSectionTitle = (id: string, locale: LocaleType): string => {
	const section = getSectionById(id, locale);
	if (section?.title) return section.title;

	// Fallback to title case if section not found
	return id
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
};

/**
 * Get the previous and next pages for a given doc id
 */
export const getAdjacentPages = async (currentId: string, locale: LocaleType) => {
	// Get all non-draft docs
	const allDocs = await getCollection("docs", ({ data }) => {
		return data.draft !== true;
	});

	// Filter docs by locale
	const filteredDocs = filterCollectionByLanguage(allDocs, locale);

	// Get ordered section IDs and create a Map for faster lookups
	const orderedSectionIds = getOrderedSectionIds(locale);
	const sectionIndexMap = new Map(orderedSectionIds.map((id, index) => [id, index]));

	// Sort docs by section order and then by sidebar order
	const sortedDocs = filteredDocs.sort((a, b) => {
		const [aSection] = a.id.split("/");
		const [bSection] = b.id.split("/");

		// Get section indices
		const aSectionIndex = sectionIndexMap.get(aSection) ?? -1;
		const bSectionIndex = sectionIndexMap.get(bSection) ?? -1;

		// If sections are different, sort by section order
		if (aSectionIndex !== bSectionIndex) {
			return aSectionIndex - bSectionIndex;
		}

		// If in same section, sort by sidebar order if available
		const aOrder = a.data.sidebar?.order;
		const bOrder = b.data.sidebar?.order;

		if (aOrder !== undefined && bOrder !== undefined) {
			return aOrder - bOrder;
		}

		// If only one has order, it should come first
		if (aOrder !== undefined) return -1;
		if (bOrder !== undefined) return 1;

		// If neither has order, sort by title
		return a.data.title.localeCompare(b.data.title, locale);
	});

	// Find the current doc's index
	const currentIndex = sortedDocs.findIndex((doc) => doc.id === currentId);

	return {
		prev:
			currentIndex > 0
				? {
						slug: sortedDocs[currentIndex - 1].id,
						title:
							sortedDocs[currentIndex - 1].data.sidebar?.label ||
							sortedDocs[currentIndex - 1].data.title,
					}
				: null,
		next:
			currentIndex < sortedDocs.length - 1
				? {
						slug: sortedDocs[currentIndex + 1].id,
						title:
							sortedDocs[currentIndex + 1].data.sidebar?.label ||
							sortedDocs[currentIndex + 1].data.title,
					}
				: null,
	};
};
