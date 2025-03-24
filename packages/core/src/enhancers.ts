import type { Config, EnhancerOptions } from "@redux-devtools/extension";
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
  connect: (options: Config) => DevTools<S>;
  subscribe: (cb: (message: DevToolsMessages<S>) => void) => void;
  init: (state: S) => void;
  send: (event: Event, state: S, options?: Config, instanceId?: string) => void;
};

//TODO: Try yo implement TOGGLE_ACTION, LOCK_CHANGES
export const devtools =
  <S>(options: EnhancerOptions & { instanceId: string }): Enhancer<S> =>
  (store) => {
    if (!window?.__REDUX_DEVTOOLS_EXTENSION__) return store;

    const devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect(options) as unknown as DevTools<S>;

    store.subscribe(({ state, event }) => devTools?.send(event, state, options));

    devTools?.subscribe((message) => {
      match(message)
        .with({ type: "ACTION" }, ({ payload }) => store.dispatch(JSON.parse(payload)))
        .with({ type: "DISPATCH" }, (event) => {
          match(event)
            .with({ payload: { type: "COMMIT" } }, () => {
              devTools.init(store.state);
            })
            .with({ payload: { type: "RESET" } }, () => {
              store.setState(store.initialState);
              devTools.init(store.initialState);
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
              const lastComputedState = nextLiftedState.computedStates.at(-1) as { state: S };
              store.setState(lastComputedState.state);
              devTools.send(null as unknown as Event, nextLiftedState as S, options);
            })
            .otherwise(() => {});
        })
        .otherwise(() => {});
    });

    devTools.init(store.initialState);

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
