//
// Entities
//

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

//
// Events
//

export const add = createEvent<number>("add");
export const sub = createEvent<number>("sub");
export const addition = createEvent<number>("addition");
export const subtract = createEvent<number>("subtract");
