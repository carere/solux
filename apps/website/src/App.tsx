import { createEffect, createMemo, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import logo from "../../../images/solux.svg";
import { CodeBlock } from "./components/CodeBlock";
import { CounterDemo, ScopesDemo } from "./components/Demos";
import { type DocPage, pages, searchableText } from "./docs";

const groups = ["Start here", "Core concepts", "In practice", "Resources"] as const;
const pageName = (page: DocPage) => (page.slug === "introduction" ? "Introduction" : page.title);
const searchIndex = pages.map((page) => ({
  page,
  text: `${pageName(page)} ${searchableText(page)}`.toLowerCase(),
}));
type Theme = "system" | "light" | "dark";

function readTheme(): Theme {
  try {
    const value = localStorage.getItem("solux-theme");
    if (value === "light" || value === "dark") return value;
  } catch {
    /* System preference also works with storage disabled. */
  }
  return "system";
}

export function App() {
  const [path, setPath] = createSignal(window.location.pathname);
  const [mobileOpen, setMobileOpen] = createSignal(false);
  const [query, setQuery] = createSignal("");
  const [searchOpen, setSearchOpen] = createSignal(false);
  const [theme, setTheme] = createSignal<Theme>(readTheme());
  const [systemDark, setSystemDark] = createSignal(
    matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const page = createMemo(() => {
    const current = path().replace(/\/+$/, "") || "/";
    return pages.find(
      (entry) =>
        current === `/docs/${entry.slug}` || (current === "/" && entry.slug === "introduction"),
    );
  });
  const results = createMemo(() => {
    const terms = query().trim().toLowerCase().split(/\s+/).filter(Boolean);
    return terms.length
      ? searchIndex
          .filter(({ text }) => terms.every((term) => text.includes(term)))
          .map(({ page }) => page)
      : [];
  });
  const searchVisible = () => searchOpen() && query().trim().length > 0;
  let searchInput: HTMLInputElement | undefined;
  let searchArea: HTMLElement | undefined;
  let main: HTMLElement | undefined;
  let menuButton: HTMLButtonElement | undefined;
  let navigation: HTMLElement | undefined;

  const focusPage = () => {
    const hash = window.location.hash.slice(1);
    let target: HTMLElement | null | undefined;
    try {
      target = hash ? document.getElementById(decodeURIComponent(hash)) : main;
    } catch {
      target = main;
    }
    if (hash && target) {
      target.scrollIntoView();
      target.focus({ preventScroll: true });
    } else {
      window.scrollTo(0, 0);
      main?.focus({ preventScroll: true });
    }
  };
  const navigate = (href: string) => {
    history.pushState(null, "", href);
    setPath(window.location.pathname);
    setMobileOpen(false);
    setSearchOpen(false);
    setQuery("");
    queueMicrotask(focusPage);
  };

  createEffect(() => {
    const active = page();
    document.title = `${active ? pageName(active) : "Page not found"} · Solux`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        active?.description ?? "Find your way back to the Solux documentation.",
      );
  });
  createEffect(() => {
    const value = theme();
    const dark = value === "dark" || (value === "system" && systemDark());
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", dark ? "#14191a" : "#faf9f6");
  });
  const changeTheme = (value: Theme) => {
    setTheme(value);
    try {
      localStorage.setItem("solux-theme", value);
    } catch {
      /* Keep the current session usable. */
    }
  };
  onMount(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const systemChanged = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    const pop = () => {
      setPath(window.location.pathname);
      setMobileOpen(false);
      setSearchOpen(false);
      setQuery("");
      queueMicrotask(focusPage);
    };
    const click = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      if (searchArea && !searchArea.contains(event.target)) setSearchOpen(false);
      const anchor = event.target.closest("a");
      if (
        !anchor ||
        anchor.target ||
        anchor.hasAttribute("download") ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const url = new URL(anchor.href);
      if (
        url.origin === location.origin &&
        (url.pathname.startsWith("/docs/") || url.pathname === "/")
      ) {
        event.preventDefault();
        navigate(url.pathname + url.search + url.hash);
      }
    };
    const key = (event: KeyboardEvent) => {
      const target = event.target;
      const editing =
        target instanceof HTMLElement &&
        (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if (
        ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") ||
        (event.key === "/" && !editing)
      ) {
        event.preventDefault();
        searchInput?.focus();
        searchInput?.select();
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        if (searchVisible()) {
          searchInput?.focus();
          setSearchOpen(false);
        } else if (mobileOpen()) {
          setMobileOpen(false);
          menuButton?.focus();
        }
      }
    };
    media.addEventListener("change", systemChanged);
    window.addEventListener("popstate", pop);
    document.addEventListener("click", click);
    document.addEventListener("keydown", key);
    if (window.location.hash) queueMicrotask(focusPage);
    onCleanup(() => {
      media.removeEventListener("change", systemChanged);
      window.removeEventListener("popstate", pop);
      document.removeEventListener("click", click);
      document.removeEventListener("keydown", key);
    });
  });

  return (
    <>
      <a class="skip-link" href="#main-content">
        Skip to content
      </a>
      <header class="site-header">
        <a class="brand" href="/" aria-label="Solux documentation home">
          <img src={logo} width="38" height="32" alt="" />
          <span>
            Solux<span class="brand-docs"> / docs</span>
          </span>
        </a>
        <div class="header-release">Unreleased docs</div>
        <search class="search-area" ref={searchArea}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const first = results()[0];
              if (first) navigate(`/docs/${first.slug}`);
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m16 16 4 4" />
            </svg>
            <input
              ref={searchInput}
              type="search"
              aria-label="Search documentation"
              placeholder="Search documentation…"
              value={query()}
              onInput={(event) => {
                setQuery(event.currentTarget.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              aria-controls={searchVisible() ? "search-results" : undefined}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown" && searchVisible()) {
                  event.preventDefault();
                  searchArea?.querySelector<HTMLAnchorElement>(".search-result")?.focus();
                }
              }}
            />
            <kbd>/</kbd>
          </form>
          <Show when={searchVisible()}>
            <section
              class="search-results"
              id="search-results"
              aria-label="Search results"
              onKeyDown={(event) => {
                if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
                const anchors = Array.from(
                  searchArea?.querySelectorAll<HTMLAnchorElement>(".search-result") ?? [],
                );
                const index = anchors.indexOf(document.activeElement as HTMLAnchorElement);
                if (index < 0) return;
                event.preventDefault();
                const next = event.key === "ArrowDown" ? index + 1 : index - 1;
                if (next < 0) searchInput?.focus();
                else anchors[next % anchors.length]?.focus();
              }}
            >
              <output class="search-summary">
                {results().length
                  ? `${results().length} matching pages`
                  : "No matching pages. Try “events”, “dispose”, or “DevTools”."}
              </output>
              <For each={results()}>
                {(result) => (
                  <a class="search-result" href={`/docs/${result.slug}`}>
                    <strong>{pageName(result)}</strong>
                    <span>{result.description}</span>
                  </a>
                )}
              </For>
            </section>
          </Show>
        </search>
        <a class="github-link" href="https://github.com/carere/solux">
          GitHub
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 17 17 7M7 7h10v10" />
          </svg>
        </a>
        <button
          type="button"
          ref={menuButton}
          class="menu-toggle"
          aria-controls="docs-navigation"
          aria-expanded={mobileOpen()}
          onClick={() => {
            const opening = !mobileOpen();
            setMobileOpen(opening);
            if (opening)
              queueMicrotask(() => {
                const link =
                  navigation?.querySelector<HTMLAnchorElement>('a[aria-current="page"]') ??
                  navigation?.querySelector<HTMLAnchorElement>("a");
                link?.focus();
              });
          }}
        >
          {mobileOpen() ? "Close menu" : "Menu"}
        </button>
      </header>
      <div class="site-layout">
        <aside classList={{ sidebar: true, "is-open": mobileOpen() }} id="docs-navigation">
          <nav ref={navigation} aria-label="Documentation">
            <For each={groups}>
              {(group) => (
                <div class="nav-group">
                  <p>{group}</p>
                  <For each={pages.filter((entry) => entry.group === group)}>
                    {(entry) => (
                      <a
                        href={`/docs/${entry.slug}`}
                        aria-current={page()?.slug === entry.slug ? "page" : undefined}
                      >
                        {pageName(entry)}
                      </a>
                    )}
                  </For>
                </div>
              )}
            </For>
          </nav>
          <div class="sidebar-footer">
            <label for="theme-preference">Appearance</label>
            <select
              id="theme-preference"
              value={theme()}
              onChange={(event) => changeTheme(event.currentTarget.value as Theme)}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
            <p>
              Made for SolidJS.
              <br />
              Published package: 4.0.1
            </p>
          </div>
        </aside>
        <main id="main-content" ref={main} tabIndex={-1}>
          <Show
            when={page()}
            keyed
            fallback={
              <article class="not-found">
                <h1>Page not found</h1>
                <p>
                  This address does not match a documentation page. Search the docs or start with
                  the introduction.
                </p>
                <a class="text-link" href="/docs/introduction">
                  Back to the introduction <span aria-hidden="true">→</span>
                </a>
              </article>
            }
          >
            {(active) => (
              <>
                <article>
                  <div class="breadcrumbs">
                    <span>Documentation</span>
                    <span aria-hidden="true">/</span>
                    <span>{active.group}</span>
                  </div>
                  <h1 classList={{ "intro-title": active.slug === "introduction" }}>
                    {active.title}
                  </h1>
                  <p class="page-description">{active.description}</p>
                  <Show when={active.slug === "introduction"}>
                    <div class="intro-links">
                      <a class="primary button-link" href="/docs/getting-started">
                        Get started <span aria-hidden="true">→</span>
                      </a>
                      <a href="/docs/api-reference">
                        Explore the API <span aria-hidden="true">↗</span>
                      </a>
                    </div>
                  </Show>
                  <For each={active.sections}>
                    {(section) => (
                      <section class="doc-section" aria-labelledby={section.id}>
                        <h2 id={section.id} tabIndex={-1}>
                          <a href={`#${section.id}`}>
                            {section.title}
                            <span class="heading-anchor" aria-hidden="true">
                              #
                            </span>
                          </a>
                        </h2>
                        <For each={section.paragraphs}>{(paragraph) => <p>{paragraph}</p>}</For>
                        <Show when={section.note}>
                          <aside class="note">
                            <strong>Keep in mind</strong>
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
                              aria-label={`${section.title} reference table`}
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
                        <Show when={section.demo === "counter"}>
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
                                  <a href={link.href}>
                                    {link.label}
                                    <span aria-hidden="true">→</span>
                                  </a>
                                </li>
                              )}
                            </For>
                          </ul>
                        </Show>
                      </section>
                    )}
                  </For>
                </article>
                <nav class="page-pagination" aria-label="Adjacent pages">
                  <Show when={pages[pages.indexOf(active) - 1]} fallback={<span />}>
                    {(previous) => (
                      <a href={`/docs/${previous().slug}`}>
                        <span>Previous</span>
                        {pageName(previous())}
                      </a>
                    )}
                  </Show>
                  <Show when={pages[pages.indexOf(active) + 1]}>
                    {(next) => (
                      <a href={`/docs/${next().slug}`}>
                        <span>Next</span>
                        {pageName(next())}
                        <span aria-hidden="true" class="pagination-arrow">
                          →
                        </span>
                      </a>
                    )}
                  </Show>
                </nav>
                <footer class="page-footer">
                  <span>Solux · MIT licensed</span>
                  <a href="https://github.com/carere/solux/issues">Improve these docs</a>
                </footer>
              </>
            )}
          </Show>
        </main>
        <Show when={page()}>
          {(active) => (
            <aside class="table-of-contents">
              <nav aria-label="On this page">
                <p>On this page</p>
                <For each={active().sections}>
                  {(section) => <a href={`#${section.id}`}>{section.title}</a>}
                </For>
              </nav>
              <p class="source-note">
                Source-first documentation.
                <br />
                <a href="/docs/migration">
                  Check release status <span aria-hidden="true">↗</span>
                </a>
              </p>
            </aside>
          )}
        </Show>
      </div>
    </>
  );
}
