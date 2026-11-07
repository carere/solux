import {
  createRootRoute,
  HeadContent,
  Outlet,
  retainSearchParams,
  ScriptOnce,
  Scripts,
  useLocation,
} from "@tanstack/solid-router";
import { Suspense } from "solid-js";
import { HydrationScript } from "solid-js/web";
import logo from "../../../../images/solux.svg";
import { App } from "../App";
import { NotFound } from "../components/docs-page";
import { type DesignVariant, isDesignVariant, readDesign } from "../design";
import * as m from "../paraglide/messages";
import { getLocale } from "../paraglide/runtime";
import { ColorModeProvider, colorModeScript } from "../registry/components/color-mode";
import styles from "../styles.css?url";

export const Route = createRootRoute({
  validateSearch: (search: Record<string, unknown>): { design?: DesignVariant } =>
    isDesignVariant(search.design) ? { design: search.design } : {},
  search: { middlewares: [retainSearchParams(["design"])] },
  head: () => ({
    meta: [
      { title: `${m.not_found()} · Solux` },
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "color-scheme", content: "light dark" },
    ],
    links: [
      { rel: "stylesheet", href: styles },
      { rel: "icon", type: "image/svg+xml", href: logo },
    ],
  }),
  component: () => (
    <App>
      <Outlet />
    </App>
  ),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
});

function RootDocument(props: { children: import("solid-js").JSX.Element }) {
  const location = useLocation();
  return (
    <html
      lang={getLocale()}
      class="light"
      data-theme="light"
      data-design={readDesign(location().search.design)}
    >
      <head>
        <HydrationScript />
        <ScriptOnce>{colorModeScript}</ScriptOnce>
      </head>
      <body class="style-vega">
        <HeadContent />
        <ColorModeProvider initialColorMode="light">
          <Suspense>{props.children}</Suspense>
        </ColorModeProvider>
        <Scripts />
      </body>
    </html>
  );
}
