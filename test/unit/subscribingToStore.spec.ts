import { describe, expect, it } from "vitest";
import { configureStore } from "../../src/configureStore";
import { EventWithPayload } from "../../src/types";

describe("Subscribing to store", () => {
  const store = configureStore({
    rootSlice: {
      getInitialState: () => ({ magic: 0 }),
      handler: (state, event: EventWithPayload<number>) => {
        state.magic = event.payload;
      },
    },
  });

  store.dispatch({ type: "make_magic", payload: 42 });

  it("should notify listener with the last state and dispatched event", () => {
    store.subscribe(
      ({ state, event }: { state: { magic: number }; event: EventWithPayload<number> }) => {
        expect(state.magic).toEqual(42);
        expect(event.type).toEqual("make_magic");
        expect(event.payload).toEqual(42);
      },
    );
  });
});
