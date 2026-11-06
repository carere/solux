import { describe, expect, it, mock } from "bun:test";
import { createEvent, createSlice } from "../../src";
import { configureStore } from "../../src/configureStore";

describe("Subscribing to an event", () => {
  it("replays only the latest stream event when its type matches", () => {
    const a = createEvent("a");
    const b = createEvent("b");
    const store = configureStore({
      rootSlice: createSlice({ initialState: {}, handlers: () => {} }),
    });
    store.dispatch(a());
    store.dispatch(b());
    const listenerA = mock(() => {});
    const listenerB = mock(() => {});
    store.subscribeToEvent(a, listenerA);
    store.subscribeToEvent(b, listenerB);
    expect(listenerA).not.toHaveBeenCalled();
    expect(listenerB).toHaveBeenCalledTimes(1);
    store.dispatch(a());
    expect(listenerA).toHaveBeenCalledTimes(1);
    expect(listenerB).toHaveBeenCalledTimes(1);
    store.dispose();
  });

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
