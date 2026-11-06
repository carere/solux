import { afterEach, describe, expect, it, mock } from "bun:test";
import { createComputed, createRoot } from "solid-js";
import { isServer } from "solid-js/web";
import {
  applyMiddlewares,
  combineSlices,
  configureStore,
  createEvent,
  createSlice,
  type DevToolsOptions,
  devtools,
  type EnhancedStore,
  type Enhancer,
  type Event,
} from "../../src";

type Message = Record<string, unknown>;
const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, "window");
afterEach(() => {
  if (windowDescriptor) Object.defineProperty(globalThis, "window", windowDescriptor);
  else Reflect.deleteProperty(globalThis, "window");
});

function installExtension() {
  const createConnection = (options: DevToolsOptions) => {
    const listeners = new Set<(message: Message) => void>();
    let retainedListener = (_message: Message) => {};
    const connection = {
      options,
      listeners,
      init: mock((_state: unknown) => {}),
      send: mock((_event: unknown, _state: unknown) => {}),
      removeListener: mock(() => listeners.delete(retainedListener)),
      unsubscribe: mock(() => listeners.clear()),
      subscribe(listener: (message: Message) => void) {
        retainedListener = listener;
        listeners.add(listener);
        return connection.removeListener;
      },
      emit(message: Message) {
        for (const listener of listeners) listener(message);
      },
      // Simulates an already queued callback even after it has been unregistered.
      late(message: Message) {
        retainedListener(message);
      },
    };
    return connection;
  };
  const connections: ReturnType<typeof createConnection>[] = [];
  const connect = (options: DevToolsOptions) => {
    const connection = createConnection(options);
    connections.push(connection);
    return connection;
  };
  const disconnect = mock(() => {});
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { __REDUX_DEVTOOLS_EXTENSION__: { connect, disconnect } },
  });
  return { connections, disconnect };
}

const update = createEvent<number>("chart/update");
const freshState = () => ({ nested: { value: 0 }, points: [{ id: "a", value: 0 }] });
type State = ReturnType<typeof freshState>;
const freshSlice = () =>
  createSlice({
    initialState: freshState(),
    handlers: (builder) =>
      builder.addHandler(update, (state, { payload }) => {
        state.nested.value = payload;
        const point = state.points[0];
        if (point) point.value = payload;
        state.points.push({ id: "extra", value: payload });
      }),
  });
const command = (type: string, extra: Message = {}): Message => ({
  type: "DISPATCH",
  payload: { type },
  ...extra,
});

