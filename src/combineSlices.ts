import type { Slice, SlicesMapObject, StateFromSlicesMapObject } from './types'

/**
 * Turns an object whose values are different slices object, into a single
 * slice object. The resulting slice `handler()` function will loop over
 * every child handler which may update the state. The resulting slice
 * `getInitialState()` will merge every initial child state into a single one
 * , whose keys correspond to the keys of the passed slice object.
 *
 * @template S Combined state object type.
 *
 * @param slices An object whose values correspond to different slice
 *   objects that need to be combined into one.
 *
 * @returns A slice object that invokes every slice handler inside the passed
 *   object, and builds a state object with the same shape.
 */
export const combineSlices = <S>(
  slices: SlicesMapObject<S>,
): Slice<StateFromSlicesMapObject<SlicesMapObject<S>>> => {
  let initialState: StateFromSlicesMapObject<typeof slices>
  const sliceKeys = Object.keys(slices) as Array<keyof typeof slices>

  return {
    getInitialState: () =>
      sliceKeys.reduce(
        (acc, curr) => ({ ...acc, [curr]: slices[curr].getInitialState() }),
        initialState,
      ),
    handler: (state, event) =>
      sliceKeys.forEach(key => slices[key].handler(state[key] as S[keyof S], event)),
  }
}
