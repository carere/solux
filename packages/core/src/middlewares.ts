import { Subject } from "rxjs";
import type { Dispatch, Epic, Event, Middleware } from "./types";

export const createObservableMiddleware =
  <S, C>(options: { container?: C; rootEpic: Epic<S, C> }): Middleware<S> =>
  (api) => {
    const event$ = new Subject<Event>();

    return (next) => {
      const dispatch: Dispatch = (event) => {
        next(event);
        event$.next(event);
      };

      options.rootEpic(event$, api.state, options.container).subscribe(dispatch);

      return dispatch;
    };
  };
