import { createMemo, createSignal, For, onCleanup, Show } from "solid-js";
import { appendPoint, createChartStore } from "../examples/chart";
import { createCounterStore, increment, reset } from "../examples/counter";
import * as m from "../paraglide/messages";
import { Button } from "../registry/ui/button";

export function CounterDemo(props: { onEvent?: (type: string) => void } = {}) {
  const store = createCounterStore();
  const doubled = createMemo(() => store.state.counter.value * 2);
  const [events, setEvents] = createSignal<string[]>([]);
  const subscription = store.subscribe(({ event }) => {
    setEvents((previous) => [JSON.stringify(event), ...previous].slice(0, 3));
    props.onEvent?.(event.type);
  });
  onCleanup(() => {
    subscription.unsubscribe();
    store.dispose();
  });
  return (
    <section class="demo" aria-label={m.counter_example()}>
      <div class="demo-heading">
        <span class="live-dot" />
        {m.live_example()}
        <span class="demo-caption">{m.public_reactivity()}</span>
      </div>
      <div class="counter-values">
        <div>
          <span>state.counter.value</span>
          <output aria-label={m.counter_value()} aria-live="polite">
            {store.state.counter.value}
          </output>
        </div>
        <div>
          <span>createMemo(() =&gt; value * 2)</span>
          <output aria-label={m.doubled_value()}>{doubled()}</output>
        </div>
      </div>
      <div class="button-row">
        <Button type="button" onClick={() => store.dispatch(increment(1))}>
          {m.increment()}
        </Button>
        <Button type="button" variant="outline" onClick={() => store.dispatch(increment(-1))}>
          {m.decrement()}
        </Button>
        <Button type="button" variant="secondary" onClick={() => store.dispatch(reset())}>
          {m.reset_counter()}
        </Button>
      </div>
      <div class="event-log">
        <span>{m.recent_events()}</span>
        <Show when={events().length} fallback={<p>{m.dispatch_hint()}</p>}>
          <ol>
            <For each={events()}>
              {(event) => (
                <li>
                  <code>{event}</code>
                </li>
              )}
            </For>
          </ol>
        </Show>
      </div>
    </section>
  );
}

function ChartScope(props: { name: string }) {
  const [store, setStore] = createSignal(createChartStore());
  const [disposed, setDisposed] = createSignal(false);
  const [notifications, setNotifications] = createSignal(0);
  const [generation, setGeneration] = createSignal(1);
  const [lastEvent, setLastEvent] = createSignal<string | undefined>();
  const listen = (current: ReturnType<typeof createChartStore>) =>
    current.subscribe(({ event }) => {
      setNotifications((count) => count + 1);
      setLastEvent(JSON.stringify(event));
    });
  let subscription = listen(store());
  const points = () => store().state.series.points;
  const coordinates = createMemo(() =>
    points()
      .map(
        (point, index) => `${16 + index * (268 / Math.max(1, points().length - 1))},${112 - point}`,
      )
      .join(" "),
  );
  const add = () => store().dispatch(appendPoint(20 + ((points().length * 17) % 70)));
  const dispose = () => {
    store().dispose();
    setDisposed(true);
  };
  const recreate = () => {
    subscription.unsubscribe();
    store().dispose();
    setNotifications(0);
    setLastEvent(undefined);
    setStore(createChartStore());
    subscription = listen(store());
    setDisposed(false);
    setGeneration((value) => value + 1);
  };
  onCleanup(() => {
    subscription.unsubscribe();
    store().dispose();
  });
  return (
    <section class="chart-scope" aria-label={m.chart_name({ name: props.name })}>
      <div class="scope-heading">
        <h3>{m.chart_name({ name: props.name })}</h3>
        <span classList={{ "scope-status": true, disposed: disposed() }}>
          {disposed() ? m.disposed() : m.active()} · #{generation()}
        </span>
      </div>
      <svg
        class="chart"
        viewBox="0 0 300 128"
        role="img"
        aria-label={m.chart_alt({ name: props.name, count: points().length })}
      >
        <path class="chart-grid" d="M16 32H284 M16 72H284 M16 112H284" />
        <polyline points={coordinates()} />
        <For each={points()}>
          {(point, index) => (
            <circle
              cx={16 + index() * (268 / Math.max(1, points().length - 1))}
              cy={112 - point}
              r="3"
            />
          )}
        </For>
      </svg>
      <dl class="scope-data">
        <div>
          <dt>{m.points()}</dt>
          <dd data-testid={`points-${props.name}`}>{points().length}</dd>
        </div>
        <div>
          <dt>{m.notifications()}</dt>
          <dd data-testid={`notifications-${props.name}`}>{notifications()}</dd>
        </div>
      </dl>
      <div class="button-row">
        <Button type="button" onClick={add}>
          {disposed() ? m.try_dispatch() : m.add_point()}
        </Button>
        <Button type="button" variant="outline" onClick={dispose} disabled={disposed()}>
          {m.dispose()}
        </Button>
        <Button type="button" variant="secondary" onClick={recreate}>
          {m.recreate()}
        </Button>
      </div>
      <code class="scope-state" data-testid={`state-${props.name}`}>
        {JSON.stringify(store().state)}
      </code>
      <p class="scope-event">{lastEvent() ?? m.no_events()}</p>
    </section>
  );
}

export function ScopesDemo() {
  return (
    <section class="demo scopes-demo" aria-label={m.scopes_example()}>
      <div class="demo-heading">
        <span class="live-dot" />
        {m.two_stores()}
      </div>
      <p class="demo-description">{m.scopes_description()}</p>
      <div class="scope-grid">
        <ChartScope name="A" />
        <ChartScope name="B" />
      </div>
      <p class="demo-footnote">{m.scopes_footnote()}</p>
    </section>
  );
}
