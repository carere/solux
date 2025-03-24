// site data types

export type Social = {
	social: string;
	link: string;
	icon: string;
};

export type DocsSiteData = {
	title: string;
	description: string;
	navSocials: Social[] | undefined;
	footerSocials: Social[] | undefined;
	defaultImage: {
		src: string;
		alt: string;
	};
	author: {
		name: string;
		email: string;
		twitter: string; // used for twitter cards when sharing a blog post on twitter
	};
};

// --------------------------------------------------------
// nav data types
export interface navLinkItem {
	text: string;
	link: string;
	newTab?: boolean; // adds target="_blank" rel="noopener noreferrer" to link
}

export type navItem = navLinkItem;

// --------------------------------------------------------
// site settings types
export interface DocsSiteSettingsProps {
	useViewTransitions?: boolean;
	copyLinkButtons?: boolean;
	pagination?: boolean;
}

// --------------------------------------------------------
// documentation section types
export type DocSection = {
	/**
	 * Unique identifier for the section. This should match the folder name under src/data/docs/
	 */
	id: string;
	title: string;
};

// --------------------------------------------------------
// testimonial data types
export interface TestimonialItem {
	avatar: ImageMetadata; // an imported image
	name: string;
	title: string;
	testimonial: string;
}
