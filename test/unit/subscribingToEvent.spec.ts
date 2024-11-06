import { describe, expect, it } from "vitest";
import { createEvent } from "../../src";
import { configureStore } from "../../src/configureStore";
import type { EventWithPayload } from "../../src/types";

describe("Subscribing to an event", () => {
  const eventCreator = createEvent<number>("make_magic");

  const store = configureStore({
    rootSlice: {
      getInitialState: () => ({ magic: 0 }),
      handler: (state, event: EventWithPayload<number>) => {
        state.magic = event.payload;
      },
    },
  });

  store.dispatch(eventCreator(42));

  it("should notify listener with the last state and dispatched event", () => {
    store.subscribeToEvent(eventCreator, ({ state, event }) => {
      expect(state.magic).toEqual(42);
      expect(event.type).toEqual("make_magic");
      expect(event.payload).toEqual(42);
    });
  });
});
