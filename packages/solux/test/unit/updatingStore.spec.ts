import { describe, expect, it } from "bun:test";
import { createEvent, createSlice } from "../../src";
import { configureStore } from "../../src/configureStore";

describe("Updating to store", () => {
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

  store.dispatch({ type: "make_magic", payload: 42 });

  it("should notify listener with the last state and dispatched action", () => {
    expect(store.state).toEqual({ magic: 42 });
  });
});
