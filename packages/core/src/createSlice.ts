import type { createEvent } from "./createEvent";
import type { Event, EventHandlerMapBuilder, Handler, Slice, SliceOption } from "./types";

/**
 * A utility function that allows defining an handler as a mapping from event
 * type to handler function that handle these event types.
 *
 * @param builderCallback The callback used to define the handlers
 * @template S The type of the state handled by this handler
 * @returns An handler which can handler any numbers of event's type
 */
export const createHandler = <S>(builderCallback: SliceOption<S>["handlers"]): Handler<S> => {
  const eventsMap: Record<string, Handler<S, ReturnType<typeof createEvent>>> = {};

  const builder: EventHandlerMapBuilder<S> = {
    addHandler: (eventCreator, handler) => {
      eventsMap[eventCreator.type] = handler;
      return builder;
    },
  };

  builderCallback(builder);

  return (state: S, event: Event) => {
    const handlers = [eventsMap[event.type]];

    for (const handler of handlers) {
      if (handler) handler(state, event);
    }
  };
};

/**
 * A function that accepts an initial state and an object full of handlers
 * functions, and generate a slice
 *
 * The `handlers` argument is passed to `createHandler()`.
 *
 * @template S The type of the state handled by the slice.
 */
export const createSlice = <S>({ initialState, handlers }: SliceOption<S>): Slice<S> => ({
  getInitialState: () => initialState,
  handler: createHandler(handlers),
});
