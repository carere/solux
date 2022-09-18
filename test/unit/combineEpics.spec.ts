import { describe, expect, it } from 'vitest'
import { combineEpics } from '../../src/combineEpics'
import { configureStore } from '../../src/configureStore'
import { addition, epic1, epic2, epic3, subtract } from '../fixtures'

describe('Using epics', () => {
  const store = configureStore({
    rootEpic: combineEpics(epic1, epic2, epic3),
    rootSlice: {
      getInitialState: () => ({ res: 0 }),
      handler: (state, event) => {
        switch (event.type) {
          case 'add':
            state.res += event.payload as number
            break
          case 'sub':
            state.res -= event.payload as number
        }
      },
    },
  })

  it('should handle dispatched actions', () => {
    store.dispatch(addition(2))
    store.dispatch(subtract(3))

    expect(store.getState()).toEqual({ res: -1 })
  })

  it('should handle dispatched actions', () => {
    store.dispatch(subtract(9))
    store.dispatch(addition(10))

    expect(store.getState()).toEqual({ res: 0 })
  })
})
