import type { EnhancerOptions } from "@redux-devtools/extension";
import type { Enhancer } from "./types";

//TODO: Handle bad typings from Redux Devtools
export const devtools =
  <S>(options: EnhancerOptions): Enhancer<S> =>
  (store) => {
    const devTools = window?.__REDUX_DEVTOOLS_EXTENSION__?.connect(options) ?? undefined;
    devTools?.init(store.state);
    devTools?.subscribe((message) => {
      if (message.type === "DISPATCH" && message.state) store.dispatch(message.state);
    });
    store.subscribe(({ state, event }) => devTools?.send(event, state));
    return store;
  };

//TODO: Implement proper middlewares chain
// export const middlewares =
//   <S>(middlewares: Middleware<S>[]): Enhancer<S> =>
//   (store) => {
//     for (const middleware of middlewares) {
//       const handler = middleware(store);
//       store.subscribe(({ state, event }) => handler());
//     }
//     return store;
//   };
