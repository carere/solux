import { merge } from "rxjs";
import type { Epic } from "./types";

/**
 * Merge all epics into one, using the creation operator from RXJS
 * `merge(...)`
 *
 * @param epics Epics to be merge into one
 * @template S The type of the state variable passed to epic
 * @template C The type of the container variable passed to epic
 */
export const combineEpics =
  <S, C>(...epics: Epic<S, C>[]): Epic<S, C> =>
  (...args: Parameters<Epic<S, C>>) =>
    merge(...epics.map((epic) => epic(...args)));
