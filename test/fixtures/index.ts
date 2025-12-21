import { filter, map } from "rxjs";
import type { Epic } from "../../src";
import { createEvent } from "../../src/createEvent";

export type Person = {
  id: string;
  name: string;
};

export const jean: Person = {
  id: "1",
  name: "Jean",
};

export const jean2: Person = {
  id: "1",
  name: "Jean2",
};

export const charles: Person = {
  id: "2",
  name: "Charles",
};

export const bob: Person = {
  id: "3",
  name: "Bob",
};

export const john: Person = {
  id: "5",
  name: "John",
};

export const john2: Person = {
  id: "5",
  name: "John2",
};

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
