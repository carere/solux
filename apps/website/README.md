# Welcome to Pathfinder!

This theme uses Astro v5 and Tailwind CSS v4. It is designed so that it can be used as a standalone docs site, but it is also designed to easily integrate with other templates by Cosmic Themes.

## Quickstart

1. To get started, first install all necessary packages with `npm install` or `pnpm install`, then run an initial build to make sure the setup works with `npm run build` or `pnpm build`.
2. Copy the Pagefind build (for site search) to be available for the dev environment. This varies depending on your OS. I've created a few commands to help.
   - For Windows, run `npm run winsearch`
   - For OSX or Linux, run `npm run osxsearch`
3. Next, you'll want to configure your site i18n setup (one language, or multiple). Simply run the command `npm run docs:config-i18n` and follow the script instructions to get setup! For further information, see the [i18n documentation](https://cosmicthemes.com/docs/i18n/).
4. Now you can setup the site to your liking!
   - [Style customization](https://cosmicthemes.com/docs/styles/)
   - [Content editing](https://cosmicthemes.com/docs/content/)
   - [Animations](https://cosmicthemes.com/docs/animations/)
   - [Forms](https://cosmicthemes.com/docs/contact-form/)

Should you need any assistance, send me a message at support@cosmicthemes.com

## Code Intros

I have created a few code tours to help introduce you to the codebase. You will need the extension [Code Tour](https://marketplace.visualstudio.com/items?itemName=vsls-contrib.codetour) to view them in VSCode or another IDE.

## Code Structure

The code is structured with most items under the `src/docs` directory. This makes it easy to drop that entire folder into an existing Cosmic Themes project and to add docs functionality in a matter of minutes.

## Configuration Options

Overall site configuration is done in the `src/docs/config/` folder. Most settings are inside individual language folders in order to make it easier to handle translations.

### Site Settings

The `src/docs/config/siteSettings.json.ts` file is used to configure the site settings. These include things like whether to enable view transitions, whether to enable animations, and whether to show copy link buttons for docs headings.

### Site Data

The `src/docs/config/[language]/siteData.json.ts` file is used to configure the site data. This includes things like the site title, description, social links, and default image.

### Nav Data

Configure your navigation data for the top navbar in the `src/docs/config/[language]/navData.json.ts` file.

### Sidebar Layout

Configure the order for your documentation sections in the `src/docs/config/[language]/sidebarNavData.json.ts` file.

### Robots

For robots like Google to see the correct sitemap, you will want to edit the `public/robots.txt` file to use your website domain.

## More Resources

- See my blog post on [recommended Astro web development setup](https://cosmicthemes.com/blog/astro-web-development-setup/).
- You can learn more information from the [theme docs](https://cosmicthemes.com/docs/) page on the [Cosmic Themes Website](https://cosmicthemes.com/).
- For support, see the [support page](https://cosmicthemes.com/support/).
- [License details](https://cosmicthemes.com/license/)

## General Astro Info

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory. I also frequently use `src/assets` for images when using Astro asssets for image optimization.

### Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

### Want to learn more?

Feel free to check [the documentation](https://docs.astro.build) or jump into the [Discord server](https://astro.build/chat).
