import { createSignal, For, onCleanup } from "solid-js";
import type { CodeSample } from "../docs";
import * as m from "../paraglide/messages";
import { Button } from "../registry/ui/button";

function tokenize(value: string) {
  return value
    .split(
      /(\/\/[^\n]*|#[^\n]*|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b(?:import|from|export|const|let|function|return|if|else|try|finally|async|await|type|interface|undefined|true|false|new|throw)\b|\b\d+\b)/g,
    )
    .filter(Boolean)
    .map((text) => ({
      text,
      kind: /^(\/\/|#)/.test(text)
        ? "comment"
        : /^["']/.test(text)
          ? "string"
          : /^\d/.test(text)
            ? "number"
            : /^(import|from|export|const|let|function|return|if|else|try|finally|async|await|type|interface|undefined|true|false|new|throw)$/.test(
                  text,
                )
              ? "keyword"
              : "plain",
    }));
}

export function CodeBlock(props: CodeSample) {
  const [status, setStatus] = createSignal<"idle" | "success" | "failure">("idle");
  let timer: ReturnType<typeof setTimeout> | undefined;
  onCleanup(() => clearTimeout(timer));
  const copy = async () => {
    let success = false;
    try {
      await navigator.clipboard.writeText(props.value);
      success = true;
    } catch {
      const previous = document.activeElement;
      const textarea = document.createElement("textarea");
      textarea.value = props.value;
      textarea.className = "clipboard-fallback";
      textarea.setAttribute("aria-label", m.code_to_copy());
      document.body.append(textarea);
      textarea.select();
      try {
        success = document.execCommand("copy");
      } catch {
        /* Show recovery below. */
      }
      textarea.remove();
      if (previous instanceof HTMLElement) previous.focus({ preventScroll: true });
    }
    setStatus(success ? "success" : "failure");
    clearTimeout(timer);
    timer = setTimeout(() => setStatus("idle"), 2400);
  };
  return (
    <figure class="code-panel">
      <figcaption>
        <span>{props.label}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={copy}
          aria-label={m.copy_label({ label: props.label })}
        >
          <span aria-live="polite">
            {status() === "success"
              ? m.copied()
              : status() === "failure"
                ? m.select_code()
                : m.copy_code()}
          </span>
        </Button>
      </figcaption>
      {/* Keyboard users need to reach the horizontally scrollable code region. */}
      {/* biome-ignore lint/a11y/noNoninteractiveTabindex: This overflow region supports keyboard scrolling. */}
      <section class="code-scroll" tabIndex={0} aria-label={props.label}>
        <pre>
          <code>
            <For each={tokenize(props.value)}>
              {(token) => <span class={`syntax-${token.kind}`}>{token.text}</span>}
            </For>
          </code>
        </pre>
      </section>
    </figure>
  );
}
