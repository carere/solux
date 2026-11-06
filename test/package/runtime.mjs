import assert from "node:assert/strict";
import { createComputed, createRoot } from "solid-js";
import { isServer } from "solid-js/web";
import { combineSlices, configureStore, createEvent, createSlice, devtools, SoluxProvider, useSolux } from "@carere/solux";

assert.equal(typeof window, "undefined");
assert.equal(typeof document, "undefined");
const update = createEvent("chart/update");
const createScope = (id) => configureStore({
  rootSlice: combineSlices({
    interaction: createSlice({
      initialState: { selected: { time: 0 }, points: [{ value: 0 }] },
      handlers: (builder) => builder.addHandler(update, (state, { payload }) => {
        state.selected.time = payload;
        state.points[0].value = payload;
      }),
    }),
  }),
  enhancers: [devtools({ name: id, instanceId: id })],
});
for (let cycle = 0; cycle < 10; cycle++) {
  // Fresh slices/nested graphs per chart and per SSR request, not shared singletons.
  const scopes = ["request:1/chart:1", "request:1/chart:2", "request:2/chart:1", "request:2/chart:2"].map(createScope);
  const [a, b, otherRequest] = scopes;
  const disposeProvider = createRoot((dispose) => {
    SoluxProvider({
      store: a,
      get children() {
        assert.equal(useSolux(), a);
        return null;
      },
    });
    return dispose;
  });
  disposeProvider(); // Provider ownership alone does not dispose the store.
  assert.notEqual(a.state.interaction.selected, b.state.interaction.selected);
  assert.notEqual(a.state.interaction.points[0], otherRequest.state.interaction.points[0]);
  const values = [];
  const disposeRoot = createRoot((dispose) => {
    createComputed(() => values.push(a.state.interaction.selected.time));
    return dispose;
  });
  let deliveries = 0;
  const subscription = a.subscribe(() => deliveries++);
  a.dispatch(update(7));
  assert.equal(a.state.interaction.selected.time, 7);
  assert.equal(b.state.interaction.selected.time, 0);
  assert.equal(otherRequest.state.interaction.points[0].value, 0);
  assert.deepEqual(values, isServer ? [0] : [0, 7]);
  for (const scope of scopes) {
    scope.dispose();
    scope.dispose();
  }
  assert.equal(subscription.closed, true);
  a.dispatch(update(99));
  assert.equal(a.state.interaction.selected.time, 7);
  a.subscribe(() => deliveries++);
  assert.equal(deliveries, 1);
  disposeRoot();
}
console.log(`Packed consumer passed: ${isServer ? "SSR" : "browser-condition Solid reactivity"}, no browser globals, independent scopes and disposal`);
