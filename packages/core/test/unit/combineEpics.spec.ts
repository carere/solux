import { describe, expect, it } from "bun:test";
import { configureStore, createSlice } from "../../src";
import { combineEpics } from "../../src/combineEpics";
import { applyMiddlewares } from "../../src/enhancers";
import { createObservableMiddleware } from "../../src/middlewares";
import { add, addition, epic1, epic2, epic3, sub, subtract } from "../fixtures";

describe("Using epics", () => {
  const rootEpic = combineEpics(epic1, epic2, epic3);

  const store = configureStore({
    enhancers: [applyMiddlewares([createObservableMiddleware({ rootEpic, container: undefined })])],
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
