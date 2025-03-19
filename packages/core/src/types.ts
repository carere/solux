import type { Subscription } from "rxjs";

/**
 * An *event* is a plain object that represents something that happen.
 * Events are the only way to update / insert data into the store. Any data,
 * whether from UI events, network callbacks, or other sources such as
 * WebSockets needs to eventually be dispatched as events.
 *
 * Events must have a `type` field that indicates the type of event being
 * performed. The `type` field needs to be a `string`
 */
export type Event = { type: string };

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
 */

export type EventWithPayload<P = undefined> = Event & { payload: P };

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
 * @template E The the type of event consumed by this handler.
 */
export type Handler<S, E extends Event = Event> = (state: S, event: E) => void;

/**
 * An Enhancer is a function that takes a store and returns a new store.
 *
 * It is used to add additional functionality to the store. For example, you
 * can add devtools to the store by enhancing dispatch function and subscribing
 * to the store events.
 *
 * @template S The type of state held by this store.
 */
export type Enhancer<S> = (store: Store<S>) => Store<S>;

/**
 * A Middleware is a higher-order function that takes a store and returns a
 * function that takes a handler and returns a new handler.
 *
 * It is used mainly add additional functionality to the dispatch function.
 * For example, you can add logging capability, or handle side-effects with
 * middlewares.
 *
 * @template S The type of state held by this store.
 */
export type Middleware<S> = (store: Store<S>) => (next: Handler<S>) => Handler<S>;

/**
 * Options for `configureStore()`.
 *
 * @template S The type of state held by this store.
 */
export type StoreOption<S> = {
  rootSlice: Slice<S>;
  preloadedState?: S;
  enhancers?: Enhancer<S>[];
};

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
   * @template E the type of event dispatched
   */
  dispatch: <E extends Event = Event>(event: E) => void;
  /**
   * The state tree managed by the store.
   *
   * @template S The type of the store's state
   */
  state: S;
  /**
   * Adds a change listener. It will be called any time an event is dispatched,
   * and some part of the state tree may potentially have changed.
   *
   * @template S The type of the store's state
   * @param listener A callback to be invoked on every dispatch, the state and
   * the event will be available as first argument.
   * @returns A function to remove this change listener.
   */
  subscribe: <E extends Event>(listener: (value: { state: S; event: E }) => void) => Subscription;
  /**
   * Adds a change listener on a specific event. It will be called any time
   * the specified event is dispatched.
   * Some part of the state tree may potentially have changed.
   *
   * @template S The type of the store's state
   * @template E The event dispatched
   * @param listener A callback to be invoked on every dispatch, the state and
   * the event will be available as second argument.
   * @returns A function to remove this change listener.
   */
  subscribeToEvent: <E extends Event>(
    eventCreator: AnyEventCreator<E>,
    listener: (value: { state: S; event: E }) => void,
  ) => Subscription;
};

/**
 * The type of the method used to prepare the event with some arguments
 *
 * @param value The argument used to prepare the event
 *
 * @template P The type of the `payload` field of the created events
 * @template V The type of the argument passed to the prepare callback
 */
export type PrepareCallback<V = undefined, P = undefined> = (value: V) => { payload: P };

/**
 * Base type for all event creators.
 *
 * @template E The type of the event generated by this event creator.
 */
export type BasicEventCreator<E extends Event = Event> = {
  type: string;
  match: (event: E) => boolean;
};

/**
 * An Event Creator with a callback to prepare the `payload` attribute of
 * the event.
 *
 * @template P The type of the `payload` field of the created event
 * @template V The type of the argument passed to the prepare callback
 */
export type EventCreatorWithPreparedPayload<V, P> = ((value: V) => EventWithPayload<P>) &
  BasicEventCreator<EventWithPayload<P>>;

/**
 * An Event Creator generating a simple `Event` object (without `payload`).
 */
export type EventCreatorWithoutPayload = (() => Event) & BasicEventCreator<Event>;

/**
 * An Event Creator generating an `EventWithPayload`
 *
 * @template P The type of the `payload` field of the created event
 */
export type EventCreatorWithPayload<P> = ((payload: P) => EventWithPayload<P>) &
  BasicEventCreator<EventWithPayload<P>>;

/**
 * A type used by `createEvent` to set the right kind of EventCreator.
 * You should not use this type directly.
 *
 * @template P The type of the `payload` field of the created event
 * @template V The type of the argument passed to the prepare callback
 * @template PA The signature of the PrepareCallback if defined
 *
 * @internal
 */
export type PayloadEventCreator<
  P = undefined,
  PA extends PrepareCallback<V, P> | undefined = undefined,
  V = undefined,
> = IfPrepareActionMethodNotProvided<
  V,
  P,
  PA,
  IfUndefined<P, EventCreatorWithoutPayload, EventCreatorWithPayload<P>>,
  EventCreatorWithPreparedPayload<V, P>
