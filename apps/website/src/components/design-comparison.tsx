import { Link, useLocation } from "@tanstack/solid-router";
import { For } from "solid-js";
import { designVariants, readDesign } from "../design";
import * as m from "../paraglide/messages";

export function DesignComparison() {
  const location = useLocation();
  const names = {
    workshop: "Blue Workshop",
    ledger: "Event Ledger",
    atlas: "Signal Atlas",
  };
  const descriptions = {
    workshop: m.design_workshop_description,
    ledger: m.design_ledger_description,
    atlas: m.design_atlas_description,
  };
  return (
    <section class="design-comparison" aria-label={m.design_options()}>
      <div class="design-comparison-copy">
        <strong>{m.design_comparison_title()}</strong>
        <span>{m.design_comparison_hint()}</span>
      </div>
      <nav class="design-options" aria-label={m.design_options()}>
        <For each={designVariants}>
          {(variant) => (
            <Link
              to="."
              search={(previous) => ({ ...previous, design: variant })}
              hash={location().hash}
              activeOptions={{ exact: true }}
              resetScroll={false}
              class="design-option"
              data-variant={variant}
              aria-current={readDesign(location().search.design) === variant ? "page" : undefined}
            >
              <span class="design-swatch" aria-hidden="true" />
              <span>
                <span class="design-name">{names[variant]}</span>
                <span class="design-description">{descriptions[variant]()}</span>
              </span>
            </Link>
          )}
        </For>
      </nav>
    </section>
  );
}
