import type { DocSection } from "../types/configDataTypes";

/**
 * Ordered list of documentation sections
 * The order here determines the display order in navigation
 */
const docSections: DocSection[] = [
	{
		id: "getting-started",
		title: "Getting Started",
	},
	{
		id: "components",
		title: "Components",
	},
	{
		id: "reference",
		title: "Reference",
	},
];

export default docSections;
