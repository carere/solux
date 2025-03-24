import {
  type Epic,
  applyMiddlewares,
  configureStore,
  createSlice,
  devtools,
  epicMiddleware,
} from "@carere/solux";
import { filter, map } from "rxjs";
import { decrementMagic, incrementMagic } from "./events";

const rootSlice = createSlice({
  initialState: { magic: 42 },
  handlers: (builder) =>
    builder
      .addHandler(incrementMagic, (state, event) => {
        state.magic += event.payload;
      })
      .addHandler(decrementMagic, (state, event) => {
        state.magic -= event.payload;
      }),
});

const rootEpic: Epic<RootState> = (event$) =>
  event$.pipe(
    filter(incrementMagic.match),
    map(({ payload }) => decrementMagic(payload)),
  );

export const store = configureStore({
  rootSlice,
  enhancers: [
    devtools({ name: "Solux", instanceId: "Solux", trace: true }),
    applyMiddlewares([epicMiddleware({ rootEpic })]),
  ],
});

export type RootState = ReturnType<typeof rootSlice.getInitialState>;
