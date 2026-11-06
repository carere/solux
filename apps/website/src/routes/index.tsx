import { createFileRoute } from "@tanstack/solid-router";
import { DocsPage } from "../components/docs-page";
import { introductionPage, pageName } from "../content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${pageName(introductionPage())} · Solux` },
      { name: "description", content: introductionPage().description },
    ],
  }),
  component: () => <DocsPage page={introductionPage()} />,
});
