import { combineSlices, configureStore, createEvent, createSlice } from "@carere/solux";

export const increment = createEvent<number>("counter/increment");
export const reset = createEvent("counter/reset");

export function createCounterStore() {
  const counter = createSlice({
    initialState: { value: 0 },
    handlers: (builder) =>
      builder
        .addHandler(increment, (state, { payload }) => {
          state.value += payload;
        })
        .addHandler(reset, (state) => {
          state.value = 0;
        }),
  });
  return configureStore({ rootSlice: combineSlices({ counter }) });
}
