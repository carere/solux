import { describe, expect, it } from "bun:test";
import { createEvent, createSlice } from "../../src";
import { configureStore } from "../../src/configureStore";

describe("Subscribing to an event", () => {
  const makeMagic = createEvent<number>("make_magic");

  const store = configureStore({
    rootSlice: createSlice({
      initialState: { magic: 0 },
      handlers: (builder) => {
        builder.addHandler(makeMagic, (state, event) => {
          state.magic = event.payload;
        });
      },
    }),
  });

  store.dispatch(makeMagic(42));

  it("should notify listener with the last state and dispatched event", () => {
    store.subscribeToEvent(makeMagic, ({ state, event }) => {
      expect(state.magic).toEqual(42);
      expect(event.type).toEqual("make_magic");
      expect(event.payload).toEqual(42);
    });
  });
});
