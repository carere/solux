import { type Context, type ParentProps, createContext, useContext } from "solid-js";
import type { Store } from "./types";

const StoreContext = createContext<Store<unknown>>();

/**
 * A provider is meant to wrap a component's tree in order
 * to be able to access the provider's contained value anywhere
 * in the tree.
 *
 * @param props An object containing the store used in the provider
 * @returns the provider created with the store passed as argument
 */
export function SoluxProvider<S>(props: ParentProps<{ store: Store<S> }>) {
  return <StoreContext.Provider value={props.store}>{props.children}</StoreContext.Provider>;
}

/**
 * A helper (or hook in react world) used to access the store
 * in any component.
 *
 * @template S The type of the store contained in the provider
 * @returns the store passed to `<SoluxProvider store={...} />`
 */
export function useSolux<S>() {
  return useContext(StoreContext as Context<Store<S>>);
}