describe("DevTools lifecycle (mock extension protocol)", () => {
  it("initializes and disposes without window or an installed extension", () => {
    for (const withWindow of [false, true]) {
      if (withWindow) {
        Object.defineProperty(globalThis, "window", { configurable: true, value: {} });
      } else Reflect.deleteProperty(globalThis, "window");
      const store = configureStore({
        rootSlice: freshSlice(),
        enhancers: [devtools({ instanceId: "ssr" })],
      });
      store.dispatch(update(3));
      expect(store.state.nested.value).toBe(3);
      store.dispose();
      store.dispose();
    }
  });

  it("releases store observers and per-connection listeners on repeated mount cycles", () => {
    const { connections, disconnect } = installExtension();
    for (let i = 0; i < 20; i++) {
      const store = configureStore({
        rootSlice: freshSlice(),
        enhancers: [devtools({ name: `Chart ${i}`, instanceId: `chart:${i}` })],
      });
      const connection = connections[i];
      if (!connection) throw Error("Missing connection");
      const listener = mock(() => {});
      const subscription = store.subscribe(listener);
      const eventSubscription = store.subscribeToEvent(update, listener);
      expect(connection.listeners.size).toBe(1);
      expect(connection.options.instanceId).toBe(`chart:${i}`);
      store.dispatch(update(1));
      expect(connection.send).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledTimes(2);
      store.dispose();
      store.dispose();
      expect(subscription.closed).toBe(true);
      expect(eventSubscription.closed).toBe(true);
      expect(connection.listeners.size).toBe(0);
      expect(connection.removeListener).toHaveBeenCalledTimes(1);
      expect(connection.unsubscribe).toHaveBeenCalledTimes(1);
      expect(store.subscribe(listener).closed).toBe(true);
      expect(store.subscribeToEvent(update, listener).closed).toBe(true);
      store.dispatch(update(99));
      for (const message of [
        { type: "ACTION", payload: JSON.stringify(update(99)) },
        command("RESET"),
        command("COMMIT"),
        command("JUMP_TO_STATE", { state: JSON.stringify(freshState()) }),
        command("ROLLBACK", { state: JSON.stringify(freshState()) }),
        {
          type: "DISPATCH",
          payload: {
            type: "IMPORT_STATE",
            nextLiftedState: { computedStates: [{ state: freshState() }] },
          },
        },
        { type: "ACTION", payload: "invalid JSON must not even be parsed after disposal" },
      ])
        connection.late(message);
      expect(store.state.nested.value).toBe(1);
      expect(listener).toHaveBeenCalledTimes(2);
      expect(connection.send).toHaveBeenCalledTimes(1);
      expect(connection.init).toHaveBeenCalledTimes(1);
    }
    expect(disconnect).not.toHaveBeenCalled();
  });

  it("disposes one enhanced chart without interrupting another", () => {
    const { connections } = installExtension();
    const createChart = (instanceId: string) =>
      configureStore({
        rootSlice: combineSlices({ interaction: freshSlice() }),
        enhancers: [
          applyMiddlewares([]),
          devtools({ name: instanceId, instanceId }),
          applyMiddlewares([]),
        ],
      });
    const a = createChart("a");
    const b = createChart("b");
    a.dispose();
    b.dispatch(update(7));
    expect(a.state.interaction.nested.value).toBe(0);
    expect(b.state.interaction.nested.value).toBe(7);
    expect(connections[0]?.unsubscribe).toHaveBeenCalledTimes(1);
    expect(connections[1]?.unsubscribe).not.toHaveBeenCalled();
    expect(connections[1]?.send).toHaveBeenCalledTimes(1);
    b.dispose();
  });

  it("ignores a retained store callback after disposal", () => {
    const { connections } = installExtension();
    let late = () => {};
    const retain: Enhancer<State> = (store) => ({
      ...store,
      subscribe<E extends Event>(listener: (value: { state: State; event: E }) => void) {
        return store.subscribe<E>((value) => {
          late = () => listener(value);
          listener(value);
        });
      },
    });
    const store = configureStore({
      rootSlice: freshSlice(),
      enhancers: [retain, devtools({ instanceId: "late" })],
    });
    store.dispatch(update(8));
    store.dispose();
    late();
    expect(connections[0]?.send).toHaveBeenCalledTimes(1);
  });

  it("cleans up when synchronous subscription replay disposes the store", () => {
    const { connections } = installExtension();
    const disposeOnReplay: Enhancer<State> = (store) => {
      store.dispatch(update(2));
      return {
        ...store,
        subscribe<E extends Event>(listener: (value: { state: State; event: E }) => void) {
          return store.subscribe<E>((value) => {
            store.dispose();
            listener(value);
          });
        },
      };
    };
    const store = configureStore({
      rootSlice: freshSlice(),
      enhancers: [disposeOnReplay, devtools({ instanceId: "reentrant" })],
    });
    expect(connections[0]?.send).not.toHaveBeenCalled();
    expect(connections[0]?.unsubscribe).toHaveBeenCalledTimes(1);
    store.dispose();
  });
});

describe("store cleanup hooks", () => {
  it("runs registered cleanup once and immediately cleans up late registrations", () => {
    let enhanced: EnhancedStore<State> | undefined;
    const cleanup = mock(() => {});
    const store = configureStore({
      rootSlice: freshSlice(),
      enhancers: [
        (store) => {
          enhanced = store;
          store.onDispose(cleanup);
          return store;
        },
      ],
    });
    store.dispatch(update(4));
    const listener = mock(() => {});
    const subscription = store.subscribe(listener);
    expect(listener).toHaveBeenCalledTimes(1); // Live stores retain last-event replay.
    store.dispose();
    store.dispose();
    expect(subscription.closed).toBe(true);
    expect(cleanup).toHaveBeenCalledTimes(1);
    enhanced?.onDispose(cleanup);
    expect(cleanup).toHaveBeenCalledTimes(2);
    expect(Object.keys(store)).not.toContain("onDispose");
    expect(Object.keys(store)).not.toContain("initialState");
    expect(Object.keys(store)).not.toContain("setState");
  });

  it("does not connect when an earlier enhancer has disposed the store", () => {
    const { connections } = installExtension();
    const store = configureStore({
      rootSlice: freshSlice(),
      enhancers: [
        (store) => {
          store.dispose();
          return store;
        },
        devtools({ instanceId: "closed" }),
      ],
    });
    expect(connections).toHaveLength(0);
    store.dispatch(update(4));
    expect(store.state.nested.value).toBe(0);
  });
});

