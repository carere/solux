import chartSource from "./examples/chart?raw";
import counterSource from "./examples/counter?raw";

export type CodeSample = { label: string; language?: string; value: string };
type DocSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  code?: CodeSample;
  bullets?: string[];
  table?: { headings: string[]; rows: string[][] };
  note?: string;
  demo?: "counter" | "scopes";
  links?: { label: string; href: string }[];
};
export type DocPage = {
  slug: string;
  title: string;
  group: "Start here" | "Core concepts" | "In practice" | "Resources";
  description: string;
  sections: DocSection[];
};

export const pages: DocPage[] = [
  {
    slug: "introduction",
    title: "State that speaks Solid.",
    group: "Start here",
    description:
      "Typed events. Explicit transitions. Fine-grained reactivity. Solux brings a Flux-style event flow to your SolidJS application.",
    sections: [
      {
        id: "the-event-flow",
        title: "A small, explicit event flow",
        paragraphs: [
          "Create an event, describe how a slice handles it, then dispatch it to a store. Read state directly in Solid JSX or derive a value with createMemo. Solux uses Solid’s store machinery: reactive property reads remain the unit of tracking.",
          "Use it when a dashboard, editor, or application needs named events and shared state transitions. For local UI state, Solid’s own signals and stores may be all you need.",
        ],
        demo: "counter",
      },
      {
        id: "the-shape-of-a-store",
        title: "From event to state",
        code: { label: "counter.ts · the running example", value: counterSource },
        paragraphs: [
          "Handlers synchronously update state with mutable-style syntax through Solid’s produce. Subscriptions receive the state and event after the handler runs, including events that do not change state.",
        ],
        links: [
          { label: "Build your first store", href: "/docs/getting-started" },
          { label: "Read about reactive state", href: "/docs/reactive-state" },
        ],
      },
      {
        id: "about-these-docs",
        title: "Read with the version in mind",
        note: "These docs track the current repository, including unreleased store disposal and DevTools fixes. The published package is 4.0.1. Installing from the registry does not automatically include unreleased changes.",
        paragraphs: [
          "The interactive examples run against this workspace’s public @carere/solux package. Lifecycle and DevTools pages distinguish the new guarantees from the published 4.0.1 behavior.",
        ],
        links: [
          { label: "Release and migration notes", href: "/docs/migration" },
          { label: "Source on GitHub", href: "https://github.com/carere/solux" },
        ],
      },
    ],
  },
  {
    slug: "getting-started",
    title: "Get started",
    group: "Start here",
    description:
      "Install Solux, create a store, and connect it to a Solid component. No provider is required for direct store access.",
    sections: [
      {
        id: "installation",
        title: "Install in a SolidJS project",
        paragraphs: [
          "Use an existing SolidJS + TypeScript application. SolidJS and RxJS are peer dependencies; the current library manifest declares solid-js ^1.9.9 and rxjs ^7.8.2. This website uses SolidJS ^1.9.10. Installing without a version selects the registry release, currently 4.0.1.",
        ],
        code: {
          label: "Terminal",
          language: "bash",
          value:
            "bun add @carere/solux solid-js rxjs\n# Or with npm:\nnpm install @carere/solux solid-js rxjs",
        },
      },
      {
        id: "create-a-store",
        title: "Create events and a slice",
        paragraphs: [
          "Keep creation inside a factory. Each independent store gets its own slice and fresh initial-state objects. Event creators can be shared because they do not own store state.",
        ],
        code: { label: "counter.ts", value: counterSource },
      },
      {
        id: "use-in-solid",
        title: "Read state where Solid tracks it",
        code: {
          label: "Counter.tsx · current repository API",
          language: "tsx",
          value: `import { createMemo, onCleanup } from "solid-js";
import { createCounterStore, increment } from "./counter";

export function Counter() {
  const store = createCounterStore();
  const doubled = createMemo(() => store.state.counter.value * 2);
  // Unreleased: the creator explicitly owns disposal.
  onCleanup(() => store.dispose());

  return <button onClick={() => store.dispatch(increment(1))}>
    {store.state.counter.value} (doubled: {doubled()})
  </button>;
}`,
        },
        paragraphs: [
          "Read state.counter.value inside JSX or a reactive computation. Destructuring a primitive property outside a tracking scope captures its current value and loses future reactive reads. Keep chart instances, DOM nodes, and cleanup functions outside state.",
        ],
        demo: "counter",
      },
      {
        id: "next-steps",
        title: "Choose your next step",
        links: [
          { label: "Understand events and slices", href: "/docs/events-and-slices" },
          { label: "Use a provider or a derived value", href: "/docs/reactive-state" },
          { label: "Create independent stores safely", href: "/docs/store-lifecycle" },
        ],
      },
    ],
  },
  {
    slug: "events-and-slices",
    title: "Events & slices",
    group: "Core concepts",
    description:
      "Name what happened, type its payload, and handle it synchronously in the slices that own the state.",
    sections: [
      {
        id: "event-creators",
        title: "Events describe what happened",
        paragraphs: [
          "An event is an object with a string type. createEvent<P>(name) creates a function that accepts a payload P. Without a payload generic, call the creator without arguments. Creators expose a .type string and a .match(event) boolean check against the event type; match does not validate payload data or act as a TypeScript type predicate.",
          "The optional prepare callback takes one argument and must return an object containing payload. Validate external data before dispatching: event creators do not perform runtime schema validation.",
        ],
        code: {
          label: "events.ts",
          value: `import { createEvent } from "@carere/solux";

const renamed = createEvent<string>("project/renamed");
const cleared = createEvent("project/cleared");
const event = renamed("Observatory");
// { type: "project/renamed", payload: "Observatory" }
console.log(renamed.type, renamed.match(event));
cleared();`,
        },
      },
      {
        id: "handlers",
        title: "Slices own their transitions",
        paragraphs: [
          "createSlice({ initialState, handlers }) returns getInitialState() and handler(state, event). The builder’s addHandler binds an event type to a typed handler. Update the supplied state synchronously; returned replacement objects are not used. A second registration for the same event type replaces the earlier handler within that slice.",
          "The slice retains its supplied initial-state object. getInitialState() is not a factory or an isolation boundary. Allocate a new slice with new nested state for each independent store.",
        ],
        code: {
          label: "project.ts",
          value: `import { createEvent, createSlice } from "@carere/solux";

const renamed = createEvent<string>("project/renamed");
const project = createSlice({
  initialState: { name: "Untitled" },
  handlers: (builder) => builder.addHandler(renamed, (state, event) => {
    state.name = event.payload;
  }),
});`,
        },
      },
      {
        id: "combining-slices",
        title: "Compose by state shape",
        paragraphs: [
          "combineSlices({ counter, project }) creates a root slice with the corresponding keys. Each child handler receives its own part of state for every dispatched event, so multiple slices can react to the same event. Child handlers run in the map’s key order. createHandler<S>(builderCallback) is also exported when you need a handler without an initial-state wrapper.",
        ],
        code: {
          label: "store.ts",
          value: `import { combineSlices, configureStore } from "@carere/solux";
// counter and project are fresh slices created in this factory.
const store = configureStore({
  rootSlice: combineSlices({ counter, project }),
});
store.dispatch(renamed("Observatory"));
console.log(store.state.project.name);`,
        },
      },
    ],
  },
  {
    slug: "reactive-state",
    title: "Reactive state & context",
    group: "Core concepts",
    description:
      "Use Solid’s tracking model directly. Derive values with accessors and memos; add context when passing a store through a component tree helps.",
    sections: [
      {
        id: "tracking",
        title: "Track the property you read",
        paragraphs: [
          "store.state is a Solid store proxy. JSX expressions, createMemo, and effects track reactive property reads. A function accessor preserves a future read; a primitive copied out of the proxy does not. Handler mutation is applied through Solid produce, rather than by replacing the entire state tree for each event.",
        ],
        code: {
          label: "Derived state",
          language: "tsx",
          value: `const value = () => store.state.counter.value;
const doubled = createMemo(() => value() * 2);

// Snapshot only: this primitive will not track later changes.
const { value: snapshot } = store.state.counter;

return <p>{value()} / {doubled()}</p>;`,
        },
      },
      {
        id: "optional-provider",
        title: "Use context when you need it",
        paragraphs: [
          "A provider is optional. Components can receive a store as a prop or close over an owned store. SoluxProvider passes a store to descendants; useSolux<State>() returns that store or undefined when no provider exists. Give useSolux the state type and handle a missing provider explicitly.",
        ],
        code: {
          label: "App.tsx · current repository API",
          language: "tsx",
          value: `import { SoluxProvider, useSolux } from "@carere/solux";
import { onCleanup } from "solid-js";
import { createCounterStore, increment } from "./counter";

type State = ReturnType<typeof createCounterStore>["state"];
function CounterButton() {
  const store = useSolux<State>();
  if (!store) throw new Error("CounterButton requires SoluxProvider");
  return <button onClick={() => store.dispatch(increment(1))}>
    {store.state.counter.value}
  </button>;
}
export function App() {
  const store = createCounterStore();
  onCleanup(() => store.dispose()); // Explicit, unreleased API.
  return <SoluxProvider store={store}><CounterButton /></SoluxProvider>;
}`,
        },
        note: "Unmounting SoluxProvider or disposing a Solid owner does not automatically dispose a store. The store’s creator must register its own cleanup.",
      },
      {
        id: "subscriptions",
        title: "Observe events deliberately",
        paragraphs: [
          "subscribe(listener) receives { state, event } after dispatch. A live subscription immediately replays the latest event if one exists; a new store has no initial event to replay. subscribeToEvent(creator, listener) filters that same stream by type, including its latest matching replay. Both return RxJS subscriptions: call .unsubscribe() when finished.",
          "The callback’s state is the live reactive state, not a historical snapshot. Copy serializable data if you keep a history. An unrelated event may notify subscribers even when no handler changes state.",
        ],
        code: {
          label: "Observe and clean up",
          value: `const subscription = store.subscribe(({ state, event }) => {
  console.log(event.type, state.counter.value);
});
const increments = store.subscribeToEvent(increment, ({ event }) => {
  console.log(event.payload); // Inferred number.
});
subscription.unsubscribe();
increments.unsubscribe();`,
        },
      },
    ],
  },
  {
    slug: "entity-adapter",
    title: "Entity adapter",
    group: "Core concepts",
    description:
      "Keep collections normalized as ordered IDs and an entity record, with helpers that work inside your slice handlers.",
    sections: [
      {
        id: "normalized-state",
        title: "Define IDs and ordering",
        paragraphs: [
          "createEntityAdapter<T> requires both selectId(entity): string and sortComparer(a, b): number. getInitialState() creates { ids: [], entities: {} }; an optional object adds extra fields. Get fresh adapter state for every store. IDs must be unique strings, including input passed to setAll.",
        ],
        code: {
          label: "tasks.ts",
          value: `import { configureStore, createEntityAdapter, createEvent, createSlice } from "@carere/solux";

type Task = { id: string; title: string };
const tasks = createEntityAdapter<Task>({
  selectId: (task) => task.id,
  sortComparer: (a, b) => a.title.localeCompare(b.title),
});
const taskAdded = createEvent<Task>("tasks/added");
const slice = createSlice({
  initialState: tasks.getInitialState({ loading: false }),
  handlers: (builder) => builder.addHandler(taskAdded, (state, { payload }) => {
    tasks.addOne(state, payload);
  }),
});
const store = configureStore({ rootSlice: slice });
store.dispatch(taskAdded({ id: "docs", title: "Read Solux docs" }));
const selectors = tasks.getSelectors();
console.log(selectors.selectAll(store.state));`,
        },
      },
      {
        id: "collection-operations",
        title: "Choose the right operation",
        table: {
          headings: ["Operation", "Behavior"],
          rows: [
            [
              "addOne / addMany",
              "Insert new IDs. Existing entities are retained, not merged or replaced.",
            ],
            ["setOne / setMany", "Insert or replace whole entities by ID. Other entities remain."],
            [
              "setAll",
              "Replace the entire collection. Pass unique IDs; the input array is sorted in place.",
            ],
            [
              "removeOne / removeMany",
              "Remove the supplied string ID or IDs from both collections.",
            ],
            ["removeAll", "Clear IDs and entities; preserve extra state fields."],
          ],
        },
        paragraphs: [
          "Add and set helpers recompute the ID ordering with sortComparer. There are no updateOne or upsertOne methods; use setOne with a complete entity to replace one. These helpers mutate the state they receive, so use them in handlers or on state you own.",
        ],
      },
      {
        id: "selectors",
        title: "Select inside a reactive scope",
        paragraphs: [
          "getSelectors() supplies selectIds, selectEntities, selectAll, selectTotal, and selectById. selectById returns undefined for a missing ID. Pass a selectState function to getSelectors to target a collection nested in a root state. Selectors are ordinary functions, not memoized computations: call them inside JSX or wrap the result in createMemo when useful.",
        ],
        code: {
          label: "Nested collection · continuing tasks.ts",
          value: `import { combineSlices } from "@carere/solux";
import { createMemo } from "solid-js";

const nestedStore = configureStore({
  rootSlice: combineSlices({
    tasks: createSlice({
      initialState: tasks.getInitialState(),
      handlers: (builder) => builder.addHandler(taskAdded, (state, { payload }) => {
        tasks.addOne(state, payload);
      }),
    }),
  }),
});
type RootState = typeof nestedStore.state;
const rootSelectors = tasks.getSelectors<RootState, RootState["tasks"]>(
  (state) => state.tasks,
);
const all = createMemo(() => rootSelectors.selectAll(nestedStore.state));`,
        },
      },
    ],
  },
  {
    slug: "middleware-and-epics",
    title: "Middleware & epics",
    group: "In practice",
    description:
      "Wrap dispatch with middleware, or turn an RxJS event stream into new events. Keep cancellation and external effects under explicit ownership.",
    sections: [
      {
        id: "middleware",
        title: "Wrap dispatch deliberately",
        paragraphs: [
          "applyMiddlewares(middlewares) is an enhancer. A Middleware<S> receives { state, dispatch }, then next, then an event. Call next(event) to continue. In the current implementation, middlewareApi.dispatch is the dispatch passed into this enhancer, rather than a reference to the final wrapped dispatch.",
          "The array is reduced left to right: for [a, b], b wraps a, so b runs first on the way in. Enhancers themselves are applied in array order. Do not assume Redux’s middleware composition or recursive dispatch semantics.",
        ],
        code: {
          label: "A logging middleware",
          value: `import { applyMiddlewares, configureStore, type Middleware } from "@carere/solux";

type State = { value: number };
const logger: Middleware<State> = (api) => (next) => (event) => {
  console.log("before", event.type, api.state.value);
  next(event);
  console.log("after", api.state.value);
};
// rootSlice is a Slice<State> created for this store.
const store = configureStore({
  rootSlice,
  enhancers: [applyMiddlewares([logger])],
});`,
        },
      },
      {
        id: "epics",
        title: "Transform event streams with RxJS",
        paragraphs: [
          "An Epic<State, Container> receives an event Observable, readonly-typed live state, and an optional container. It returns an Observable of events. combineEpics(...epics) merges their output streams. epicMiddleware({ rootEpic, container? }) connects a root epic to dispatch; the input event reaches next before the epic sees it.",
          "Epic outputs use that epic middleware’s dispatch function. They are passed downstream and fed back into its event stream, so filter inputs carefully to avoid a feedback loop. Readonly typing is not a runtime freeze or a detached state snapshot.",
        ],
        code: {
          label: "A small event transformation",
          value: `import { applyMiddlewares, combineEpics, configureStore,
  createEvent, epicMiddleware, type Epic } from "@carere/solux";
import { filter, map } from "rxjs";

const requested = createEvent<number>("counter/requested");
const applied = createEvent<number>("counter/applied");
type State = { value: number };
const applyRequest: Epic<State> = (event$) => event$.pipe(
  filter((event): event is ReturnType<typeof requested> =>
    event.type === requested.type),
  map((event) => applied(event.payload)),
);
// rootSlice handles applied; create it fresh for this store.
const store = configureStore({
  rootSlice,
  enhancers: [applyMiddlewares([
    epicMiddleware({ rootEpic: combineEpics(applyRequest) }),
  ])],
});`,
        },
      },
      {
        id: "cancellation",
        title: "Own the lifetime of async work",
        note: "Store disposal does not unsubscribe epicMiddleware’s root subscription, complete its event Subject, cancel timers, or abort network work. Middleware wrappers may still run around a disposed core dispatch.",
        paragraphs: [
          "Manage cancellation explicitly with caller-owned abort controllers, RxJS takeUntil signals, and timer cleanup. Apply takeUntil at the root output stream to end the observable work you own, and signal it during scope cleanup. The current epic middleware does not expose a separate teardown API.",
          "Handle errors inside your epic pipelines so an unhandled error does not terminate the intended flow. A time-travel state restoration does not undo network requests, rerun epics deterministically, or restore external resources.",
        ],
        links: [
          { label: "Store ownership and disposal", href: "/docs/store-lifecycle" },
          { label: "DevTools semantics", href: "/docs/devtools" },
        ],
      },
    ],
  },
  {
    slug: "store-lifecycle",
    title: "Store scopes & disposal",
    group: "In practice",
    description:
      "Make ownership visible: fresh state for each independent scope, and one explicit cleanup path when that scope ends.",
    sections: [
      {
        id: "fresh-state",
        title: "A factory is the isolation boundary",
        paragraphs: [
          "For independent chart panels, editors, or SSR requests, create slices inside the store factory and allocate every nested initial-state object there. Reusing one slice can reuse its initial-state objects. A detached DevTools snapshot does not isolate live state.",
          "preloadedState replaces the root initial state; it is not merged with it. Supply a complete state shape and allocate or copy it per scope, including nested arrays and objects. Avoid module-level singleton stores in SSR handlers.",
        ],
        code: { label: "chart.ts · the running example", value: chartSource },
        demo: "scopes",
      },
      {
        id: "dispose",
        title: "Dispose what you create",
        note: "Unreleased: explicit idempotent store.dispose(), closed core subscriptions after disposal, and per-connection DevTools cleanup are repository changes beyond published 4.0.1.",
        paragraphs: [
          "dispose() closes store subscriptions and registered enhancer resources once. Later core dispatches do nothing; new core subscriptions are closed without replaying the last event. The final state remains readable. You can unsubscribe an individual listener without disposing the store.",
          "The public store exposes state, dispatch, subscribe, subscribeToEvent, and dispose. onDispose, initialState, and setState are enhancer-only capabilities and are stripped from the returned public store. Custom enhancers should preserve lifecycle methods when returning a store.",
          "The provider and Solid owner do not own store cleanup automatically. Register store.dispose in onCleanup yourself when the component owns the store. Recreating a scope means creating a new store, not reviving a disposed one.",
        ],
        code: {
          label: "Component-owned chart scope",
          language: "tsx",
          value: `import { onCleanup } from "solid-js";
import { createChartStore, appendPoint } from "./chart";

function ChartPanel() {
  const store = createChartStore();
  const subscription = store.subscribe(({ event }) => console.log(event));
  // Keep a real chart handle outside serializable state.
  onCleanup(() => {
    subscription.unsubscribe();
    store.dispose();
    // Dispose the chart instance / abort caller-owned work here too.
  });
  return <button onClick={() => store.dispatch(appendPoint(42))}>
    Points: {store.state.series.points.length}
  </button>;
}`,
        },
      },
      {
        id: "ssr",
        title: "Give each request its own store",
        paragraphs: [
          "Use a request-scoped factory and a finally block around the render operation. For streaming SSR, keep the store alive until the stream is finished or aborted rather than disposing as soon as you create the stream. If you hydrate preloaded state in the browser, transfer only serializable data and escape it safely using your framework’s serialization facilities.",
        ],
        code: {
          label: "Non-streaming request ownership · pseudocode integration",
          value: `async function handleRequest() {
  const store = createChartStore();
  try {
    return await renderRequestWithStore(store);
  } finally {
    store.dispose(); // Unreleased API; no automatic epic cancellation.
  }
}`,
        },
        links: [
          { label: "Async cancellation limits", href: "/docs/middleware-and-epics#cancellation" },
        ],
      },
    ],
  },
  {
    slug: "devtools",
    title: "DevTools & time travel",
    group: "In practice",
    description:
      "Inspect events and restore state with the Redux DevTools extension. Treat time travel as state inspection with explicit limits.",
    sections: [
      {
        id: "connect",
        title: "Opt in, per store",
        paragraphs: [
          "Add devtools(options) to the enhancer list. instanceId is required by Solux’s DevToolsOptions; choose a distinct ID for each live store and use name for a readable connection label. The current implementation is safe when window or the browser extension is absent, including SSR.",
        ],
        code: {
          label: "Development connection",
          value: `import { configureStore, devtools } from "@carere/solux";

// rootSlice is fresh for this scope. Use a distinct instanceId per live store.
const store = configureStore({
  rootSlice,
  enhancers: [devtools({ instanceId: "chart-A", name: "Chart A" })],
});
// When the owning scope ends (unreleased):
store.dispose();`,
        },
      },
      {
        id: "commands",
        title: "What the commands actually do",
        table: {
          headings: ["Command", "Current repository behavior"],
          rows: [
            ["ACTION", "Parse the JSON payload and dispatch it as an event."],
            [
              "JUMP_TO_STATE / JUMP_TO_ACTION",
              "Apply the supplied serialized state through Solid’s setState; handlers and epics are not replayed.",
            ],
            ["ROLLBACK", "Apply the serialized state supplied by the extension."],
            [
              "RESET",
              "Apply a fresh copy of the construction-time initial/preloaded baseline, then initialize the extension with current state.",
            ],
            [
              "COMMIT",
              "Initialize the extension with the current state. Does not change the construction RESET baseline.",
            ],
            [
              "IMPORT_STATE",
              "Use the last computed state and send a detached lifted-state copy to the extension. Empty computedStates is ignored.",
            ],
            ["TOGGLE_ACTION / LOCK_CHANGES", "Not implemented."],
          ],
        },
        paragraphs: [
          "State restoration uses Solid setState’s object update semantics; it is not a fresh store construction or a guaranteed whole-tree replacement. Keep a stable serializable state shape. DevTools messages are trusted input: this integration is not a runtime validation boundary.",
        ],
      },
      {
        id: "unreleased-guarantees",
        title: "New guarantees beyond 4.0.1",
        bullets: [
          "SSR and extension-absent safety: the enhancer can return the store without connecting.",
          "Detached initial, event, and imported snapshots: later live mutations do not rewrite earlier snapshots sent to DevTools.",
          "A detached construction baseline for RESET, including preloadedState; COMMIT does not replace that baseline.",
          "Idempotent store disposal and per-connection cleanup; disposing chart A does not call the extension’s global disconnect or disconnect chart B.",
          "Callbacks delivered after disposal are ignored, including late messages during connection setup.",
        ],
        note: "These are unreleased repository guarantees. The package version field is still 4.0.1; it is not evidence that the registry release contains these fixes.",
      },
      {
        id: "effect-limits",
        title: "State travel is not effect replay",
        paragraphs: [
          "Restoring state does not replay the original events through handlers, deterministically rerun side effects, cancel epics, undo requests, or recreate chart handles. ACTION dispatch can run normal effects; JUMP state restoration follows a different path.",
          "Keep DOM nodes, chart instances, functions, subscriptions, and cleanup resources outside serializable state. Create fresh live state for independent stores; DevTools cloning alone does not provide store isolation.",
        ],
        links: [
          { label: "Independent store factories", href: "/docs/store-lifecycle" },
          { label: "Migration notes", href: "/docs/migration" },
        ],
      },
    ],
  },
  {
    slug: "api-reference",
    title: "API reference",
    group: "Resources",
    description:
      "The public exports of @carere/solux, grouped by the job they do. Import from the package entry point.",
    sections: [
      {
        id: "state-api",
        title: "Events, handlers, slices, and stores",
        table: {
          headings: ["Export", "Contract"],
          rows: [
            [
              "createEvent<P>(name, prepare?)",
              "Create typed events. The optional single-argument prepare callback returns { payload }. Creator.type and .match inspect event types.",
            ],
            [
              "createHandler<S>(builderCallback)",
              "Build a synchronous Handler<S> with addHandler(eventCreator, handler).",
            ],
            [
              "createSlice({ initialState, handlers })",
              "Return { getInitialState, handler }. Initial state is retained, not freshly allocated by getInitialState.",
            ],
            [
              "combineSlices(map)",
              "Compose keyed slices into a root slice; state keys and types follow the map.",
            ],
            [
              "configureStore({ rootSlice, preloadedState?, enhancers? })",
              "Create a reactive store. rootSlice is required at runtime. preloadedState supplies the complete starting state.",
            ],
            [
              "store.state / store.dispatch(event)",
              "Read reactive state; synchronously handle an event, then notify subscribers.",
            ],
            [
              "store.subscribe(listener)",
              "Observe { state, event }; live subscriptions replay the latest event if any. Returns an RxJS Subscription.",
            ],
            [
              "store.subscribeToEvent(creator, listener)",
              "Type-filter the same event stream. Returns an RxJS Subscription.",
            ],
            [
              "store.dispose() · unreleased",
              "Idempotently close the core event stream and registered enhancer cleanup. No automatic effect cancellation.",
            ],
          ],
        },
      },
      {
        id: "composition-api",
        title: "Context, enhancers, and epics",
        table: {
          headings: ["Export", "Contract"],
          rows: [
            [
              "SoluxProvider",
              "Pass store through Solid context; does not assume disposal ownership.",
            ],
            [
              "useSolux<S>()",
              "Return Store<S> | undefined from context. Provider is optional for direct store access.",
            ],
            [
              "devtools<S>(options)",
              "Opt-in Redux DevTools enhancer. options requires instanceId. See command semantics and release caveats.",
            ],
            [
              "applyMiddlewares<S>(middlewares)",
              "Wrap dispatch in a left-to-right reduction (last middleware is outermost).",
            ],
            [
              "epicMiddleware<S, C>({ rootEpic, container? })",
              "Connect an RxJS epic to dispatch. No automatic teardown on store disposal.",
            ],
            [
              "combineEpics<S, C>(...epics)",
              "Merge outputs of epics receiving the same event stream, state, and container.",
            ],
            [
              "nanoid(size = 21)",
              "Generate a non-cryptographic random ID. Not suitable for secrets or security tokens.",
            ],
          ],
        },
      },
      {
        id: "entity-api",
        title: "Entity helpers",
        paragraphs: [
          "createEntityAdapter<T>({ selectId, sortComparer }) returns addOne, addMany, setOne, setMany, setAll, removeOne, removeMany, removeAll, getInitialState, and getSelectors. EntityState<T> has ids: string[] and entities: Record<string, T>. Selectors are selectIds, selectEntities, selectAll, selectTotal, and selectById.",
        ],
        links: [{ label: "Entity adapter details and example", href: "/docs/entity-adapter" }],
      },
      {
        id: "public-types",
        title: "Public types",
        paragraphs: [
          "Events and handlers: Event, EventWithPayload, Handler, Dispatch, BasicEventCreator, EventCreatorWithPayload, EventCreatorWithoutPayload, EventCreatorWithPreparedPayload, PayloadEventCreator, PrepareCallback, and AnyEventCreator.",
          "State and composition: Store, StoreOption, Slice, SliceOption, SlicesMapObject, StateFromSlicesMapObject, EventHandlerMapBuilder, Middleware, MiddlewareApi, Enhancer, EnhancedStore, Epic, and DevToolsOptions.",
          "Entities: EntityState, EntityAdapterOptions, EntityStateAdapter, and EntitySelectors. IfUndefined and IfPrepareActionMethodNotProvided are exported inference helpers marked internal; application code should generally let factory calls infer those details.",
          "EnhancedStore adds initialState, setState, and onDispose for enhancer implementation. These capabilities are not present on the returned public store. Preserve the remaining store methods when implementing custom enhancers.",
        ],
        links: [
          {
            label: "Inspect the public entry point",
            href: "https://github.com/carere/solux/blob/main/packages/solux/src/index.ts",
          },
          {
            label: "Inspect the type definitions",
            href: "https://github.com/carere/solux/blob/main/packages/solux/src/types.ts",
          },
        ],
      },
    ],
  },
  {
    slug: "migration",
    title: "Migration & release status",
    group: "Resources",
    description:
      "Separate the published 4.0.1 API from the workspace changes that have not yet been released.",
    sections: [
      {
        id: "release-status",
        title: "Current source is ahead of the release",
        note: "The registry release is 4.0.1. Disposal and the DevTools readiness guarantees described here are unreleased. The workspace still carries a 4.0.1 version field during development; do not treat that as a new release.",
        paragraphs: [
          "Existing event, slice, entity, context, middleware, and epic patterns continue to use the public @carere/solux import. The repository is moving the library to packages/solux and documentation to apps/website. That layout change does not rename the package or require private-path imports.",
        ],
      },
      {
        id: "adoption-checklist",
        title: "Adopt the new lifecycle deliberately",
        bullets: [
          "When using a release that includes disposal, add an explicit store.dispose() at the owning scope boundary. Do not assume provider unmount does it.",
          "Move slice construction and all nested initial/preloaded state allocation into a factory for independent stores or SSR requests.",
          "Give each DevTools connection a distinct instanceId. Keep chart handles and cleanup resources outside state.",
          "Keep unsubscribing individual subscriptions and cancelling async work you own. Disposal does not cancel epics or middleware effects.",
          "If you write a custom enhancer, preserve dispose and register cleanup through the enhancer-only onDispose hook. Do not expose enhancer internals as application APIs.",
          "Verify RESET, COMMIT, and time-travel behavior against your application. State restoration does not provide deterministic effects replay.",
        ],
        links: [
          { label: "Try the independent chart scopes", href: "/docs/store-lifecycle#fresh-state" },
          { label: "Review DevTools behavior", href: "/docs/devtools" },
        ],
      },
      {
        id: "follow-releases",
        title: "Check the published artifact",
        paragraphs: [
          "Use the GitHub releases and package registry to confirm which version contains a change before relying on it. Source documentation and live workspace examples describe this checkout, not a promise about an already published tarball.",
        ],
        links: [
          { label: "GitHub releases", href: "https://github.com/carere/solux/releases" },
          { label: "Package on npm", href: "https://www.npmjs.com/package/@carere/solux" },
        ],
      },
    ],
  },
  {
    slug: "contributing",
    title: "Contributing",
    group: "Resources",
    description:
      "Help improve the library, the examples, and the documentation. Start with a concrete behavior and the public API boundary.",
    sections: [
      {
        id: "workspace",
        title: "Work in the Bun + Moon workspace",
        paragraphs: [
          "packages/solux owns the public library and its package tests; apps/website owns this Solid documentation site. Shared tooling lives at the root. Read AGENTS.md, CODING_STANDARD.md, and the workspace guide before choosing commands. Use the checked-in manifests and Moon configuration as the authority.",
          "The website’s build and dev tasks depend on the library build. The browser suite uses the production Vite preview. Website deployment is a separate, manually invoked task; building or testing never publishes the site.",
        ],
        code: {
          label: "From the repository root · after dependency setup",
          language: "bash",
          value:
            "bun moon run solux:build\nbun moon run website:dev\nbun moon run website:typecheck\nbun moon run website:build\nbun moon run website:test-browser",
        },
        links: [
          { label: "Repository", href: "https://github.com/carere/solux" },
          {
            label: "Coding standard",
            href: "https://github.com/carere/solux/blob/main/CODING_STANDARD.md",
          },
          {
            label: "Workspace guide",
            href: "https://github.com/carere/solux/blob/main/docs/agents/workspace.md",
          },
        ],
      },
      {
        id: "reporting",
        title: "Make a behavior reproducible",
        paragraphs: [
          "For a bug report, include the package version, a small reproduction, the expected transition, and what actually happened. For lifecycle or DevTools bugs, include how the store was created and cleaned up, whether multiple stores were open, and whether the extension was installed.",
          "Keep public imports, type inference, and packed declarations usable. Add focused library tests for behavior changes and browser coverage for documentation examples. The repository is MIT licensed.",
        ],
        links: [
          { label: "Issues and feature requests", href: "https://github.com/carere/solux/issues" },
          { label: "License", href: "https://github.com/carere/solux/blob/main/LICENSE" },
        ],
      },
    ],
  },
];

export function searchableText(page: DocPage): string {
  return [
    page.title,
    page.description,
    ...page.sections.flatMap((section) => [
      section.title,
      ...(section.paragraphs ?? []),
      ...(section.bullets ?? []),
      section.note ?? "",
      section.code?.value ?? "",
      ...(section.table?.rows.flat() ?? []),
    ]),
  ]
    .join(" ")
    .toLowerCase();
}
