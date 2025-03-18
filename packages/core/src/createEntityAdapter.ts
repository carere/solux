import type { EntityAdapterOptions, EntityState, EntityStateAdapter, UpdateEntity } from "./types";

/**
 * Create an entity adapter based on an entity. This adapter is like
 * an mini-orm which can be use to manipulate a normalized state.
 *
 * @template T The entity which this entity adapter can handle
 * @param options the options used to configure the adapter
 * @returns a full fledged entity adapter
 */
export const createEntityAdapter = <T>({
  selectId,
  sortComparer,
}: EntityAdapterOptions<T>): EntityStateAdapter<T> => {
  const sortIds = (entities: Array<T>) => entities.sort(sortComparer).map((e) => selectId(e));

  const assocEntity = (state: EntityState<T>, entity: T, replace = false) => {
    const id = selectId(entity);
    const isAlreadyThere = state.ids.includes(id);

    if (!isAlreadyThere) state.ids.push(id);
    if (isAlreadyThere && !replace) return;

    state.entities[id] = entity;
  };

  const removeEntity = (state: EntityState<T>, key: string) => {
    if (state.ids.includes(key)) {
      state.ids.splice(state.ids.indexOf(key), 1);
      delete state.entities[key];
    }
  };

  const updateEntity = (state: EntityState<T>, change: UpdateEntity<T>) => {
    if (state.ids.includes(change.id))
      assocEntity(state, { ...state.entities[change.id], ...change.changes }, true);
  };

  const upsertEntity = (state: EntityState<T>, entity: T) => {
    assocEntity(state, entity, state.ids.includes(selectId(entity)));
  };

  return {
    addOne: (state, entity) => {
      assocEntity(state, entity);
      state.ids = sortIds(Object.values(state.entities));
    },
    addMany: (state, entities) => {
      for (const entity of entities) {
        assocEntity(state, entity);
      }
      state.ids = sortIds(Object.values(state.entities));
    },
    setOne: (state, entity) => {
      assocEntity(state, entity, true);
      state.ids = sortIds(Object.values(state.entities));
    },
    setMany: (state, entities) => {
      for (const entity of entities) {
        assocEntity(state, entity, true);
      }
      state.ids = sortIds(Object.values(state.entities));
    },
    setAll: (state, entities) => {
      state.ids = sortIds(entities);
      state.entities = entities.reduce((acc, curr) => {
        acc[selectId(curr)] = curr;
        return acc;
      }, {});
    },
    removeOne: removeEntity,
    removeMany: (state, ids) => {
      for (const id of ids) {
        removeEntity(state, id);
      }
    },
    removeAll: (state) => {
      state.ids = [];
      state.entities = {};
    },
    updateOne: (state, change) => {
      updateEntity(state, change);
      state.ids = sortIds(Object.values(state.entities));
    },
    updateMany: (state, changes) => {
      for (const change of changes) {
        updateEntity(state, change);
      }
      state.ids = sortIds(Object.values(state.entities));
    },
    upsertOne: (state, entity) => {
      upsertEntity(state, entity);
      state.ids = sortIds(Object.values(state.entities));
    },
    upsertMany: (state, entities) => {
      for (const entity of entities) {
        upsertEntity(state, entity);
      }
      state.ids = sortIds(Object.values(state.entities));
    },
    getInitialState: <E extends object>(extra?: E) => ({
      ids: [],
      entities: {},
      ...(extra ? extra : {}),
    }),
    getSelectors: <V, E extends EntityState<T>>(selectState?: (state: V) => E) => ({
      selectIds: (state: V | E) => (selectState ? selectState(state as V) : (state as E)).ids,
      selectEntities: (state: V | E) =>
        (selectState ? selectState(state as V) : (state as E)).entities,
      selectAll: (state: V | E) => {
        const s = selectState ? selectState(state as V) : (state as E);

        return s.ids.map((id) => s.entities[id]);
      },
      selectTotal: (state: V | E) =>
        (selectState ? selectState(state as V) : (state as E)).ids.length,
      selectById: (state: V | E, id: string) => {
        const s = selectState ? selectState(state as V) : (state as E);

        return s.ids.includes(id) ? s.entities[id] : undefined;
      },
    }),
  };
};
