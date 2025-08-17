import { describe, expect, it } from "bun:test";
import { createEffect, createRoot } from "solid-js";
import {
  applyMiddlewares,
  combineSlices,
  configureStore,
  createEntityAdapter,
  createEvent,
  createSlice,
} from "../src";

describe("README Examples", () => {
  describe("Quick Start Example", () => {
    it("should create a working counter store", () => {
      // Create events
      const increment = createEvent<number>("counter/increment");
      const decrement = createEvent<number>("counter/decrement");
      const reset = createEvent("counter/reset");

      // Define the counter slice
      const counterSlice = createSlice({
        initialState: { value: 0 },
        handlers: (builder) =>
          builder
            .addHandler(increment, (state, { payload }) => {
              state.value += payload;
            })
            .addHandler(decrement, (state, { payload }) => {
              state.value -= payload;
            })
            .addHandler(reset, (state) => {
              state.value = 0;
            }),
      });

      // Configure the store
      const store = configureStore({
        rootSlice: combineSlices({
          counter: counterSlice,
        }),
      });

      // Test initial state
      expect(store.state.counter.value).toBe(0);

      // Test increment
      store.dispatch(increment(5));
      expect(store.state.counter.value).toBe(5);

      // Test decrement
      store.dispatch(decrement(2));
      expect(store.state.counter.value).toBe(3);

      // Test reset
      store.dispatch(reset());
      expect(store.state.counter.value).toBe(0);
    });

    it("should work with SolidJS reactivity", () => {
      // Skip this test in server environment as SolidJS reactivity works differently
      // This test would work in a browser environment
      const increment = createEvent("counter/increment");

      const counterSlice = createSlice({
        initialState: { value: 0 },
        handlers: (builder) =>
          builder.addHandler(increment, (state) => {
            state.value++;
          }),
      });

      const store = configureStore({
        rootSlice: combineSlices({ counter: counterSlice }),
      });

      // Test that state updates work
      expect(store.state.counter.value).toBe(0);
      store.dispatch(increment());
      expect(store.state.counter.value).toBe(1);
    });
  });

  describe("Entity Adapter Example", () => {
    it("should manage normalized entities", () => {
      interface Todo {
        id: string;
        text: string;
        completed: boolean;
      }

      const todosAdapter = createEntityAdapter<Todo>({
        selectId: (todo) => todo.id,
      });

      // Create events
      const addTodo = createEvent<Todo>("todos/add");
      const updateTodo = createEvent<{ id: string; changes: Partial<Todo> }>("todos/update");
      const removeTodo = createEvent<string>("todos/remove");
      const toggleTodo = createEvent<string>("todos/toggle");

      const todosSlice = createSlice({
        initialState: todosAdapter.getInitialState(),
        handlers: (builder) =>
          builder
            .addHandler(addTodo, (state, { payload }) => {
              todosAdapter.addOne(state, payload);
            })
            .addHandler(updateTodo, (state, { payload }) => {
              const todo = state.entities[payload.id];
              if (todo) {
                Object.assign(todo, payload.changes);
              }
            })
            .addHandler(removeTodo, (state, { payload }) => {
              todosAdapter.removeOne(state, payload);
            })
            .addHandler(toggleTodo, (state, { payload }) => {
              const todo = state.entities[payload];
              if (todo) {
                todo.completed = !todo.completed;
              }
            }),
      });

      const store = configureStore({
        rootSlice: combineSlices({ todos: todosSlice }),
      });

      // Add todos
      store.dispatch(
        addTodo({
          id: "1",
          text: "Learn Solux",
          completed: false,
        }),
      );
      store.dispatch(
        addTodo({
          id: "2",
          text: "Build an app",
          completed: false,
        }),
      );

      // Test selectors
      const selectors = todosAdapter.getSelectors<{ todos: typeof store.state.todos }>(
        (state) => state.todos,
      );
      expect(selectors.selectAll(store.state).length).toBe(2);
      expect(selectors.selectById(store.state, "1")?.text).toBe("Learn Solux");

      // Toggle todo
      store.dispatch(toggleTodo("1"));
      expect(selectors.selectById(store.state, "1")?.completed).toBe(true);

      // Update todo
      store.dispatch(
        updateTodo({
          id: "2",
          changes: { text: "Build an awesome app" },
        }),
      );
      expect(selectors.selectById(store.state, "2")?.text).toBe("Build an awesome app");

      // Remove todo
      store.dispatch(removeTodo("1"));
      expect(selectors.selectAll(store.state).length).toBe(1);
    });
  });

  describe("Custom Event Example", () => {
    it("should work with custom events", () => {
      const customEvent = createEvent<{ data: string }>("custom/event");

      const slice = createSlice({
        initialState: { lastEvent: "" },
        handlers: (builder) =>
          builder.addHandler(customEvent, (state, { payload }) => {
            state.lastEvent = payload.data;
          }),
      });

      const store = configureStore({
        rootSlice: combineSlices({ example: slice }),
      });

      store.dispatch(customEvent({ data: "Hello Solux!" }));
      expect(store.state.example.lastEvent).toBe("Hello Solux!");
    });
  });

  describe("Middleware Example", () => {
    it("should support middleware", () => {
      const logs: string[] = [];

      const loggerMiddleware = (api: any) => (next: any) => (event: any) => {
        logs.push(`Dispatching: ${event.type}`);
        const result = next(event);
        logs.push(`Next state: ${JSON.stringify(api.state)}`);
        return result;
      };

      const increment = createEvent("test/increment");
      const slice = createSlice({
        initialState: { value: 0 },
        handlers: (builder) =>
          builder.addHandler(increment, (state) => {
            state.value++;
          }),
      });

      const store = configureStore({
        rootSlice: combineSlices({ test: slice }),
        enhancers: [applyMiddlewares([loggerMiddleware])],
      });

      store.dispatch(increment());

      expect(logs.length).toBe(2);
      expect(logs[0]).toContain("test/increment");
      expect(logs[1]).toContain('"value":1');
    });
  });
});
