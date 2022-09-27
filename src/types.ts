import type { Observable, Subscription } from 'rxjs'

/**
 * An *event* is a plain object that represents something that happen.
 * Events are the only way to update / insert data into the store. Any data,
 * whether from UI events, network callbacks, or other sources such as
 * WebSockets needs to eventually be dispatched as events.
 *
 * Events must have a `type` field that indicates the type of event being
 * performed. The `type` field needs to be a `string`
 *
 * If you need some data to represent what happen, you are free to populate
 * the payload / meta property of an event.
 *
 * @template P the type of the event's `payload` property.
 * @template M the type of the event's `meta` property.
 */
export type Event<P = unknown, M = unknown> = { type: string; payload?: P; meta?: M }

/**
 * A *handler* is a function that accepts a state and an event.
 *
 * You may have encounter eventHandler in Javascript or other language before.
 * There is no difference in `Solux`, except that you get a state as first argument,
 * and the event as the second one.
 *
 * You may update the state if the event need to be handle.
 *
 * *Do not put asynchronous (Promise, Ajax, Timeout, ...) tasks into handlers.
 *  Epics are meant for this purpose, and are way more powerful to handle those use cases.*
 *
 * @template S The type of state consumed by this handler.
 * @template P The type of events the handler can potentially handle.
 */
export type Handler<S, P = unknown> = (state: S, event: Event<P>) => void

/**
 * Options for `configureStore()`.
 *
 * @template S The type of state held by this store.
 */
export type StoreOption<S, C = unknown> = {
  rootSlice: Slice<S>
  rootEpic: Epic<S, C>
  container: C
  preloadedState: S
}

/**
 * A store is an object that holds the application's state tree.
 * It's a good practice to keep a single store for all your application.
 * The composition is possible thanks to the slice and the `combineSlices()` utilities
 *
 * @template S The type of state held by this store.
 */
export type Store<S> = {
  /**
   * Dispatches an event. It is the only way to trigger a state change.
   *
   * The `rootHandler` function, will be called with the current state tree
   * and the given `event`. All listeners will be notified with an object
   * containing the state and the type of the event.
   *
   * @param event A plain object representing “what changed”.
   */
  dispatch: (event: Event) => void
  /**
   * Reads the state tree managed by the store.
   *
   * @returns The current state tree of your application.
   */
  getState: () => S
  /**
   * Adds a change listener. It will be called any time an event is dispatched,
   * and some part of the state tree may potentially have changed.
   *
   * @param listener A callback to be invoked on every dispatch, the state will
   * be available as first parameter.
   * @returns A function to remove this change listener.
   */
  subscribe: (listener: (value: { state: S; type: string }) => void) => Subscription
}

/**
 * The type of the method used to prepare the event with some arguments
 *
 * @param value The argument used to prepare the event
 *
 * @template P The type of the `payload` field of the created events
 * @template M The type of the `meta` field of the created events
 * @template V The type of the argument passed to the prepare callbacks
 */
export type PrepareCallback<P, M, V> = (value: V) => Partial<Omit<Event<P, M>, 'type'>>

/**
 * An event creator that produces events with a `payload` attribute.
 *
 * @template P the `payload` type
 * @template V the type of the parameter passed to the prepared callback
 */
export type EventCreator<P, M = undefined, V = undefined> = {
  (value?: V extends undefined ? P : V): Event<P, M>
  type: string
  match: (event: Event<P, M>) => boolean
}

/**
 * A builder for an event <-> handler map.
 *
 * @template S The type of state operated by the builder.
 */
export type EventHandlerMapBuilder<S> = {
  /**
   * Add an handler which handle the type created from the `eventCreator`.
   *
   * @template P Type of the payload of the event creator
   * @template S Type of the state handled by the handler
   * @param eventCreator The Event creator that this handler can handle
   * @param handler The handler
   * @returns The builder
   */
  addHandler: <P>(
    eventCreator: EventCreator<P>,
    handler: Handler<S, P>,
  ) => EventHandlerMapBuilder<S>
}

/**
 * Options passed to the function `createSlice()`.
 *
 * @template S The type of state operated by the slice.
 */
export type SliceOption<S> = {
  initialState: S
  handlers: (builder: EventHandlerMapBuilder<S>) => void
}

