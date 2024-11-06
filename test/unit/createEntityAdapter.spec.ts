import { beforeEach, describe, expect, it } from "bun:test";
import { createEntityAdapter } from "../../src/createEntityAdapter";
import type { EntityState, EntityStateAdapter } from "../../src/types";
import { type Person, bob, charles, jean, jean2, john, john2 } from "../fixtures";

describe("Using Entity Adapter", () => {
  let adapter: EntityStateAdapter<Person>;
  let state: EntityState<Person>;
  let rootState: { person: typeof state };

  beforeEach(() => {
    adapter = createEntityAdapter<Person>({
      selectId: (pokemon) => pokemon.id,
      sortComparer: (a, b) => a.name.localeCompare(b.name),
    });

    state = { ids: [], entities: {} };
    rootState = { person: state };
  });

  it("should be able to add one entity", () => {
    adapter.addOne(state, jean);

    expect(state).toEqual({
      ids: [jean.id],
      entities: {
        [jean.id]: jean,
      },
    });
  });

  it("should not add entity if already present", () => {
    adapter.addOne(state, jean);
    adapter.addOne(state, jean);

    expect(state).toEqual({
      ids: [jean.id],
      entities: {
        [jean.id]: jean,
      },
    });
  });

  it("should be able to add several entities in order", () => {
    adapter.addMany(state, [john, jean]);

    expect(state).toEqual({
      ids: [jean.id, john.id],
      entities: {
        [jean.id]: jean,
        [john.id]: john,
      },
    });
  });

  it("should be able to set an entity and replace it if it already exist", () => {
    adapter.addOne(state, jean);
    adapter.setOne(state, jean2);

    expect(state).toEqual({
      ids: [jean2.id],
      entities: {
        [jean2.id]: jean2,
      },
    });
  });

  it("should be able to set several entities and replace those already present", () => {
    adapter.addMany(state, [john, jean]);
    adapter.setMany(state, [john2, jean2]);

    expect(state).toEqual({
      ids: [jean.id, john.id],
      entities: {
        [jean.id]: jean2,
        [john.id]: john2,
      },
    });
  });

  it("should be able replace all entities", () => {
    adapter.addMany(state, [john, jean]);
    adapter.setAll(state, [bob, charles]);

    expect(state).toEqual({
      ids: [bob.id, charles.id],
      entities: {
        [bob.id]: bob,
        [charles.id]: charles,
      },
    });
  });

  it("should be able to remove already present entity", () => {
    adapter.addOne(state, jean);
    adapter.addOne(state, bob);
    adapter.removeOne(state, jean.id);

    expect(state).toEqual({
      ids: [bob.id],
      entities: {
        [bob.id]: bob,
      },
    });
  });

  it("should do nothing if entity already present and removal asked", () => {
    adapter.addOne(state, bob);
    adapter.removeOne(state, jean.id);

    expect(state).toEqual({
      ids: [bob.id],
      entities: {
        [bob.id]: bob,
      },
    });
  });

  it("should be able to remove many entities", () => {
    adapter.addMany(state, [bob, jean, charles]);
    adapter.removeMany(state, [bob.id, jean.id]);

    expect(state).toEqual({
      ids: [charles.id],
      entities: {
        [charles.id]: charles,
      },
    });
  });

  it("should be able to remove all entities", () => {
    adapter.addMany(state, [bob, jean, charles]);
    adapter.removeAll(state);

    expect(state).toEqual({
      ids: [],
      entities: {},
    });
  });

  it("should return initial state", () => {
    const initialState = adapter.getInitialState();

    expect(initialState).toEqual({
      ids: [],
      entities: {},
    });
  });

  it("should return initial state with extra", () => {
    const extraState = adapter.getInitialState({ extra: 0 });

    expect(extraState).toEqual({
      ids: [],
      entities: {},
      extra: 0,
    });
  });

  it("should be able to select ids", () => {
    adapter.addMany(state, [bob, charles, jean, john]);

    expect(adapter.getSelectors().selectIds(state)).toEqual([bob.id, charles.id, jean.id, john.id]);
    expect(adapter.getSelectors((s: typeof rootState) => s.person).selectIds(rootState)).toEqual([
      bob.id,
      charles.id,
      jean.id,
      john.id,
    ]);
  });

  it("should be able to select entities", () => {
    adapter.addMany(state, [bob, charles, jean, john]);

    expect(adapter.getSelectors().selectEntities(state)).toEqual({
      [bob.id]: bob,
      [charles.id]: charles,
      [jean.id]: jean,
      [john.id]: john,
    });
    expect(
      adapter.getSelectors((s: typeof rootState) => s.person).selectEntities(rootState),
    ).toEqual({
      [bob.id]: bob,
      [charles.id]: charles,
      [jean.id]: jean,
      [john.id]: john,
    });
  });

  it("should be able to return total number of entities", () => {
    adapter.addMany(state, [bob, charles, jean, john]);

    expect(adapter.getSelectors().selectTotal(state)).toEqual(4);
    expect(adapter.getSelectors((s: typeof rootState) => s.person).selectTotal(rootState)).toEqual(
      4,
    );
  });

  it("should be able to return all entities", () => {
    adapter.addMany(state, [bob, charles, jean, john]);

    expect(adapter.getSelectors().selectAll(state)).toEqual([bob, charles, jean, john]);
    expect(adapter.getSelectors((s: typeof rootState) => s.person).selectAll(rootState)).toEqual([
      bob,
      charles,
      jean,
      john,
    ]);
  });

  it("should be able to select an entity by id", () => {
    adapter.addMany(state, [bob, charles]);

    expect(adapter.getSelectors().selectById(state, bob.id)).toEqual(bob);
    expect(adapter.getSelectors().selectById(state, jean.id)).toEqual(undefined);
    expect(
      adapter.getSelectors((s: typeof rootState) => s.person).selectById(rootState, bob.id),
    ).toEqual(bob);
  });
});
