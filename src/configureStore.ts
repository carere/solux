import { mergeMap, of, ReplaySubject, Subject } from 'rxjs'
import { createStore, produce } from 'solid-js/store'
import type { AnyEventCreator, DevTools, Event, Store, StoreOption } from './types'

/**
 * The function used to create a Solux store
 *
 * @param param0 the options used to configure the store
 * @returns A configured solux store
 */
export const configureStore = <S extends object, C>({
  rootSlice,
  preloadedState,
  rootEpic,
  container,
}: Partial<StoreOption<S, C>>): Store<S> => {
  if (preloadedState && rootSlice === undefined)
    throw Error(`
      You should not provide a preloaded state without providing a root slice !!

      If your goal is to use the state as a "container" for your root epic, you
      should use the container option instead, which is made for this.

      You may read the docs in order to understand how to use Solux and its architecture.
    `)

  if (container && rootEpic === undefined)
    throw Error(`
      You should not provide a container without providing a root epic !!

      The container is only used with root epic, so if you do not use epics,
      you should not provide one.

      You may read the docs in order to understand how to use Solux and its architecture.
    `)

  if (rootSlice === undefined && rootEpic === undefined)
    throw Error(`
      You configured the store with no root epic and no root slice !!

      Solux is a global state management system which can also be used as a
      state machine due to its powerful epic system.

      You may read the docs in order to understand how to use Solux and its architecture.
    `)

  const [state, setState] = createStore(
    preloadedState ?? (rootSlice ? rootSlice.getInitialState() : {}),
  )

  const store$ = new ReplaySubject<{ state: S; event: Event }>(1)
  const event$ = new Subject<Event>()
  const isDevtoolsAvailable =
    typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__ !== undefined
  let devTools: DevTools<S> = undefined

  if (isDevtoolsAvailable) {
    devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect()
    devTools.subscribe(({ type, state }) => {
      if (type === 'DISPATCH' && state) {
        console.log('DevTools requested to change the state to', state)
      }
    })
    devTools.init(state as S)
  }

  const dispatch: Store<S>['dispatch'] = event => {
    if (rootSlice !== undefined) setState(produce((state: S) => rootSlice.handler(state, event)))
    store$.next({ state: state as S, event })
    if (isDevtoolsAvailable) devTools.send(event, state as S)
    event$.next(event)
  }

  const subscribe: Store<S>['subscribe'] = listener => {
    return store$.subscribe({
      next: listener,
    })
  }

  const subscribeToEvent = <E extends Event>(
    eventCreator: AnyEventCreator<E>,
    listener: (value: { state: S; event: E }) => void,
  ) =>
    subscribe(({ state, event }) => {
      if (event.type === eventCreator.type) listener({ event, state } as { event: E; state: S })
    })

  if (rootEpic) {
    event$.pipe(mergeMap(event => rootEpic(of(event), state as S, container))).subscribe(dispatch)
  }

  return { dispatch, state: state as S, subscribe, subscribeToEvent }
}