/**
 * An object representing a slice operating on a subset of a store state
 *
 * @template S The type of state operated by the slice.
 */
export type Slice<S> = {
  handler: Handler<S>
  getInitialState: () => S
}

/**
 * Object whose values correspond to different slice.
 *
 * @template S Object map built with property of passed Record Slice and respective state
 */
export type SlicesMapObject<S = unknown> = {
  [K in keyof S]: Slice<S[K]>
}

/**
 * Infer a combined state shape from a `SlicesMapObject`.
 *
 * @template M Object map of slices as provided to `combineSlices(map: M)`.
 */
export type StateFromSlicesMapObject<M> = M extends SlicesMapObject
  ? { [P in keyof M]: M[P] extends Slice<infer S> ? S : never }
  : never

/**
 * The state return by `adapter.getInitialState()`
 *
 * @template T The type of the entity use by the entity state.
 */
export type EntityState<T> = {
  ids: Array<string>
  entities: Record<string, T>
}

/**
 * Options passed to the function `createEntityAdapter()`
 *
 * @template T The type of the entity handle by the entity adapter.
 */
export type EntityAdapterOptions<T> = {
  selectId: (entity: T) => string
  sortComparer: (a: T, b: T) => number
}

/**
 * Object used with `updateOne()` and `updateMany()` functions from
 * the entity state adapter.
 *
 * @template T The type of the entity handle by the entity adapter.
 */
export type UpdateEntity<T> = { id: string; changes: Partial<T> }

/**
 * Object containing several selectors used to get some data from entity adapter
 *
 * @template T The type of the entity handle by the entity adapter.
 * @template V The type of the root state from which select the one use by the adapter.
 */
export interface EntitySelectors<T, V> {
  selectIds: (state: V) => string[]
  selectEntities: (state: V) => Record<string, T>
  selectAll: (state: V) => T[]
  selectTotal: (state: V) => number
  selectById: (state: V, id: string) => T | undefined
}

/**
 * The entity adapter containing all the nice helpers to work with an ORM-like
 * normalize state
 *
 * @template T The type of the entity handle by the entity adapter.
 */
export type EntityStateAdapter<T> = {
  addOne<S extends EntityState<T>>(state: S, entity: T): void
  addMany<S extends EntityState<T>>(state: S, entities: Array<T>): void
  setOne<S extends EntityState<T>>(state: S, entity: T): void
  setMany<S extends EntityState<T>>(state: S, entities: Array<T>): void
  setAll<S extends EntityState<T>>(state: S, entities: Array<T>): void
  removeOne<S extends EntityState<T>>(state: S, key: string): void
  removeMany<S extends EntityState<T>>(state: S, key: Array<string>): void
  removeAll<S extends EntityState<T>>(state: S): void
  updateOne<S extends EntityState<T>>(state: S, change: UpdateEntity<T>): void
  updateMany<S extends EntityState<T>>(state: S, changes: Array<UpdateEntity<T>>): void
  upsertOne<S extends EntityState<T>>(state: S, entity: T): void
  upsertMany<S extends EntityState<T>>(state: S, entities: Array<T>): void
  getInitialState(): EntityState<T>
  getInitialState<E extends object>(extra: E): EntityState<T> & E
  getSelectors(): EntitySelectors<T, EntityState<T>>
  getSelectors<V, E extends EntityState<T>>(selectState: (state: V) => E): EntitySelectors<T, V>
}

/**
 * An epic is the only way to make asynchronous tasks in Solux, it takes
 * a stream of events, the state and some dependencies as parameters and
 * return a stream of events.
 *
 * Several recipes are available on the docs to grasp all the power of Epics
 * and why we promote those instead of conventional Promise / async - await
 *
 * @template S The type of the state of the store.
 * @template D The type of the dependencies injected on the store
 */
export type Epic<S, C = unknown> = (
  event$: Observable<Event>,
  state: Readonly<S>,
  container: Readonly<C>,
) => Observable<Event>

export type DevTools<S = unknown> = {
  subscribe: (listener: (message: { type: string; state: S }) => void) => void
  unsubscribe: () => void
  send: (action: Event, state: S) => void
  init: (state: S) => void
  error: (message: string) => void
}
