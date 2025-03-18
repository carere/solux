import type { Observable } from "rxjs";

/**
 * An epic is the only way to make asynchronous tasks in Solux, it takes
 * a stream of events, the state and some dependencies as parameters and
 * return a stream of events.
 *
 * Several recipes are available on the docs to grasp all the power of Epics
 * and why we promote those instead of conventional Promise / async - await
 *
 * @template State The type of the state of the store.
 * @template Container The type of the dependencies injected on the store
 * @template Input The type of the event passed as input
 * @template Output The type of the event passed as output
 */
export type Epic<
  State = undefined,
  Container = undefined,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  Input extends Event = any,
  Output extends Input = Input,
> = (
  event$: Observable<Input>,
  state: Readonly<State>,
  container: Readonly<Container>,
) => Observable<Output>;
