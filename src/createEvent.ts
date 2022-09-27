import type { Event, EventCreator, PrepareCallback } from './types'

/**
 * A utility function to create an event creator for the given event type
 * string. The event creator accepts a single argument, which will be included
 * in the event object as a field called payload. The event creator function
 * will also have a `type` property which equals to the `name` parameter passed
 * during the creation, and a `match` method which can be used in order to check
 * if an event is produced by the return event creator
 *
 * @param name The event type to use for created events.
 * @param options (optional) a method that takes an object and returns { payload, meta? }.
 *                If this is given, the resulting event creator will pass its arguments to this method to calculate payload.
 * @template P The type of the `payload` attribute of the created events
 * @template V The type of the argument used to `prepare` the payload
 *
 * @returns An event creator
 */
export const createEvent = <P, M = undefined, V = undefined>(
  name: string,
  options: Partial<{
    prepare: PrepareCallback<P, M, V>
  }> = {},
) => {
  const creator: EventCreator<P, M, V> = (value?) => {
    if (options.prepare) {
      const prepared = options.prepare(value as V)

      if (!('meta' in prepared) && !('payload' in prepared))
        throw Error(`
          Event creator's prepared callback for event '${name}' did not return an object
          containing either 'payload' or 'meta' field.
          If so, you should use createEvent by specifying the type of the payload as a
          generic: createEvent<YourTypeHere>()
          You may read the docs about event & event creator for further information
        `)

      return {
        type: name,
        ...('meta' in prepared && { meta: prepared.meta }),
        ...('payload' in prepared && { payload: prepared.payload }),
      }
    }

    return { type: name, payload: value as P }
  }

  creator.type = name
  creator.match = (event: Event<P>) => event.type === name

  return creator
}
