import { createFileRoute, notFound } from "@tanstack/solid-router";
import { Show } from "solid-js";
import { DocsPage } from "../components/docs-page";
import { localizedPages, pageName } from "../content";
import * as m from "../paraglide/messages";

export const Route = createFileRoute("/docs/$slug")({
  beforeLoad: ({ params }) => {
    if (!localizedPages().some((page) => page.slug === params.slug)) throw notFound();
  },
  head: ({ params }) => {
    const page = localizedPages().find((page) => page.slug === params.slug);
    return {
      meta: page
        ? [
            { title: `${pageName(page)} · Solux` },
            { name: "description", content: page.description },
          ]
        : [{ title: `${m.not_found()} · Solux` }],
    };
  },
  component: DocRoute,
});
function DocRoute() {
  const params = Route.useParams();
  const page = () => localizedPages().find((page) => page.slug === params().slug);
  // A keyed owner releases each page's subscriptions and stores on navigation.
  return (
    <Show when={page()} keyed>
      {(page) => <DocsPage page={page} />}
    </Show>
  );
}