describe("detached DevTools snapshots", () => {
  it("initializes from current state after startup dispatches and retains the construction RESET baseline", () => {
    const { connections } = installExtension();
    const store = configureStore({
      rootSlice: freshSlice(),
      enhancers: [
        (store) => {
          store.dispatch(update(3));
          store.dispatch(update(4));
          return store;
        },
        devtools({ instanceId: "startup" }),
      ],
    });
    const connection = connections[0];
    if (!connection) throw Error("Missing connection");
    expect(connection.init.mock.calls[0]?.[0]).toEqual(store.state);
    expect(connection.send).toHaveBeenCalledTimes(1);
    expect(connection.send.mock.calls[0]?.[0]).toEqual(update(4));
    connection.emit(command("RESET"));
    expect(store.state).toEqual(freshState());
    expect(connection.init.mock.calls[0]?.[0]).not.toEqual(freshState());
    store.dispose();
  });
  it.each([false, true])(
    "keeps the nested construction baseline across repeated resets (preloaded=%s)",
    (preloaded) => {
      const { connections } = installExtension();
      let enhanced: EnhancedStore<State> | undefined;
      const store = configureStore({
        rootSlice: freshSlice(),
        preloadedState: preloaded ? freshState() : undefined,
        enhancers: [
          (store) => {
            enhanced = store;
            return store;
          },
          devtools({ instanceId: "reset" }),
        ],
      });
      const connection = connections[0];
      if (!connection || !enhanced) throw Error("Missing setup");
      expect(enhanced.initialState.nested).not.toBe(store.state.nested);
      expect(enhanced.initialState.points[0]).not.toBe(store.state.points[0]);
      for (const value of [1, 2, 3]) {
        store.dispatch(update(value));
        expect(enhanced.initialState).toEqual(freshState());
        connection.emit(command("RESET"));
        expect(store.state).toEqual(freshState());
      }
      expect(connection.init.mock.calls[0]?.[0]).toEqual(freshState());
      expect(connection.send.mock.calls[0]?.[1]).toEqual({
        nested: { value: 1 },
        points: [
          { id: "a", value: 1 },
          { id: "extra", value: 1 },
        ],
      });
      store.dispose();
    },
  );

  it("restores snapshots reactively without redispatching handlers; COMMIT keeps the construction RESET baseline", () => {
    const { connections } = installExtension();
    const store = configureStore({
      rootSlice: freshSlice(),
      enhancers: [devtools({ instanceId: "history" })],
    });
    const connection = connections[0];
    if (!connection) throw Error("Missing connection");
    const listener = mock(() => {});
    store.subscribe(listener);
    const values: number[] = [];
    const disposeRoot = createRoot((dispose) => {
      createComputed(() => values.push(store.state.nested.value));
      return dispose;
    });
    connection.emit({ type: "ACTION", payload: JSON.stringify(update(5)) });
    connection.emit(command("COMMIT"));
    expect(connection.init.mock.calls.at(-1)?.[0]).toEqual(store.state);
    for (const type of ["ROLLBACK", "JUMP_TO_ACTION", "JUMP_TO_STATE"]) {
      connection.emit(command(type, { state: JSON.stringify({ nested: { value: 8 } }) }));
      expect(store.state.nested.value).toBe(8);
      // Existing setState semantics: partial root snapshots merge supplied keys.
      expect(store.state.points).toHaveLength(2);
    }
    connection.emit(command("RESET"));
    expect(store.state).toEqual(freshState());
    expect(values).toEqual(isServer ? [0] : [0, 5, 8, 8, 8, 0]);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(connection.send).toHaveBeenCalledTimes(1);
    disposeRoot();
    store.dispose();
  });

  it("imports the last computed state without aliasing imported history and ignores empty history", () => {
    const { connections } = installExtension();
    const store = configureStore({
      rootSlice: freshSlice(),
      enhancers: [devtools({ instanceId: "import" })],
    });
    const connection = connections[0];
    if (!connection) throw Error("Missing connection");
    const lifted = {
      computedStates: [{ state: freshState() }, { state: { nested: { value: 6 }, points: [] } }],
      currentStateIndex: 0,
    };
    connection.emit({
      type: "DISPATCH",
      payload: { type: "IMPORT_STATE", nextLiftedState: lifted },
    });
    expect(store.state.nested.value).toBe(6);
    store.dispatch(update(9));
    expect(lifted.computedStates[1]?.state.nested.value).toBe(6);
    expect(connection.send.mock.calls[0]).toEqual([null, lifted]);
    connection.emit({
      type: "DISPATCH",
      payload: { type: "IMPORT_STATE", nextLiftedState: { computedStates: [] } },
    });
    expect(store.state.nested.value).toBe(9);
    store.dispose();
  });
});
