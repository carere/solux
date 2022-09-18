import { describe, expect, it } from 'vitest'
import { createEvent } from '../../src/createEvent'
import { createSlice } from '../../src/createSlice'

describe('Creating slice', () => {
  const someEvent = createEvent<number>('someEvent')

  describe('when specifying unique handler', () => {
    const slice = createSlice({
      initialState: { magic: 0 },
      handlers: builder =>
        builder.addHandler(someEvent, (state, { payload }) => {
          state.magic = payload
        }),
    })

    it('should be able to return initial state', () => {
      expect(slice.getInitialState()).toEqual({ magic: 0 })
    })

    it('should produce an handler', () => {
      expect(slice.handler).toBeTypeOf('function')
    })

    it('should be able to update a state with its handler', () => {
      const state = { magic: 23 }

      slice.handler(state, someEvent(42))

      expect(state).toEqual({ magic: 42 })
    })
  })
})
