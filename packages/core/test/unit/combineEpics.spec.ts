import { describe, expect, it } from "bun:test";
import { configureStore, createSlice } from "../../src";
import { combineEpics } from "../../src/combineEpics";
import { applyMiddlewares } from "../../src/enhancers";
import { createObservableMiddleware } from "../../src/middlewares";
import { add, addition, epic1, epic2, epic3, sub, subtract } from "../fixtures";

describe("Using epics", () => {
  const rootEpic = combineEpics(epic1, epic2, epic3);

  const store = configureStore({
    enhancers: [applyMiddlewares([createObservableMiddleware({ rootEpic })])],
    rootSlice: createSlice({
      initialState: { res: 0 },
      handlers: (builder) => {
        builder.addHandler(add, (state, event) => {
          state.res += event.payload;
        });
        builder.addHandler(sub, (state, event) => {
          state.res -= event.payload;
        });
      },
    }),
  });

  it.each([
    [[addition(2), subtract(3)], { res: -1 }],
    [[subtract(9), addition(10)], { res: 0 }],
    [[add(2), add(4), add(6)], { res: 12 }],
  ])("should handle dispatched actions", (events, expected) => {
    events.forEach(store.dispatch);

    expect(store.state).toEqual(expected);
  });
});
