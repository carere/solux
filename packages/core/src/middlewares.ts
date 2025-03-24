import { Subject } from "rxjs";
import type { Dispatch, Epic, Event, Middleware } from "./types";

export const epicMiddleware =
  <S, C>(options: { container?: C; rootEpic: Epic<S, C> }): Middleware<S> =>
  (api) => {
    const event$ = new Subject<Event>();
    let initialized = false;

    return (next) => {
      const dispatch: Dispatch = (event) => {
        next(event);
        event$.next(event);
      };

      if (!initialized) {
        options.rootEpic(event$, api.state, options.container).subscribe(dispatch);
        initialized = true;
      } else throw Error("You may not call `createObservableMiddleware` twice");

      return dispatch;
    };
  };
