import { configureStore, createEvent, createSlice } from "@carere/solux";

export const appendPoint = createEvent<number>("chart/pointAdded");

// Each call creates a fresh slice AND fresh nested state.
// Share event creators, never a slice's initial-state object.
export function createChartStore() {
  const rootSlice = createSlice({
    initialState: { series: { points: [24, 38, 30, 54] } },
    handlers: (builder) =>
      builder.addHandler(appendPoint, (state, { payload }) => {
        state.series.points.push(payload);
        if (state.series.points.length > 12) state.series.points.shift();
      }),
  });
  return configureStore({ rootSlice });
}