>;

/**
 * TS helper to find if a PrepareCallback is provided
 * You should not use this type directly.
 *
 * @internal
 */
export type IfPrepareActionMethodNotProvided<
  V,
  P,
  PA extends PrepareCallback<V, P> | undefined,
  True,
  False,
> = PA extends undefined ? True : False;

/**
 * TS helper to find if a type is undefined
 * You should not use this type directly.
 *
 * @internal
 */
export type IfUndefined<P, True, False> = P extends undefined ? True : False;

/**
 * Type only used to infer event from `EventCreator` for `EventHandler`.
 * You should not use this type directly.
 *
 * @internal
 */
export type AnyEventCreator<E extends Event = Event> = {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  (args: any): E;
  type: string;
};

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
  addHandler: <EC extends AnyEventCreator>(
    eventCreator: EC,
    handler: Handler<S, ReturnType<EC>>,
  ) => EventHandlerMapBuilder<S>;
};

/**
 * Options passed to the function `createSlice()`.
 *
 * @template S The type of state operated by the slice.
 */
export type SliceOption<S> = {
  initialState: S;
  handlers: (builder: EventHandlerMapBuilder<S>) => void;
};

/**
 * An object representing a slice operating on a subset of a store state
 *
 * @template S The type of state operated by the slice.
 */
export type Slice<S> = {
  handler: Handler<S>;
  getInitialState: () => S;
};

/**
 * Object whose values correspond to different slice.
 *
 * @template S Object map built with property of passed Record Slice and respective state
 */
export type SlicesMapObject<S = unknown> = {
  [K in keyof S]: Slice<S[K]>;
};

/**
 * Infer a combined state shape from a `SlicesMapObject`.
 *
 * @template M Object map of slices as provided to `combineSlices(map: M)`.
 */
export type StateFromSlicesMapObject<M> = M extends SlicesMapObject
  ? { [P in keyof M]: M[P] extends Slice<infer S> ? S : never }
  : never;

/**
 * The state return by `adapter.getInitialState()`
 *
 * @template T The type of the entity use by the entity state.
 */
export type EntityState<T> = {
  ids: Array<string>;
  entities: Record<string, T>;
};

/**
 * Options passed to the function `createEntityAdapter()`
 *
 * @template T The type of the entity handle by the entity adapter.
 */
export type EntityAdapterOptions<T> = {
  selectId: (entity: T) => string;
  sortComparer: (a: T, b: T) => number;
};

/**
 * Object used with `updateOne()` and `updateMany()` functions from
 * the entity state adapter.
 *
 * @template T The type of the entity handle by the entity adapter.
 */
export type UpdateEntity<T> = { id: string; changes: Partial<T> };

/**
 * Object containing several selectors used to get some data from entity adapter
 *
 * @template T The type of the entity handle by the entity adapter.
 * @template V The type of the root state from which select the one use by the adapter.
 */
export interface EntitySelectors<T, V> {
  selectIds: (state: V) => string[];
  selectEntities: (state: V) => Record<string, T>;
  selectAll: (state: V) => T[];
  selectTotal: (state: V) => number;
  selectById: (state: V, id: string) => T | undefined;
}

/**
 * The entity adapter containing all the nice helpers to work with an ORM-like
 * normalize state
 *
 * @template T The type of the entity handle by the entity adapter.
 */
export type EntityStateAdapter<T> = {
  addOne<S extends EntityState<T>>(state: S, entity: T): void;
  addMany<S extends EntityState<T>>(state: S, entities: Array<T>): void;
  setOne<S extends EntityState<T>>(state: S, entity: T): void;
  setMany<S extends EntityState<T>>(state: S, entities: Array<T>): void;
  setAll<S extends EntityState<T>>(state: S, entities: Array<T>): void;
  removeOne<S extends EntityState<T>>(state: S, key: string): void;
  removeMany<S extends EntityState<T>>(state: S, key: Array<string>): void;
  removeAll<S extends EntityState<T>>(state: S): void;
  updateOne<S extends EntityState<T>>(state: S, change: UpdateEntity<T>): void;
  updateMany<S extends EntityState<T>>(state: S, changes: Array<UpdateEntity<T>>): void;
  upsertOne<S extends EntityState<T>>(state: S, entity: T): void;
  upsertMany<S extends EntityState<T>>(state: S, entities: Array<T>): void;
  getInitialState(): EntityState<T>;
  getInitialState<E extends object>(extra: E): EntityState<T> & E;
  getSelectors(): EntitySelectors<T, EntityState<T>>;
  getSelectors<V, E extends EntityState<T>>(selectState: (state: V) => E): EntitySelectors<T, V>;
};
