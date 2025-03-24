import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import AutoImport from "astro-auto-import";
import compress from "@playform/compress";
import icon from "astro-icon";
import expressiveCode from "astro-expressive-code";

// https://astro.build/config
export default defineConfig({
	site: "https://pathfinder.cosmicthemes.com",
	// i18n configuration must match src/docs/config/translationData.json.ts
	i18n: {
		defaultLocale: "en",
		locales: ["en", "fr"],
		routing: {
			prefixDefaultLocale: false,
		},
	},
	integrations: [
		// auto-imported component into all mdx files
		AutoImport({
			imports: [
				// https://github.com/delucis/astro-auto-import
				"@/docs/components/mdx-components/Aside.astro",
				"@/docs/components/mdx-components/Badge.astro",
				"@/docs/components/mdx-components/Button.astro",
				"@/docs/components/mdx-components/Steps.astro",
				"@/docs/components/mdx-components/Tabs.astro",
				"@/docs/components/mdx-components/TabsContent.astro",
				"@/docs/components/mdx-components/TabsList.astro",
				"@/docs/components/mdx-components/TabsTrigger.astro",
			],
		}),
		expressiveCode({
			themes: ["houston"],
			styleOverrides: {
				codeBackground: "var(--expressive-code-bg)",
				// borderColor: "var(--expressive-code-bg)",
				borderColor: "var(--color-base-800)",
				borderRadius: ".5rem",
				uiFontFamily: "inherit",
				frames: {
					editorActiveTabBackground: "var(--expressive-code-bg)",
					editorTabBarBackground: "var(--expressive-code-bg-darker)",
					editorBackground: "var(--expressive-code-bg)",
					terminalBackground: "var(--expressive-code-bg)",
					terminalTitlebarBackground: "var(--expressive-code-bg-darker)",
					frameBoxShadowCssValue: "0",
					tooltipSuccessBackground: "var(--success)",
					tooltipSuccessForeground: "var(--success-foreground)",
				},
			},
		}),
		mdx(),
		icon(),
		sitemap(),
		compress({
			HTML: true,
			JavaScript: true,
			CSS: true,
			Image: false, // astro:assets handles this. Enabling this can dramatically increase build times
			SVG: false, // astro-icon handles this
		}),
	],

	vite: {
		plugins: [tailwindcss()],
		// stop inlining short scripts to fix issues with ClientRouter: https://github.com/withastro/astro/issues/12804
		build: {
			assetsInlineLimit: 0,
		},
	},

	// this is used by default with Starwind UI
	experimental: {
		svg: {
			mode: "sprite",
		},
	},
});
