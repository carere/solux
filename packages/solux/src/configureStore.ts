import { clone, omit } from "remeda";
import { ReplaySubject, Subscription } from "rxjs";
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
  const lifetime = new Subscription(() => store$.complete());

  const dispatch: Store<S>["dispatch"] = (event) => {
    if (lifetime.closed) return;
    if (rootSlice !== undefined) setState(produce((state: S) => rootSlice.handler(state, event)));
    store$.next({ state: state as S, event });
  };

  const subscribe = <E extends Event>(listener: (value: { state: S; event: E }) => void) => {
    // A completed ReplaySubject would still replay its last event to new subscribers.
    if (lifetime.closed) return Subscription.EMPTY;
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
    onDispose: (cleanup) => lifetime.add(cleanup),
    // Store methods
    dispatch,
    state,
    subscribe,
    subscribeToEvent,
    dispose: () => lifetime.unsubscribe(),
  };

  return omit(
    (enhancers ?? []).reduce((acc, enhancer) => enhancer(acc), enhancedStore),
    ["setState", "initialState", "onDispose"],
  );
};
