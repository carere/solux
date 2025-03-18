import { describe, expect, it } from "bun:test";
import { configureStore } from "../../src/configureStore";
import type { EventWithPayload } from "../../src/types";

describe("Updating to store", () => {
  const store = configureStore({
    rootSlice: {
      getInitialState: () => ({ magic: 0 }),
      handler: (state, event: EventWithPayload<number>) => {
        state.magic = event.payload;
      },
    },
  });

  store.dispatch({ type: "make_magic", payload: 42 });

  it("should notify listener with the last state and dispatched action", () => {
    expect(store.state).toEqual({ magic: 42 });
  });
});
