// Adapted from Zaidan src/components/docs-page.tsx; see ../../ZAIDAN-NOTICE.md.
import { Link } from "@tanstack/solid-router";
import { For, type ParentProps, Show } from "solid-js";
import { groupName, localizedPages, pageName } from "../content";
import type { DocPage } from "../docs";
import { cn } from "../lib/utils";
import * as m from "../paraglide/messages";
import { buttonVariants } from "../registry/ui/button";
import { CodeBlock } from "./CodeBlock";
import { CounterDemo, ScopesDemo } from "./Demos";
import { LandingIntro } from "./LandingIntro";

function DocLink(props: ParentProps<{ href: string; class?: string }>) {
  const slug = () => props.href.slice("/docs/".length).split("#")[0] ?? "";
  return (
    <Show
      when={props.href.startsWith("/docs/")}
      fallback={
        <a
          href={props.href}
          class={cn(buttonVariants({ variant: "link", size: null }), "doc-link", props.class)}
          data-slot="button"
        >
          {props.children}
        </a>
      }
    >
      <Link
        to="/docs/$slug"
        params={{ slug: slug() }}
        hash={props.href.split("#")[1]}
        class={cn(buttonVariants({ variant: "link", size: null }), "doc-link", props.class)}
        data-slot="button"
      >
        {props.children}
      </Link>
    </Show>
  );
}

export function DocsPage(props: { page: DocPage }) {
  return (
    <Show when={props.page} keyed>
      {(_page) => (
        <div
          data-slot="docs"
          class="docs-page"
          classList={{ "is-introduction": props.page.slug === "introduction" }}
        >
          <div class="docs-reading-column">
            <article>
              <div class="breadcrumbs">
                <span>{m.documentation()}</span>
                <span aria-hidden="true">/</span>
                <span>{groupName(props.page.group)}</span>
              </div>
              <Show
                when={props.page.slug === "introduction"}
                fallback={
                  <>
                    <h1>{props.page.title}</h1>
                    <p class="page-description">{props.page.description}</p>
                  </>
                }
              >
                <LandingIntro page={props.page} />
              </Show>
              <For each={props.page.sections}>
                {(section) => (
                  <section class="doc-section" aria-labelledby={section.id}>
                    <h2 id={section.id} tabIndex={-1}>
                      <DocLink href={`#${section.id}`}>
                        {section.title}
                        <span class="heading-anchor" aria-hidden="true">
                          #
                        </span>
                      </DocLink>
                    </h2>
                    <For each={section.paragraphs}>{(paragraph) => <p>{paragraph}</p>}</For>
                    <Show when={section.note}>
                      <aside class="note">
                        <strong>{m.keep_in_mind()}</strong>
                        <p>{section.note}</p>
                      </aside>
                    </Show>
                    <Show when={section.bullets}>
                      <ul class="content-list">
                        <For each={section.bullets}>{(bullet) => <li>{bullet}</li>}</For>
                      </ul>
                    </Show>
                    <Show when={section.table}>
                      {(table) => (
                        <section
                          class="table-scroll"
                          aria-label={m.reference_table({ title: section.title })}
                          // biome-ignore lint/a11y/noNoninteractiveTabindex: The overflow region must support keyboard scrolling.
                          tabIndex={0}
                        >
                          <table>
                            <thead>
                              <tr>
                                <For each={table().headings}>
                                  {(heading) => <th scope="col">{heading}</th>}
                                </For>
                              </tr>
                            </thead>
                            <tbody>
                              <For each={table().rows}>
                                {(row) => (
                                  <tr>
                                    <For each={row}>
                                      {(cell, index) =>
                                        index() === 0 ? (
                                          <th scope="row">
                                            <code>{cell}</code>
                                          </th>
                                        ) : (
                                          <td>{cell}</td>
                                        )
                                      }
                                    </For>
                                  </tr>
                                )}
                              </For>
                            </tbody>
                          </table>
                        </section>
                      )}
                    </Show>
                    <Show when={section.code}>{(code) => <CodeBlock {...code()} />}</Show>
                    <Show when={section.demo === "counter" && props.page.slug !== "introduction"}>
                      <CounterDemo />
                    </Show>
                    <Show when={section.demo === "scopes"}>
                      <ScopesDemo />
                    </Show>
                    <Show when={section.links}>
                      <ul class="related-links">
                        <For each={section.links}>
                          {(link) => (
                            <li>
                              <DocLink href={link.href}>
                                {link.label}
                                <span aria-hidden="true">→</span>
                              </DocLink>
                            </li>
                          )}
                        </For>
                      </ul>
                    </Show>
                  </section>
                )}
              </For>
            </article>
            <nav class="page-pagination" aria-label={m.adjacent()}>
              <Show
                when={localizedPages()[localizedPages().indexOf(props.page) - 1]}
                fallback={<span />}
              >
                {(previous) => (
                  <DocLink href={`/docs/${previous().slug}`}>
                    <span>{m.previous()}</span>
                    {pageName(previous())}
                  </DocLink>
                )}
              </Show>
              <Show when={localizedPages()[localizedPages().indexOf(props.page) + 1]}>
                {(next) => (
                  <DocLink href={`/docs/${next().slug}`}>
                    <span>{m.next()}</span>
                    {pageName(next())}
                    <span aria-hidden="true" class="pagination-arrow">
                      →
                    </span>
                  </DocLink>
                )}
              </Show>
            </nav>
            <footer class="page-footer">
              <span>{m.license()}</span>
              <DocLink href="https://github.com/carere/solux/issues">{m.improve_docs()}</DocLink>
            </footer>
          </div>
          <aside class="table-of-contents">
            <nav aria-label={m.on_this_page()}>
              <p>{m.on_this_page()}</p>
              <For each={props.page.sections}>
                {(section) => <DocLink href={`#${section.id}`}>{section.title}</DocLink>}
              </For>
            </nav>
            <p class="source-note">
              {m.source_docs()}
              <br />
              <Link
                to="/docs/$slug"
                params={{ slug: "migration" }}
                class={cn(buttonVariants({ variant: "link", size: null }), "doc-link")}
                data-slot="button"
              >
                {m.release_status()}
              </Link>
            </p>
          </aside>
        </div>
      )}
    </Show>
  );
}

export function NotFound() {
  return (
    <article class="not-found">
      <h1>{m.not_found()}</h1>
      <p>{m.not_found_description()}</p>
      <Link
        to="/docs/$slug"
        params={{ slug: "introduction" }}
        class={buttonVariants()}
        data-slot="button"
      >
        {m.back_intro()}
      </Link>
    </article>
  );
}
