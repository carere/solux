import { Link, useLocation } from "@tanstack/solid-router";
import { Monitor } from "lucide-solid";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  onMount,
  type ParentProps,
  Show,
} from "solid-js";
import logo from "../../../images/solux.svg";
import { DocsSidebar } from "./components/docs-sidebar";
import { ModeSwitcher } from "./components/mode-switcher";
import { pageName, searchPages } from "./content";
import { cn } from "./lib/utils";
import * as m from "./paraglide/messages";
import { getLocale, setLocale } from "./paraglide/runtime";
import { useColorMode } from "./registry/components/color-mode";
import { Button, buttonVariants } from "./registry/ui/button";
import { Input } from "./registry/ui/input";
import { NativeSelect, NativeSelectOption } from "./registry/ui/native-select";
import { SidebarProvider, SidebarTrigger } from "./registry/ui/sidebar";

export function App(props: ParentProps) {
  const location = useLocation();
  const isHome = () => location().pathname === "/" || location().pathname === "/docs/introduction";
  const [query, setQuery] = createSignal("");
  const [searchOpen, setSearchOpen] = createSignal(false);
  const results = createMemo(() => searchPages(query()));
  const searchVisible = () => searchOpen() && query().trim().length > 0;
  const { useSystem } = useColorMode();
  let searchInput: HTMLInputElement | undefined;
  let searchArea: HTMLElement | undefined;
  let main: HTMLElement | undefined;
  const focusPage = () => {
    const hash = window.location.hash.slice(1);
    let target: HTMLElement | null | undefined;
    try {
      target = hash ? document.getElementById(decodeURIComponent(hash)) : main;
    } catch {
      target = main;
    }
    target?.focus({ preventScroll: true });
    if (hash) target?.scrollIntoView();
  };
  let mounted = false;
  createEffect(() => {
    location().pathname;
    if (!mounted) return;
    setSearchOpen(false);
    setQuery("");
    queueMicrotask(focusPage);
  });
  onMount(() => {
    mounted = true;
    if (window.location.hash) queueMicrotask(focusPage);
    const key = (event: KeyboardEvent) => {
      const editing =
        event.target instanceof HTMLElement &&
        (event.target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName));
      if (
        ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") ||
        (event.key === "/" && !editing)
      ) {
        event.preventDefault();
        searchInput?.focus();
        searchInput?.select();
        setSearchOpen(true);
      }
      if (event.key === "Escape" && searchVisible()) {
        searchInput?.focus();
        setSearchOpen(false);
      }
    };
    const click = (event: PointerEvent) => {
      if (event.target instanceof Node && !searchArea?.contains(event.target)) setSearchOpen(false);
    };
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", click);
    onCleanup(() => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", click);
    });
  });
  const selectResult = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      searchArea?.querySelector<HTMLAnchorElement>(".search-result")?.focus();
    }
  };
  return (
    <SidebarProvider class={cn("site-shell", isHome() && "is-home")}>
      <a
        class={cn(buttonVariants({ variant: "outline", size: "lg" }), "skip-link")}
        data-slot="button"
        href="#main-content"
      >
        {m.skip_content()}
      </a>
      <header class="site-header">
        <Link
          to="/"
          class={cn(buttonVariants({ variant: "ghost", size: null }), "brand")}
          data-slot="button"
          aria-label="Solux"
        >
          <img src={logo} alt="" width="32" height="32" />
          <span>solux</span>
        </Link>
        <Show when={isHome()} fallback={<span class="header-release">{m.documentation()}</span>}>
          <nav class="header-nav" aria-label={m.home_navigation()}>
            <Link
              to="/docs/$slug"
              params={{ slug: "getting-started" }}
              class={buttonVariants({ variant: "ghost", size: "sm" })}
              data-slot="button"
            >
              {m.documentation()}
            </Link>
            <Link
              to="/docs/$slug"
              params={{ slug: "api-reference" }}
              class={buttonVariants({ variant: "ghost", size: "sm" })}
              data-slot="button"
            >
              {m.explore_api()}
            </Link>
          </nav>
        </Show>
        <search class="search-area" ref={searchArea}>
          <Input
            ref={searchInput}
            type="search"
            aria-label={m.search_docs()}
            placeholder={m.search_placeholder()}
            value={query()}
            aria-expanded={searchVisible()}
            aria-controls="search-results"
            onFocus={() => setSearchOpen(true)}
            onInput={(event) => {
              setQuery(event.currentTarget.value);
              setSearchOpen(true);
            }}
            onKeyDown={selectResult}
          />
          <kbd>/</kbd>
          <Show when={searchVisible()}>
            <section id="search-results" class="search-results" aria-label={m.search_results()}>
              <p role="status">
                {results().length ? m.search_count({ count: results().length }) : m.no_results()}
              </p>
              <For each={results()}>
                {(page, index) => (
                  <Link
                    class={cn(
                      buttonVariants({ variant: "ghost", size: null }),
                      "search-result whitespace-normal",
                    )}
                    data-slot="button"
                    to="/docs/$slug"
                    params={{ slug: page.slug }}
                    onClick={() => {
                      setSearchOpen(false);
                      setQuery("");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                        event.preventDefault();
                        const items =
                          searchArea?.querySelectorAll<HTMLAnchorElement>(".search-result");
                        const next = index() + (event.key === "ArrowDown" ? 1 : -1);
                        if (next < 0) searchInput?.focus();
                        else items?.[next]?.focus();
                      }
                    }}
                  >
                    <strong>{pageName(page)}</strong>
                    <span>{page.description}</span>
                  </Link>
                )}
              </For>
            </section>
          </Show>
        </search>
        <div class="header-controls">
          <Button
            as="a"
            class="github-link"
            href="https://github.com/carere/solux"
            variant="ghost"
            size="sm"
          >
            GitHub
          </Button>
          <label class="sr-only" for="locale">
            {m.language()}
          </label>
          <NativeSelect
            id="locale"
            aria-label={m.language()}
            value={getLocale()}
            onChange={(event) => {
              void setLocale(event.currentTarget.value === "fr" ? "fr" : "en");
            }}
          >
            <NativeSelectOption value="en" selected={getLocale() === "en"}>
              English
            </NativeSelectOption>
            <NativeSelectOption value="fr" selected={getLocale() === "fr"}>
              Français
            </NativeSelectOption>
          </NativeSelect>
          <ModeSwitcher />
          <Button
            variant="ghost"
            size="icon"
            title={m.system_theme()}
            aria-label={m.system_theme()}
            onClick={useSystem}
          >
            <Monitor />
          </Button>
          <SidebarTrigger class="mobile-menu-trigger" />
        </div>
      </header>
      <div class="site-layout">
        <DocsSidebar />
        <main id="main-content" tabIndex={-1} ref={main}>
          {props.children}
        </main>
      </div>
    </SidebarProvider>
  );
}
