<div align="center">
  <a href="https://github.com/carere/solux">
    <img src="images/solux.svg" alt="Solux Logo" width="20%">
  </a>

  <h1 style="font-size: 3rem; font-weight: 600;">Solux</h1>

  <p align="center">
    Flux implementation based on SolidJs reactivity
    <br />
    <a href="https://github.com/carere/solux/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/carere/solux/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>

[![Quality Assurance](https://github.com/carere/solux/actions/workflows/quality-assurance.yml/badge.svg)](https://github.com/carere/solux/actions/workflows/quality-assurance.yml)
</div>

  
  # 

Solux is a comprehensive state management library for [SolidJS](https://www.solidjs.com/) applications that brings the battle-tested patterns of Flux to SolidJS's reactive ecosystem. If you're building highly dynamic applications like design tools, dashboards, or complex SPAs, Solux provides the predictable state management you need with the performance benefits of SolidJS's fine-grained reactivity.

## Table of Contents

- [Why Solux?](#why-solux)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
  - [Store](#store)
  - [Slices](#slices)
  - [Events](#events)
  - [Handlers](#handlers)
  - [Entity Adapter](#entity-adapter)
  - [Epics](#epics)
- [API Reference](#api-reference)
- [Examples](#examples)
  - [TodoMVC](#todomvc)
  - [Advanced Patterns](#advanced-patterns)
- [TypeScript Support](#typescript-support)
- [DevTools Integration](#devtools-integration)
- [Contributing](#contributing)
- [License](#license)

## Why Solux?

### The state management for SolidJS

The SolidJS ecosystem lacks a mature state management solution. Developers building complex SolidJS applications need proven patterns with the benefits of SolidJS's fine-grained reactivity.

### The Solux Solution

Solux is built specifically for SolidJS's reactive system from the ground up. It provides:

- **Familiar Redux patterns** - If you know Redux, you already know 80% of Solux
- **Fine-grained reactivity** - Only the components that need to update will update
- **Full TypeScript support** - Complete type inference for events, handlers, and state
- **Redux DevTools integration** - Time-travel debugging and state inspection
- **Built-in entity management** - Normalize your data without the boilerplate
- **Epic middleware** - Handle complex async flows with RxJS

## When to Use Solux

✅ **Use Solux when you:**
- Build complex, stateful applications (like Figma, Notion, or complex dashboards)
- Need predictable state management with time-travel debugging
- Want to share state across many components
- Have complex async operations or side effects
- Work in a team that needs clear state management patterns

❌ **You might not need Solux if you:**
- Build simple applications with minimal state
- Only need local component state
- Want the smallest possible bundle size

## Installation

```bash
# npm
npm install @carere/solux

# bun
bun add @carere/solux
```

## Quick Start

Here's a complete counter example to get you started in under 50 lines:

```tsx
import { createEvent, createSlice, combineSlices, configureStore } from '@carere/solux';
import { SoluxProvider, useSolux } from '@carere/solux';
import { render } from 'solid-js/web';

// 1. Create events (actions in Redux terminology)
const increment = createEvent<number>('counter/increment');
const decrement = createEvent<number>('counter/decrement');
const reset = createEvent('counter/reset');

// 2. Create a slice with handlers
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

// 3. Configure the store
const store = configureStore({
  rootSlice: combineSlices({
    counter: counterSlice,
  }),
});

// 4. Use in your component with destructuring
function Counter() {
  const { state, dispatch } = useSolux();
  
  return (
    <div>
      <h1>Count: {state.counter.value}</h1>
      <button onClick={() => dispatch(increment(1))}>+1</button>
      <button onClick={() => dispatch(decrement(1))}>-1</button>
      <button onClick={() => dispatch(reset())}>Reset</button>
    </div>
  );
}

// 5. Wrap your app with the provider
render(
  () => (
    <SoluxProvider store={store}>
      <Counter />
    </SoluxProvider>
  ),
  document.getElementById('root')!
);
```

### DevTools Setup

To enable Redux DevTools:

```ts
import { configureStore, applyMiddlewares, devtools } from '@carere/solux';

const store = configureStore({
  rootSlice: combineSlices({ /* your slices */ }),
  enhancers: [
    devtools({ 
      name: 'My App',
      instanceId: 'main' 
    })
  ],
});
```

## Core Concepts

### Store

The store holds your entire application state and provides methods to dispatch events and subscribe to changes.

```ts
const store = configureStore({
  rootSlice: combineSlices({
    user: userSlice,
    posts: postsSlice,
    settings: settingsSlice,
  }),
  preloadedState: { /* optional initial state */ },
  enhancers: [ /* middleware and devtools */ ],
});

// Access state
console.log(store.state.user);

// Dispatch events
store.dispatch(loginSuccess({ id: 1, name: 'John' }));

// Subscribe to all changes
const unsubscribe = store.subscribe(({ state, event }) => {
  console.log('State changed:', state);
  console.log('Due to event:', event);
});

// Subscribe to specific events
store.subscribeToEvent(loginSuccess, ({ state, event }) => {
  console.log('User logged in:', event.payload);
});
```

### Slices

Slices are modular units of state with their own handlers. Think of them as reducers with built-in action creators.

```ts
const userSlice = createSlice({
  initialState: {
    currentUser: null,
    isLoading: false,
    error: null,
  },
  handlers: (builder) =>
    builder
      .addHandler(loginRequest, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addHandler(loginSuccess, (state, { payload }) => {
        state.currentUser = payload;
        state.isLoading = false;
      })
      .addHandler(loginFailure, (state, { payload }) => {
        state.error = payload;
        state.isLoading = false;
      }),
});
```

### Events

Events are type-safe action creators. They're the only way to trigger state changes.

```ts
// Simple event without payload
const logout = createEvent('user/logout');

// Event with payload
const updateProfile = createEvent<{ name: string; email: string }>('user/updateProfile');

// Event with payload preparation
const addTodo = createEvent('todos/add', (text: string) => ({
  payload: {
    id: nanoid(),
    text,
    completed: false,
    createdAt: Date.now(),
  },
}));

// Usage
store.dispatch(logout());
store.dispatch(updateProfile({ name: 'Jane', email: 'jane@example.com' }));
store.dispatch(addTodo('Learn Solux')); // Automatically generates ID and timestamp
```

### Handlers

Handlers process events and update state. Thanks to SolidJS's `produce`, you can write mutable updates for simplicity:

```ts
const todosSlice = createSlice({
  initialState: { items: [] },
  handlers: (builder) =>
    builder
      // Mutable update (powered by produce)
      .addHandler(addTodo, (state, { payload }) => {
        state.items.push(payload);
      })
      // You can also return a new state if preferred
      .addHandler(clearCompleted, (state) => ({
        items: state.items.filter(todo => !todo.completed)
      }))
      // Handle multiple events with the same handler
      .addHandler(reset, () => ({ items: [] }))
      .addHandler(logout, () => ({ items: [] })),
});
```

### Entity Adapter

The entity adapter provides a standardized way to manage normalized data:

```ts
interface Post {
  id: string;
  title: string;
  authorId: string;
}

const postsAdapter = createEntityAdapter<Post>({
  selectId: (post) => post.id,
  sortComparer: (a, b) => b.createdAt - a.createdAt, // Optional
});

const postsSlice = createSlice({
  initialState: postsAdapter.getInitialState({
    // Additional state
    isLoading: false,
  }),
  handlers: (builder) =>
    builder
      .addHandler(fetchPostsSuccess, (state, { payload }) => {
        postsAdapter.setAll(state, payload);
        state.isLoading = false;
      })
      .addHandler(addPost, (state, { payload }) => {
        postsAdapter.addOne(state, payload);
      })
      .addHandler(updatePost, (state, { payload }) => {
        const { id, ...changes } = payload;
        const post = state.entities[id];
        if (post) Object.assign(post, changes);
      })
      .addHandler(deletePost, (state, { payload }) => {
        postsAdapter.removeOne(state, payload);
      }),
});

// Selectors
const selectors = postsAdapter.getSelectors<RootState>(
  (state) => state.posts
);

// Usage in components
const allPosts = selectors.selectAll(store.state);
const postCount = selectors.selectTotal(store.state);
const postById = selectors.selectById(store.state, 'post-1');
```

### Epics

Epics handle complex async operations using RxJS observables:

```ts
import { combineEpics, epicMiddleware } from '@carere/solux';
import { filter, map, switchMap, catchError } from 'rxjs/operators';
import { from, of } from 'rxjs';

const loginEpic = (event$, state$) =>
  event$.pipe(
    filter(loginRequest.match),
    switchMap(({ payload }) =>
      from(api.login(payload)).pipe(
        map(user => loginSuccess(user)),
        catchError(error => of(loginFailure(error.message)))
      )
    )
  );

const rootEpic = combineEpics(loginEpic, logoutEpic, /* more epics */);

const store = configureStore({
  rootSlice: /* ... */,
  enhancers: [
    applyMiddlewares([
      epicMiddleware({ rootEpic })
    ])
  ],
});
```

## API Reference

### Core APIs

#### `configureStore(options)`
Creates and configures a Solux store.

```ts
const store = configureStore({
  rootSlice: Slice,           // Required: Root slice or combined slices
  preloadedState?: State,     // Optional: Initial state
  enhancers?: Enhancer[],     // Optional: Middleware and devtools
});
```

#### `combineSlices(slices)`
Combines multiple slices into a single root slice.

```ts
const rootSlice = combineSlices({
  user: userSlice,
  posts: postsSlice,
  [dynamicKey]: dynamicSlice,
});
```

### Slice APIs

#### `createSlice(options)`
Creates a slice with handlers and optional selectors.

```ts
const slice = createSlice({
  initialState: State,
  handlers: (builder) => builder.addHandler(...),
});
```

### Event APIs

#### `createEvent(type, preparePayload?)`
Creates a type-safe event creator.

```ts
const event = createEvent<PayloadType>('event/type');
const eventWithPrepare = createEvent('event/type', (arg) => ({
  payload: transformArg(arg),
  meta: { timestamp: Date.now() }
}));
```

### Entity Adapter APIs

#### `createEntityAdapter(options)`
Creates an entity adapter for normalized state management.

```ts
const adapter = createEntityAdapter<Entity>({
  selectId: (entity) => entity.id,
  sortComparer?: (a, b) => a.order - b.order,
});

// Adapter methods
adapter.getInitialState(extraState?)
adapter.addOne(state, entity)
adapter.addMany(state, entities)
adapter.setOne(state, entity)
adapter.setMany(state, entities)
adapter.setAll(state, entities)
adapter.removeOne(state, id)
adapter.removeMany(state, ids)
adapter.removeAll(state)

// Selectors
const selectors = adapter.getSelectors(selectState);
selectors.selectIds(state)
selectors.selectEntities(state)
selectors.selectAll(state)
selectors.selectTotal(state)
selectors.selectById(state, id)
```

### Epic APIs

#### `combineEpics(...epics)`
Combines multiple epics into a root epic.

```ts
const rootEpic = combineEpics(epic1, epic2, epic3);
```

#### `epicMiddleware(options)`
Creates middleware for handling epics.

```ts
const middleware = epicMiddleware({
  rootEpic: Epic,
  container?: Dependencies,
});
```

### Context APIs

#### `SoluxProvider`
Provides store to the component tree.

```tsx
<SoluxProvider store={store}>
  <App />
</SoluxProvider>
```

#### `useSolux()`
Hook to access store in components.

```tsx
const { state, dispatch } = useSolux();
```

## Examples

### TodoMVC

A complete TodoMVC implementation showcasing CRUD operations, filtering, and persistence:

```tsx
import { createEvent, createSlice, createEntityAdapter, combineSlices, configureStore } from '@carere/solux';
import { SoluxProvider, useSolux } from '@carere/solux';
import { createMemo, For, Show } from 'solid-js';

// Types
interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

type FilterType = 'all' | 'active' | 'completed';

// Entity Adapter
const todosAdapter = createEntityAdapter<Todo>({
  selectId: (todo) => todo.id,
});

// Events
const addTodo = createEvent('todos/add', (text: string) => ({
  payload: { id: nanoid(), text, completed: false }
}));
const toggleTodo = createEvent<string>('todos/toggle');
const deleteTodo = createEvent<string>('todos/delete');
const editTodo = createEvent<{ id: string; text: string }>('todos/edit');
const clearCompleted = createEvent('todos/clearCompleted');
const setFilter = createEvent<FilterType>('filter/set');

// Slices
const todosSlice = createSlice({
  initialState: todosAdapter.getInitialState(),
  handlers: (builder) =>
    builder
      .addHandler(addTodo, (state, { payload }) => {
        todosAdapter.addOne(state, payload);
      })
      .addHandler(toggleTodo, (state, { payload }) => {
        const todo = state.entities[payload];
        if (todo) todo.completed = !todo.completed;
      })
      .addHandler(deleteTodo, (state, { payload }) => {
        todosAdapter.removeOne(state, payload);
      })
      .addHandler(editTodo, (state, { payload }) => {
        const todo = state.entities[payload.id];
        if (todo) todo.text = payload.text;
      })
      .addHandler(clearCompleted, (state) => {
        const completedIds = state.ids.filter(
          id => state.entities[id]?.completed
        );
        todosAdapter.removeMany(state, completedIds);
      }),
});

const filterSlice = createSlice({
  initialState: 'all' as FilterType,
  handlers: (builder) =>
    builder.addHandler(setFilter, (_, { payload }) => payload),
});

// Store with persistence
const store = configureStore({
  rootSlice: combineSlices({
    todos: todosSlice,
    filter: filterSlice,
  }),
  enhancers: [
    // Add persistence middleware
    applyMiddlewares([
      (api) => (next) => (event) => {
        next(event);
        localStorage.setItem('todos-solux', JSON.stringify(api.state));
      }
    ])
  ],
});

// Components
function TodoApp() {
  const { state, dispatch } = useSolux();
  
  const selectors = todosAdapter.getSelectors((s) => s.todos);
  
  const filteredTodos = createMemo(() => {
    const allTodos = selectors.selectAll(state);
    switch (state.filter) {
      case 'active':
        return allTodos.filter(t => !t.completed);
      case 'completed':
        return allTodos.filter(t => t.completed);
      default:
        return allTodos;
    }
  });
  
  const stats = createMemo(() => {
    const all = selectors.selectAll(state);
    return {
      total: all.length,
      active: all.filter(t => !t.completed).length,
      completed: all.filter(t => t.completed).length,
    };
  });
  
  return (
    <div class="todoapp">
      <header>
        <h1>todos</h1>
        <input
          class="new-todo"
          placeholder="What needs to be done?"
          onKeyPress={(e) => {
            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
              dispatch(addTodo(e.currentTarget.value));
              e.currentTarget.value = '';
            }
          }}
        />
      </header>
      
      <section class="main">
        <For each={filteredTodos()}>
          {(todo) => (
            <div class="todo-item">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => dispatch(toggleTodo(todo.id))}
              />
              <span class={todo.completed ? 'completed' : ''}>
                {todo.text}
              </span>
              <button onClick={() => dispatch(deleteTodo(todo.id))}>
                ×
              </button>
            </div>
          )}
        </For>
      </section>
      
      <footer>
        <span>{stats().active} items left</span>
        <div class="filters">
          <For each={['all', 'active', 'completed'] as FilterType[]}>
            {(filter) => (
              <button
                class={state.filter === filter ? 'selected' : ''}
                onClick={() => dispatch(setFilter(filter))}
              >
                {filter}
              </button>
            )}
          </For>
        </div>
        <Show when={stats().completed > 0}>
          <button onClick={() => dispatch(clearCompleted())}>
            Clear completed
          </button>
        </Show>
      </footer>
    </div>
  );
}
```

### Advanced Patterns

#### Async Data Fetching with Epics

```ts
import { filter, switchMap, map, catchError, withLatestFrom } from 'rxjs/operators';
import { from, of } from 'rxjs';

const fetchUserEpic = (event$, state$) =>
  event$.pipe(
    filter(fetchUserRequest.match),
    withLatestFrom(state$),
    switchMap(([event, state]) =>
      from(api.fetchUser(event.payload)).pipe(
        map(user => fetchUserSuccess(user)),
        catchError(error => of(fetchUserFailure(error.message)))
      )
    )
  );

const fetchUserPostsEpic = (event$, state$) =>
  event$.pipe(
    filter(fetchUserSuccess.match),
    switchMap(({ payload: user }) =>
      from(api.fetchPosts(user.id)).pipe(
        map(posts => fetchPostsSuccess(posts)),
        catchError(error => of(fetchPostsFailure(error.message)))
      )
    )
  );
```

#### Entity Normalization

```ts
// Normalize nested data structures
const normalizeData = (data) => {
  const users = {};
  const posts = {};
  const comments = {};
  
  data.users.forEach(user => {
    users[user.id] = { ...user, posts: user.posts.map(p => p.id) };
    
    user.posts.forEach(post => {
      posts[post.id] = { ...post, comments: post.comments.map(c => c.id) };
      
      post.comments.forEach(comment => {
        comments[comment.id] = comment;
      });
    });
  });
  
  return { users, posts, comments };
};

// Use in slice
.addHandler(fetchDataSuccess, (state, { payload }) => {
  const normalized = normalizeData(payload);
  usersAdapter.setAll(state.users, Object.values(normalized.users));
  postsAdapter.setAll(state.posts, Object.values(normalized.posts));
  commentsAdapter.setAll(state.comments, Object.values(normalized.comments));
})
```

#### Computed Values with createMemo

```ts
function Dashboard() {
  const { state } = useSolux();
  
  // Expensive computation only runs when dependencies change
  const statistics = createMemo(() => {
    const posts = postsSelectors.selectAll(state);
    return {
      total: posts.length,
      published: posts.filter(p => p.status === 'published').length,
      draft: posts.filter(p => p.status === 'draft').length,
      avgLength: posts.reduce((acc, p) => acc + p.content.length, 0) / posts.length,
    };
  });
  
  return (
    <div>
      <h2>Statistics</h2>
      <p>Total posts: {statistics().total}</p>
      <p>Published: {statistics().published}</p>
      <p>Drafts: {statistics().draft}</p>
      <p>Average length: {statistics().avgLength.toFixed(0)} characters</p>
    </div>
  );
}
```

#### Testing Strategies

```ts
import { describe, it, expect, beforeEach } from 'bun:test';

describe('User Slice', () => {
  let store;
  
  beforeEach(() => {
    store = configureStore({
      rootSlice: combineSlices({ user: userSlice }),
    });
  });
  
  it('should handle login flow', () => {
    // Initial state
    expect(store.state.user.isLoading).toBe(false);
    expect(store.state.user.currentUser).toBeNull();
    
    // Dispatch login request
    store.dispatch(loginRequest({ email: 'test@example.com', password: 'password' }));
    expect(store.state.user.isLoading).toBe(true);
    
    // Dispatch login success
    const user = { id: 1, email: 'test@example.com', name: 'Test User' };
    store.dispatch(loginSuccess(user));
    expect(store.state.user.isLoading).toBe(false);
    expect(store.state.user.currentUser).toEqual(user);
    
    // Dispatch logout
    store.dispatch(logout());
    expect(store.state.user.currentUser).toBeNull();
  });
  
  it('should handle login failure', () => {
    store.dispatch(loginRequest({ email: 'test@example.com', password: 'wrong' }));
    store.dispatch(loginFailure('Invalid credentials'));
    
    expect(store.state.user.isLoading).toBe(false);
    expect(store.state.user.error).toBe('Invalid credentials');
    expect(store.state.user.currentUser).toBeNull();
  });
});
```

## TypeScript Support

Solux is written in TypeScript and provides complete type safety:

```ts
// Type your state
interface RootState {
  user: UserState;
  posts: EntityState<Post>;
  settings: SettingsState;
}

// Events are fully typed
const updateUser = createEvent<Partial<User>>('user/update');

// Handlers have type inference
createSlice({
  initialState: { count: 0 },
  handlers: (builder) =>
    builder.addHandler(increment, (state, event) => {
      // state is typed as { count: number }
      // event is typed as { type: string; payload: number }
      state.count += event.payload;
    })
});

// Selectors are typed
const selectPosts = (state: RootState) => state.posts;
const posts: Post[] = postsSelectors.selectAll(store.state);
```

## DevTools Integration

Solux integrates seamlessly with Redux DevTools:

1. Install the [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools)
2. Configure your store:

```ts
import { devtools } from '@carere/solux';

const store = configureStore({
  rootSlice: rootSlice,
  enhancers: [
    devtools({
      name: 'My Solux App',
      instanceId: 'main',
      trace: true,
      traceLimit: 25,
    })
  ],
});
```

Features supported:
- ✅ Action history
- ✅ State inspection
- ✅ Time-travel debugging
- ✅ Action dispatching
- ✅ State import/export
- ✅ Jump to state

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT © Kevin Abatan

---

Built with ❤️ for the SolidJS community