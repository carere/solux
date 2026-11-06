import type { EnhancerOptions } from "@redux-devtools/extension";
import { clone } from "remeda";
import { unwrap } from "solid-js/store";
import { match } from "ts-pattern";
import type { Enhancer, Event, Middleware } from "./types";

type NextLiftedState<S> = {
  computedStates: { state: S }[];
};

type DevToolsMessages<S> =
  | { type: "ACTION"; payload: string }
  | { type: "DISPATCH"; payload: { type: "COMMIT" } }
  | { type: "DISPATCH"; payload: { type: "ROLLBACK" }; state: string }
  | { type: "DISPATCH"; payload: { type: "JUMP_TO_ACTION" }; state: string }
  | { type: "DISPATCH"; payload: { type: "JUMP_TO_STATE" }; state: string }
  | { type: "DISPATCH"; payload: { type: "RESET" | "COMMIT" } }
  | { type: "DISPATCH"; payload: { type: "IMPORT_STATE"; nextLiftedState: NextLiftedState<S> } }
  | { type: "DISPATCH"; payload: { type: "TOGGLE_ACTION" }; state: string };

type DevTools<S> = {
  subscribe: (cb: (message: DevToolsMessages<S>) => void) => (() => void) | undefined;
  unsubscribe: () => void;
  init: (state: S) => void;
  send: (event: Event | null, state: S | NextLiftedState<S>) => void;
};

export type DevToolsOptions = EnhancerOptions & { instanceId: string };

//TODO: Try yo implement TOGGLE_ACTION, LOCK_CHANGES
export const devtools =
  <S>(options: DevToolsOptions): Enhancer<S> =>
  (store) => {
    if (typeof window === "undefined" || !window.__REDUX_DEVTOOLS_EXTENSION__) return store;

    let disposed = false;
    let devTools: DevTools<S> | undefined;
    let unsubscribeMessages: (() => void) | undefined;
    let storeSubscription: ReturnType<typeof store.subscribe> | undefined;

    store.onDispose(() => {
      disposed = true;
      storeSubscription?.unsubscribe();
      try {
        unsubscribeMessages?.();
      } finally {
        // Per-connection cleanup. The extension's global disconnect() would
        // disconnect unrelated chart/application stores too.
        devTools?.unsubscribe();
      }
    });
    if (disposed) return store;

    const connection = window.__REDUX_DEVTOOLS_EXTENSION__.connect(
      options,
    ) as unknown as DevTools<S>;
    devTools = connection;
    if (disposed) {
      connection.unsubscribe();
      return store;
    }

    const snapshot = () => clone(unwrap(store.state));
    const unsubscribe = connection.subscribe((message) => {
      if (disposed) return;
      match(message)
        .with({ type: "ACTION" }, ({ payload }) => store.dispatch(JSON.parse(payload)))
        .with({ type: "DISPATCH" }, (event) => {
          match(event)
            .with({ payload: { type: "COMMIT" } }, () => {
              connection.init(snapshot());
            })
            .with({ payload: { type: "RESET" } }, () => {
              store.setState(clone(store.initialState));
              if (!disposed) connection.init(snapshot());
            })
            .with({ payload: { type: "ROLLBACK" } }, ({ state }) => {
              store.setState(JSON.parse(state));
            })
            .with({ payload: { type: "JUMP_TO_ACTION" } }, ({ state }) =>
              store.setState(JSON.parse(state)),
            )
            .with({ payload: { type: "JUMP_TO_STATE" } }, ({ state }) =>
              store.setState(JSON.parse(state)),
            )
            .with({ payload: { type: "IMPORT_STATE" } }, ({ payload: { nextLiftedState } }) => {
              const lastComputedState = nextLiftedState.computedStates.at(-1);
              if (!lastComputedState) return;
              store.setState(clone(lastComputedState.state));
              if (!disposed) connection.send(null, clone(nextLiftedState));
            })
            .otherwise(() => {});
        })
        .otherwise(() => {});
    });
    unsubscribeMessages = unsubscribe;
    if (disposed) {
      unsubscribe?.();
      return store;
    }

    connection.init(snapshot());
    if (disposed) return store;
    storeSubscription = store.subscribe(({ state, event }) => {
      if (!disposed) connection.send(event, clone(unwrap(state)));
    });
    // subscribe() can synchronously replay an event and trigger disposal.
    if (disposed) storeSubscription.unsubscribe();

    return store;
  };

export const applyMiddlewares =
  <S>(mws: Middleware<S>[]): Enhancer<S> =>
  (store) => {
    const middlewareApi = { state: store.state, dispatch: store.dispatch };
    const dispatch = mws
      .map((m) => m(middlewareApi))
      .reduce((acc, middleware) => middleware(acc), store.dispatch);
    return { ...store, dispatch };
  };
