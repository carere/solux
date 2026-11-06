import {
  applyMiddlewares,
  combineSlices,
  configureStore,
  createEvent,
  createSlice,
  type DevToolsOptions,
  devtools,
  type Enhancer,
  SoluxProvider,
  type Store,
} from "@carere/solux";

const select = createEvent<number>("chart/select");
const rootSlice = combineSlices({
  interaction: createSlice({
    initialState: { selected: { time: 0 } },
    handlers: (builder) =>
      builder.addHandler(select, (state, event) => {
        state.selected.time = event.payload;
      }),
  }),
});
type State = ReturnType<typeof rootSlice.getInitialState>;
const options: DevToolsOptions = {
  name: "Chart 1",
  instanceId: "chart:1:mount:1",
  features: { jump: true, import: "custom" },
  predicate: (_state, event) => event.type !== "chart/ignored",
  serialize: { options: { date: true } },
};
const custom: Enhancer<State> = (store) => {
  store.onDispose(() => {});
  return store;
};
const store: Store<State> = configureStore({
  rootSlice,
  enhancers: [custom, applyMiddlewares([]), devtools(options)],
});
store.dispatch(select(10));
const subscription = store.subscribeToEvent(select, ({ event, state }) => {
  const time: number = event.payload + state.interaction.selected.time;
  console.log(time);
});
subscription.unsubscribe();
// Check the provider export without invoking a client render in this fixture.
const provider: typeof SoluxProvider<State> = SoluxProvider;
void provider;
store.dispose();
// @ts-expect-error Event payload remains checked through the package declarations.
select("invalid");
