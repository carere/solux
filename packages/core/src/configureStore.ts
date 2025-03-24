import { clone, omit } from "radash";
import { ReplaySubject } from "rxjs";
import { createStore, produce } from "solid-js/store";
import type { AnyEventCreator, EnhancedStore, Event, Store, StoreOption } from "./types";

/**
 * The function used to create a Solux store
 *
 * @param options the options used to configure the store
 * @returns A configured solux store
 */
export const configureStore = <S extends object>(options: Partial<StoreOption<S>>): Store<S> => {
  const { rootSlice, preloadedState, enhancers } = options;

  if (rootSlice === undefined)
    throw Error(`
      You configured the store with no root slice !!
      You may read the docs in order to understand how to use Solux and its architecture.
    `);

  const initialState = preloadedState ?? rootSlice.getInitialState();

  const [state, setState] = createStore(initialState);

  const store$ = new ReplaySubject<{ state: S; event: Event }>(1);

  const dispatch: Store<S>["dispatch"] = (event) => {
    if (rootSlice !== undefined) setState(produce((state: S) => rootSlice.handler(state, event)));
    store$.next({ state: state as S, event });
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

  const enhancedStore: EnhancedStore<S> = {
    // Enhancers need the initial State & the setState function
    initialState: clone(initialState),
    setState,
    // Store methods
    dispatch,
    state,
    subscribe,
    subscribeToEvent,
  };

  return omit(
    (enhancers ?? []).reduce((acc, enhancer) => enhancer(acc), enhancedStore),
    ["setState", "initialState"],
  );
};
