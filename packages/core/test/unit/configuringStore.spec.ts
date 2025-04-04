import { describe, expect, it } from "bun:test";
import { configureStore } from "../../src/configureStore";

describe("A store configured", () => {
  describe("with a root slice", () => {
    describe("and with a preloaded state", () => {
      const store = configureStore({
        rootSlice: {
          getInitialState: () => ({ magic: 0 }),
          handler: () => console.log(),
        },
        preloadedState: { magic: 999 },
      });

      it("should initialize with preloaded state", () => {
        expect(store.state).toEqual({ magic: 999 });
      });

      it("should not initialize with the rootSlice's state", () => {
        expect(store.state).not.toEqual({ magic: 0 });
      });
    });

    describe("and without a preloaded state", () => {
      const store = configureStore({
        rootSlice: {
          getInitialState: () => ({ magic: 0 }),
          handler: () => console.log(),
        },
      });

      it("should initialize with rootSlice's state", () => {
        expect(store.state).toEqual({ magic: 0 });
      });
    });
  });

  describe("without a root slice", () => {
    describe("and with a preloaded state", () => {
      it("should alert user that it is forbidden", () => {
        const regexp =
          /You may read the docs in order to understand how to use Solux and its architecture./gm;
        expect(() => configureStore({ preloadedState: { a: 0 } })).toThrowError(regexp);
      });
    });

    describe("and without a rootEpic", () => {
      it("should alert user that it is forbidden", () => {
        const regexp =
          /You may read the docs in order to understand how to use Solux and its architecture./gm;
        expect(() => configureStore({})).toThrowError(regexp);
      });
    });
  });
});
