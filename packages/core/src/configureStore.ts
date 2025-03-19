import { ReplaySubject } from "rxjs";
import { createStore, produce } from "solid-js/store";
import type { AnyEventCreator, Event, Store, StoreOption } from "./types";

/**
 * The function used to create a Solux store
 *
 * @param param0 the options used to configure the store
 * @returns A configured solux store
 */
export const configureStore = <S extends object>(options: Partial<StoreOption<S>>): Store<S> => {
  const { rootSlice, preloadedState, enhancers } = options;

  if (rootSlice === undefined)
    throw Error(`
      You configured the store with no root slice !!
      You may read the docs in order to understand how to use Solux and its architecture.
    `);

  const [state, setState] = createStore(
    preloadedState ?? (rootSlice ? rootSlice.getInitialState() : {}),
  );

  const store$ = new ReplaySubject<{ state: S; event: Event }>(1);
  //const event$ = new Subject<Event>();

  const dispatch: Store<S>["dispatch"] = (event) => {
    if (rootSlice !== undefined) setState(produce((state: S) => rootSlice.handler(state, event)));
    store$.next({ state: state as S, event });
    //event$.next(event);
  };

  const subscribe = <E extends Event>(listener: (value: { state: S; event: E }) => void) => {
    return store$.subscribe({
      next: (value) => listener(value as { state: S; event: E }),
    });
  };

  const subscribeToEvent = <E extends Event>(
    eventCreator: AnyEventCreator<E>,
    listener: (value: { state: S; event: E }) => void,
  ) =>
    subscribe(({ state, event }) => {
      if (event.type === eventCreator.type) listener({ event, state } as { event: E; state: S });
    });

  //if (rootEpic) rootEpic(event$, state as S, container).subscribe(dispatch);

  const store = { dispatch, state: state as S, subscribe, subscribeToEvent };

  return enhancers ? enhancers.reduce((acc, enhancer) => enhancer(acc), store) : store;
};
