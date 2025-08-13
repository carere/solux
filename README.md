# 🌟 Solux

<div align="center">

[![NPM Version](https://img.shields.io/npm/v/@carere/solux.svg)](https://www.npmjs.com/package/@carere/solux)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@carere/solux)](https://bundlephobia.com/package/@carere/solux)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

**Redux Toolkit-inspired state management for SolidJS applications**

Combining the predictability of Redux patterns with the fine-grained reactivity of SolidJS

</div>

---

## ✨ Features

- 🎯 **Redux-like patterns** - Familiar concepts like slices, actions, and middleware
- ⚡ **SolidJS reactivity** - Leverages SolidJS's fine-grained reactivity system
- 📦 **Minimal bundle size** - Tree-shakable and optimized for production
- 🔧 **TypeScript first** - Full type inference and type safety
- 🗃️ **Entity adapters** - Normalize and manage collections effortlessly
- 🌊 **RxJS epics** - Handle complex async flows and side effects
- 🎨 **DevTools support** - Time-travel debugging and state inspection
- 🚀 **Zero configuration** - Works out of the box with sensible defaults

## 📦 Installation

```bash
# npm
npm install @carere/solux

# yarn
yarn add @carere/solux

# pnpm
pnpm add @carere/solux

# bun
bun add @carere/solux
```

### Peer Dependencies

Solux requires the following peer dependencies:

```json
{
  "solid-js": "^1.9.9",
  "rxjs": "^7.8.2"
}
```

## 🚀 Quick Start

```typescript
import { configureStore, createSlice, createEvent } from '@carere/solux';
import { SoluxProvider, useSolux } from '@carere/solux';

// Create events (actions)
const increment = createEvent('counter/increment');
const decrement = createEvent('counter/decrement');
const addBy = createEvent<number>('counter/addBy');

// Create a slice
const counterSlice = createSlice({
  initialState: { value: 0 },
  handlers: (builder) => 
    builder
      .addHandler(increment, (state) => {
        state.value += 1;
      })
      .addHandler(decrement, (state) => {
        state.value -= 1;
      })
      .addHandler(addBy, (state, event) => {
        state.value += event.payload;
      })
});

// Configure the store
const store = configureStore({
  rootSlice: counterSlice
});

// Use in your SolidJS app
function App() {
  return (
    <SoluxProvider store={store}>
      <Counter />
    </SoluxProvider>
  );
}

function Counter() {
  const store = useSolux();
  
  return (
    <div>
      <p>Count: {store.state.value}</p>
      <button onClick={() => store.dispatch(increment())}>+</button>
      <button onClick={() => store.dispatch(decrement())}>-</button>
      <button onClick={() => store.dispatch(addBy(5))}>+5</button>
    </div>
  );
}
```

## 📚 Core Concepts

### Slices

Slices are the building blocks of your state. They define an initial state and handlers for events:

```typescript
const todosSlice = createSlice({
  initialState: {
    items: [] as Todo[],
    filter: 'all' as 'all' | 'active' | 'completed'
  },
  handlers: (builder) =>
    builder
      .addHandler(todoAdded, (state, event) => {
        state.items.push(event.payload);
      })
      .addHandler(todoToggled, (state, event) => {
        const todo = state.items.find(t => t.id === event.payload);
        if (todo) todo.completed = !todo.completed;
      })
      .addHandler(filterChanged, (state, event) => {
        state.filter = event.payload;
      })
});
```

### Events

Events are type-safe action creators:

```typescript
// Simple event
const increment = createEvent('increment');

// Event with payload
const addTodo = createEvent<{
  id: string;
  text: string;
  completed: boolean;
}>('todos/add');

// Dispatch events
store.dispatch(increment());
store.dispatch(addTodo({ id: '1', text: 'Learn Solux', completed: false }));
```

### Entity Adapters

Manage normalized collections with entity adapters:

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

const usersAdapter = createEntityAdapter<User>({
  selectId: (user) => user.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name)
});

const usersSlice = createSlice({
  initialState: usersAdapter.getInitialState(),
  handlers: (builder) =>
    builder
      .addHandler(userAdded, (state, event) => {
        usersAdapter.addOne(state, event.payload);
      })
      .addHandler(usersReceived, (state, event) => {
        usersAdapter.setAll(state, event.payload);
      })
      .addHandler(userUpdated, (state, event) => {
        usersAdapter.setOne(state, event.payload);
      })
      .addHandler(userRemoved, (state, event) => {
        usersAdapter.removeOne(state, event.payload);
      })
});

// Use selectors
const selectors = usersAdapter.getSelectors();
const allUsers = selectors.selectAll(store.state);
const userById = selectors.selectById(store.state, 'user-1');
const totalUsers = selectors.selectTotal(store.state);
```

### Combining Slices

Compose multiple slices into a single root slice:

```typescript
import { combineSlices } from '@carere/solux';

const rootSlice = combineSlices({
  counter: counterSlice,
  todos: todosSlice,
  users: usersSlice
});

const store = configureStore({
  rootSlice
});

// Access nested state
store.state.counter.value;
store.state.todos.items;
store.state.users.entities;
```

### Epics (RxJS Side Effects)

Handle complex async flows with epics:

```typescript
import { combineEpics } from '@carere/solux';
import { filter, map, debounceTime, switchMap } from 'rxjs/operators';

// Epic that fetches users when search changes
const searchUsersEpic = (event$, state$) =>
  event$.pipe(
    filter((event) => event.type === searchQueryChanged.type),
    debounceTime(300),
    switchMap(async (event) => {
      const users = await fetchUsers(event.payload);
      return usersReceived(users);
    })
  );

// Epic that saves state to localStorage
const persistStateEpic = (event$, state$) =>
  event$.pipe(
    debounceTime(1000),
    map(() => {
      localStorage.setItem('app-state', JSON.stringify(state$.value));
      return statePersisted();
    })
  );

const rootEpic = combineEpics(
  searchUsersEpic,
  persistStateEpic
);

// Configure store with epics
const store = configureStore({
  rootSlice,
  enhancers: [
    applyMiddlewares([
      epicMiddleware({ rootEpic })
    ])
  ]
});
```

### Store Configuration

Configure your store with middleware, enhancers, and preloaded state:

```typescript
const store = configureStore({
  rootSlice,
  preloadedState: loadStateFromLocalStorage(),
  enhancers: [
    applyMiddlewares([
      epicMiddleware({ rootEpic }),
      loggerMiddleware
    ])
  ]
});

// Subscribe to state changes
const unsubscribe = store.subscribe(() => {
  console.log('State changed:', store.state);
});

// Subscribe to specific events
const unsubscribeFromEvent = store.subscribeToEvent(todoAdded, (event) => {
  console.log('Todo added:', event.payload);
});
```

### SolidJS Integration

Use the provided context and hooks in your SolidJS components:

```typescript
import { SoluxProvider, useSolux } from '@carere/solux';
import { createMemo } from 'solid-js';

function App() {
  return (
    <SoluxProvider store={store}>
      <TodoList />
    </SoluxProvider>
  );
}

function TodoList() {
  const store = useSolux();
  
  // Create derived state with SolidJS reactivity
  const completedCount = createMemo(() => 
    store.state.todos.items.filter(t => t.completed).length
  );
  
  const activeTodos = createMemo(() =>
    store.state.todos.items.filter(t => !t.completed)
  );
  
  return (
    <div>
      <h2>Active Todos ({activeTodos().length})</h2>
      <For each={activeTodos()}>
        {(todo) => (
          <TodoItem 
            todo={todo} 
            onToggle={() => store.dispatch(todoToggled(todo.id))}
          />
        )}
      </For>
      <p>Completed: {completedCount()}</p>
    </div>
  );
}
```

## 🛠️ API Reference

### Store Creation
- `configureStore(options)` - Creates and configures a store
- `createSlice(options)` - Creates a slice with handlers
- `combineSlices(slices)` - Combines multiple slices into one

### Events
- `createEvent(type)` - Creates a simple event creator
- `createEvent<T>(type)` - Creates an event creator with payload

### Entity Adapter
- `createEntityAdapter(options)` - Creates an entity adapter
- Adapter methods: `addOne`, `addMany`, `setOne`, `setMany`, `setAll`, `removeOne`, `removeMany`, `removeAll`
- Adapter selectors: `selectIds`, `selectEntities`, `selectAll`, `selectTotal`, `selectById`

### Epics & Middleware
- `combineEpics(...epics)` - Combines multiple epics into one
- `epicMiddleware(options)` - Creates the epic middleware
- `applyMiddlewares(middlewares)` - Applies middleware to the store

### React/SolidJS Integration
- `SoluxProvider` - Context provider component
- `useSolux()` - Hook to access the store

### Utilities
- `nanoid()` - Generates unique IDs

## 💡 Examples

### Todo App with Entity Adapter

```typescript
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

const todoAdapter = createEntityAdapter<Todo>({
  selectId: (todo) => todo.id,
  sortComparer: (a, b) => b.createdAt - a.createdAt
});

const todoAdded = createEvent<string>('todos/added');
const todoToggled = createEvent<string>('todos/toggled');
const todoRemoved = createEvent<string>('todos/removed');
const todosCleared = createEvent('todos/cleared');

const todosSlice = createSlice({
  initialState: todoAdapter.getInitialState(),
  handlers: (builder) =>
    builder
      .addHandler(todoAdded, (state, event) => {
        const todo: Todo = {
          id: nanoid(),
          text: event.payload,
          completed: false,
          createdAt: Date.now()
        };
        todoAdapter.addOne(state, todo);
      })
      .addHandler(todoToggled, (state, event) => {
        const todo = state.entities[event.payload];
        if (todo) {
          todoAdapter.setOne(state, {
            ...todo,
            completed: !todo.completed
          });
        }
      })
      .addHandler(todoRemoved, (state, event) => {
        todoAdapter.removeOne(state, event.payload);
      })
      .addHandler(todosCleared, (state) => {
        todoAdapter.removeAll(state);
      })
});

const store = configureStore({
  rootSlice: todosSlice
});
```

### Async Data Fetching with Epics

```typescript
const fetchUser = createEvent<string>('user/fetch');
const fetchUserSuccess = createEvent<User>('user/fetchSuccess');
const fetchUserError = createEvent<string>('user/fetchError');

const fetchUserEpic = (event$) =>
  event$.pipe(
    filter((event) => event.type === fetchUser.type),
    switchMap((event) =>
      from(api.getUser(event.payload)).pipe(
        map((user) => fetchUserSuccess(user)),
        catchError((error) => of(fetchUserError(error.message)))
      )
    )
  );

const userSlice = createSlice({
  initialState: {
    user: null,
    loading: false,
    error: null
  },
  handlers: (builder) =>
    builder
      .addHandler(fetchUser, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addHandler(fetchUserSuccess, (state, event) => {
        state.user = event.payload;
        state.loading = false;
      })
      .addHandler(fetchUserError, (state, event) => {
        state.error = event.payload;
        state.loading = false;
      })
});
```

## 🧪 Development

### Setup

```bash
# Clone the repository
git clone https://github.com/carere/solux.git
cd solux

# Install dependencies
bun install
```

### Available Scripts

```bash
# Build the library
bun run build

# Run tests
bun test

# Type checking
bun run compile

# Linting and formatting
bun run check

# Analyze bundle
bun run knip
```

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes using conventional commits (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Test updates
- `chore:` - Build process or auxiliary tool changes

## 🤝 Support

- 🐛 [Report bugs](https://github.com/carere/solux/issues)
- 💡 [Request features](https://github.com/carere/solux/issues)
- 📖 [Read the docs](https://github.com/carere/solux)
- ⭐ Star the project on GitHub!

## 📄 License

MIT © [Kevin Abatan](https://github.com/carere)

---

<div align="center">
Made with ❤️ for the SolidJS community
</div>