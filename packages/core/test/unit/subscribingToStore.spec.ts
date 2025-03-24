import { describe, expect, it } from "bun:test";
import { createEvent, createSlice } from "../../src";
import { configureStore } from "../../src/configureStore";

describe("Subscribing to store", () => {
  const makeMagic = createEvent<number>("make_magic");

  const store = configureStore({
    rootSlice: createSlice({
      initialState: { magic: 0 },
      handlers: (builder) =>
        builder.addHandler(makeMagic, (state, event) => {
          state.magic = event.payload;
        }),
    }),
  });

  store.dispatch(makeMagic(42));

  it("should notify listener with the last state and dispatched event", () => {
    store.subscribe(({ state, event }) => {
      expect(state.magic).toEqual(42);
      const e = event as ReturnType<typeof makeMagic>;
      expect(e.type).toEqual("make_magic");
      expect(e.payload).toEqual(42);
    });
  });
});
