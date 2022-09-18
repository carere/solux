import { describe, expect, it } from 'vitest'
import { configureStore } from '../../src/configureStore'
import { Event } from '../../src/types'

describe('Subscribing to store', () => {
  const store = configureStore({
    rootSlice: {
      getInitialState: () => ({ magic: 0 }),
      handler: (state, event: Event<number>) => {
        state.magic = event.payload
      },
    },
  })

  store.dispatch({ type: 'make_magic', payload: 42 })

  it('should notify listener with the last state and dispatched action', () => {
    store.subscribe(({ state, type }) => {
      expect(state.magic).toEqual(42)
      expect(type).toEqual('make_magic')
    })
  })
})
