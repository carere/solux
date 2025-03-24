import { type TestimonialItem } from "../types/configDataTypes";

import Geoffrey from "@images/testimonials/geoffrey.webp";
import BowTiedFocus from "@images/testimonials/BowTiedFocus.jpg";
import Aniket from "@images/testimonials/aniket_p.jpg";
import David from "@images/testimonials/david-g-davedev.png";
import Damiano from "@images/testimonials/damiano.jpg";
import Connor from "@images/testimonials/connor.webp";

export const testimonialData: TestimonialItem[] = [
	{
		avatar: Geoffrey,
		name: "Geoffrey",
		title: "Founder of Montagne Noire Web Studio",
		testimonial: `Just spinning my first premium cosmic theme, Galaxy, and super impressed with the DX. 
    The readme, the scripts and the tours :chefskiss: Super good job.
    `,
	},
	{
		avatar: Connor,
		name: "Connor D",
		title: "Developer",
		testimonial: `Cosmic Themes offers more than stunning templates built on a rock-solid Astro
     foundation—it fosters a vibrant community. With value-added perks like Discord and GitHub 
     invites, Cosmic Themes is a no-brainer for anyone launching a new Astro project.
      `,
	},
	{
		avatar: David,
		name: "David G",
		title: "Web Developer",
		testimonial: `It's the cleanest template standup experience ever! I've never used Astro, but looking at the demo, code, it
    should be fairly simple pickup on top of my existing React and NextJS experience.
      `,
	},
	{
		avatar: BowTiedFocus,
		name: "BowTiedFocus",
		title: "Freelance Web Developer",
		testimonial: `The theme is ridiculously well put together and documented.
      I learned a ton about Astro engineering by studying it, and I've already used some of the components
      for my web design clients. Plus, it shaved hours off my dev time so I could focus on writing
      SEO articles instead of coding something from scratch.
      `,
	},
	{
		avatar: Aniket,
		name: "Aniket P",
		title: "Data Scientist",
		testimonial: `I'm not a front-end dev, but I wanted to rebuild my personal site with Astro. If you're in the same shoes,
    I can't recommend enough Cosmic Themes. The entire process required exactly one CSS change.
      `,
	},

	{
		avatar: Damiano,
		name: "Damiano L",
		title: "C++ Developer",
		testimonial: `Cosmic Themes provides some of the best Astro themes out there. They are well designed, easy to customize and, 
    most importantly, the team is very responsive concerning support and feature requests. Using their themes allows you to forget 
    about the design and focus on content creation.
      `,
	},
];

export default testimonialData;
