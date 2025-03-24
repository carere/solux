import { createEvent } from "@carere/solux";

export const incrementMagic = createEvent<number>("incrementMagic");
export const decrementMagic = createEvent<number>("decrementMagic");
