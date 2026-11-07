import { Link } from "@tanstack/solid-router";
import { ArrowRight, ArrowUpRight, Check, Copy } from "lucide-solid";
import { createSignal, onCleanup, Show } from "solid-js";
import type { DocPage } from "../docs";
import * as m from "../paraglide/messages";
import { CounterDemo } from "./Demos";

const installCommand = "bun add @carere/solux";
const incrementExcerpt = `const increment = createEvent<number>(
  "counter/increment",
);

builder.addHandler(
  increment, (state, { payload }) => {
    state.value += payload;
  },
);`;

export function LandingIntro(props: { page: DocPage }) {
  const [copyStatus, setCopyStatus] = createSignal<"idle" | "success" | "failure">("idle");
  const [lastEvent, setLastEvent] = createSignal("");
  let eventFlow: HTMLElement | undefined;
  let activity: Animation | undefined;
  const showEvent = (type: string) => {
    setLastEvent(type);
    activity?.cancel();
    if (!eventFlow || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    activity = eventFlow.animate(
      [
        { backgroundColor: "color-mix(in srgb, var(--hero-foreground) 18%, transparent)" },
        { backgroundColor: "transparent" },
      ],
      { duration: 480, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    );
  };
  onCleanup(() => activity?.cancel());
  const copyInstall = async () => {
    try {
      await navigator.clipboard.writeText(installCommand);
      setCopyStatus("success");
    } catch {
      setCopyStatus("failure");
    }
  };

  return (
    <section class="landing-intro" aria-labelledby="landing-title">
      <div class="landing-copy">
        <h1 id="landing-title" class="landing-title intro-title">
          {props.page.title}
        </h1>
        <p class="landing-description">{props.page.description}</p>
        <div class="landing-actions">
          <Link to="/docs/$slug" params={{ slug: "getting-started" }} class="primary button-link">
            {m.get_started()} <ArrowRight aria-hidden="true" />
          </Link>
          <Link to="/docs/$slug" params={{ slug: "api-reference" }} class="landing-api-link">
            {m.explore_api()} <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
        <div class="landing-install">
          <code>{installCommand}</code>
          <button
            type="button"
            onClick={copyInstall}
            aria-label={m.copy_label({ label: m.landing_install_label() })}
          >
            <Show when={copyStatus() === "success"} fallback={<Copy aria-hidden="true" />}>
              <Check aria-hidden="true" />
            </Show>
          </button>
          <span class="landing-copy-status" role="status">
            {copyStatus() === "success"
              ? m.copied()
              : copyStatus() === "failure"
                ? m.select_code()
                : ""}
          </span>
        </div>
      </div>

      <section class="landing-workbench" aria-labelledby="workbench-title">
        <div class="workbench-heading">
          <h2 id="workbench-title">{m.landing_workbench_title()}</h2>
          <p>{m.landing_workbench_description()}</p>
        </div>
        <section class="event-flow" aria-label={m.landing_flow_label()} ref={eventFlow}>
          <div class="flow-step" data-active={lastEvent().length > 0}>
            <span>{m.landing_event_label()}</span>
            <code>{lastEvent() || "counter/increment"}</code>
          </div>
          <ArrowRight class="flow-arrow" aria-hidden="true" />
          <div class="flow-step" data-active={lastEvent().length > 0}>
            <span>{m.landing_handler_label()}</span>
            <code>{lastEvent() === "counter/reset" ? "value = 0" : "value += payload"}</code>
          </div>
          <ArrowRight class="flow-arrow" aria-hidden="true" />
          <div class="flow-step" data-active={lastEvent().length > 0}>
            <span>{m.landing_state_label()}</span>
            <code>state.counter.value</code>
          </div>
        </section>
        <div class="workbench-panels">
          <section class="workbench-source" aria-labelledby="workbench-source-title">
            <div class="workbench-source-heading">
              <h3 id="workbench-source-title">{m.landing_source_label()}</h3>
              <span>counter.ts</span>
            </div>
            {/* biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users need to scroll the code excerpt. */}
            <pre tabIndex={0}>
              <code>{incrementExcerpt}</code>
            </pre>
            <a class="workbench-source-link" href="#the-shape-of-a-store">
              {m.landing_full_example()} <ArrowRight aria-hidden="true" />
            </a>
          </section>
          <CounterDemo onEvent={showEvent} />
        </div>
      </section>

      <nav class="landing-paths" aria-label={m.landing_paths_label()}>
        <Link to="/docs/$slug" params={{ slug: "events-and-slices" }} class="landing-path">
          <span class="landing-path-copy">
            <strong>{m.landing_events_title()}</strong>
            <span>{m.landing_events_description()}</span>
          </span>
          <ArrowUpRight aria-hidden="true" />
        </Link>
        <Link to="/docs/$slug" params={{ slug: "reactive-state" }} class="landing-path">
          <span class="landing-path-copy">
            <strong>{m.landing_reactivity_title()}</strong>
            <span>{m.landing_reactivity_description()}</span>
          </span>
          <ArrowUpRight aria-hidden="true" />
        </Link>
        <Link to="/docs/$slug" params={{ slug: "store-lifecycle" }} class="landing-path">
          <span class="landing-path-copy">
            <strong>{m.landing_ownership_title()}</strong>
            <span>{m.landing_ownership_description()}</span>
          </span>
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </nav>
    </section>
  );
}
