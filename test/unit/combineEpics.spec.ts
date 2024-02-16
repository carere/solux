import { describe, expect, it } from "vitest";
import { EventWithPayload } from "../../src";
import { combineEpics } from "../../src/combineEpics";
import { configureStore } from "../../src/configureStore";
import { addition, epic1, epic2, epic3, subtract } from "../fixtures";

describe("Using epics", () => {
  const store = configureStore({
    rootEpic: combineEpics(epic1, epic2, epic3),
    rootSlice: {
      getInitialState: () => ({ res: 0 }),
      handler: (state, event: EventWithPayload<number>) => {
        switch (event.type) {
          case "add":
            state.res += event.payload;
            break;
          case "sub":
            state.res -= event.payload;
        }
      },
    },
  });

  it("should handle dispatched actions", () => {
    store.dispatch(addition(2));
    store.dispatch(subtract(3));

    expect(store.state).toEqual({ res: -1 });
  });

  it("should handle dispatched actions", () => {
    store.dispatch(subtract(9));
    store.dispatch(addition(10));

    expect(store.state).toEqual({ res: 0 });
  });
});
