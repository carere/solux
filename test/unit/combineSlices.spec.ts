import { describe, expect, it } from "vitest";
import { combineSlices } from "../../src/combineSlices";
import { createEvent } from "../../src/createEvent";
import { createSlice } from "../../src/createSlice";

describe("Combining handlers", () => {
  const someEvent = createEvent<number>("someEvent");
  const toto = createSlice({
    initialState: { depth: 0 },
    handlers: (builder) =>
      builder.addHandler(someEvent, (state, { payload }) => {
        state.depth += payload;
      }),
  });
  const tata = createSlice({
    initialState: { height: 0 },
    handlers: (builder) =>
      builder.addHandler(someEvent, (state, { payload }) => {
        state.height -= payload;
      }),
  });
  const titi = createSlice({
    initialState: { low: 0 },
    handlers: (builder) =>
      builder.addHandler(someEvent, (state, { payload }) => {
        state.low = payload + 2;
      }),
  });

  const slice = combineSlices({
    app: combineSlices({
      tata,
      tutu: combineSlices({
        titi,
        toto,
      }),
    }),
  });

  it("should return the combined initialState", () => {
    expect(slice.getInitialState()).toEqual({
      app: { tata: { height: 0 }, tutu: { titi: { low: 0 }, toto: { depth: 0 } } },
    });
  });

  it("should handle event as combined handlers", () => {
    const state = {
      app: { tata: { height: 0 }, tutu: { titi: { low: 0 }, toto: { depth: 0 } } },
    };

    slice.handler(state, someEvent(42));

    expect(state).toEqual({
      app: { tata: { height: -42 }, tutu: { titi: { low: 44 }, toto: { depth: 42 } } },
    });
  });
});
