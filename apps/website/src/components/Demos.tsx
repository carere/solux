import { createMemo, createSignal, For, onCleanup, Show } from "solid-js";
import { appendPoint, createChartStore } from "../examples/chart";
import { createCounterStore, increment, reset } from "../examples/counter";

export function CounterDemo() {
  const store = createCounterStore();
  const doubled = createMemo(() => store.state.counter.value * 2);
  const [events, setEvents] = createSignal<string[]>([]);
  const subscription = store.subscribe(({ event }) => {
    setEvents((previous) => [JSON.stringify(event), ...previous].slice(0, 3));
  });
  onCleanup(() => {
    subscription.unsubscribe();
    store.dispose();
  });
  return (
    <section class="demo" aria-label="Live counter example">
      <div class="demo-heading">
        <span class="live-dot" />
        Live example<span class="demo-caption">Public package · Solid reactivity</span>
      </div>
      <div class="counter-values">
        <div>
          <span>state.counter.value</span>
          <output aria-label="Counter value" aria-live="polite">
            {store.state.counter.value}
          </output>
        </div>
        <div>
          <span>createMemo(() =&gt; value * 2)</span>
          <output aria-label="Doubled value">{doubled()}</output>
        </div>
      </div>
      <div class="button-row">
        <button type="button" class="primary" onClick={() => store.dispatch(increment(1))}>
          Increment +1
        </button>
        <button type="button" onClick={() => store.dispatch(increment(-1))}>
          Decrement −1
        </button>
        <button type="button" onClick={() => store.dispatch(reset())}>
          Reset counter
        </button>
      </div>
      <div class="event-log">
        <span>Recent events</span>
        <Show when={events().length} fallback={<p>Dispatch an event to see it here.</p>}>
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
  const [lastEvent, setLastEvent] = createSignal("No events yet");
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
    setLastEvent("No events yet");
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
    <section class="chart-scope" aria-label={`Chart ${props.name}`}>
      <div class="scope-heading">
        <h3>Chart {props.name}</h3>
        <span classList={{ "scope-status": true, disposed: disposed() }}>
          {disposed() ? "Disposed" : "Active"} · #{generation()}
        </span>
      </div>
      <svg
        class="chart"
        viewBox="0 0 300 128"
        role="img"
        aria-label={`Chart ${props.name}: ${points().length} synthetic data points`}
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
          <dt>Points</dt>
          <dd data-testid={`points-${props.name}`}>{points().length}</dd>
        </div>
        <div>
          <dt>Notifications</dt>
          <dd data-testid={`notifications-${props.name}`}>{notifications()}</dd>
        </div>
      </dl>
      <div class="button-row">
        <button type="button" onClick={add}>
          {disposed() ? "Try dispatch after disposal" : "Add point"}
        </button>
        <button type="button" onClick={dispose} disabled={disposed()}>
          Dispose
        </button>
        <button type="button" onClick={recreate}>
          Recreate
        </button>
      </div>
      <code class="scope-state" data-testid={`state-${props.name}`}>
        {JSON.stringify(store().state)}
      </code>
      <p class="scope-event">{lastEvent()}</p>
    </section>
  );
}

export function ScopesDemo() {
  return (
    <section class="demo scopes-demo" aria-label="Independent chart stores example">
      <div class="demo-heading">
        <span class="live-dot" />
        Two stores, one event type
      </div>
      <p class="demo-description">
        Synthetic data. Add a point in A; B keeps its own state. Dispose A, try a dispatch, then
        recreate it with fresh state.
      </p>
      <div class="scope-grid">
        <ChartScope name="A" />
        <ChartScope name="B" />
      </div>
      <p class="demo-footnote">
        Disposal closes the core event stream. Final state stays readable. Navigating away
        explicitly disposes both stores.
      </p>
    </section>
  );
}
