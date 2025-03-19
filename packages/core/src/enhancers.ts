import type { EnhancerOptions } from "@redux-devtools/extension";
import type { Enhancer, Middleware } from "./types";

//TODO: Handle bad typings from Redux Devtools
export const devtools =
  <S>(options: EnhancerOptions): Enhancer<S> =>
  (store) => {
    const devTools = window?.__REDUX_DEVTOOLS_EXTENSION__?.connect(options) ?? undefined;
    devTools?.init(store.state);
    // (devTools as DevTools)?.subscribe((message) => {
    //   if (message.type === "DISPATCH" && message.state) store.dispatch(message.state);
    // });
    store.subscribe(({ state, event }) => devTools?.send(event, state));
    return store;
  };

export const applyMiddlewares =
  <S>(middlewares: Middleware<S>[]): Enhancer<S> =>
  (store) => {
    const middlewareApi = { state: store.state, dispatch: store.dispatch };

    return {
      ...store,
      dispatch: middlewares
        .map((m) => m(middlewareApi))
        .reduce((acc, middleware) => middleware(acc), store.dispatch),
    };
  };
