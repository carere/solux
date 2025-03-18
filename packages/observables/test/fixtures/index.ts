import { createEvent } from ":core";
import { filter, map } from "rxjs";
import type { Epic } from "../../src/types";

//
// Events
//

export const add = createEvent<number>("add");
export const sub = createEvent<number>("sub");
export const addition = createEvent<number>("addition");
export const subtract = createEvent<number>("subtract");

export const epic1: Epic<{ res: number }> = (event$) =>
  event$.pipe(
    filter(addition.match),
    map(({ payload }) => add(payload)),
  );

export const epic2: Epic<{ res: number }> = (event$) =>
  event$.pipe(
    filter(subtract.match),
    map(({ payload }) => sub(payload)),
  );

export const epic3: Epic<{ res: number }> = (event$, state) =>
  event$.pipe(
    filter(subtract.match),
    filter(() => state.res !== -1),
    map(() => sub(0)),
  );
