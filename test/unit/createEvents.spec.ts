import { describe, expect, it } from "bun:test";
import { createEvent } from "../../src/createEvent";

describe("Creating an event", () => {
  it("should contain a property type with the name of the type", () => {
    const creator = createEvent("someDomain");

    expect(creator.type).toEqual("someDomain");
  });

  describe("and matching against another event", () => {
    const creator = createEvent("someDomain");

    it("should indicate if the event type is the same", () => {
      expect(creator.match({ type: "someDomain" })).toBeTruthy();
    });

    it("should indicate if the event type is not the same", () => {
      expect(creator.match({ type: "other" })).toBeFalsy();
    });
  });

  describe("without payload", () => {
    const creator = createEvent("someDomain");

    it("should construct an event without payload", () => {
      expect(creator()).toEqual({ type: "someDomain", payload: undefined });
    });
  });

  describe("with a payload", () => {
    const creator = createEvent<number>("someDomain");

    it("should construct an event without payload", () => {
      expect(creator(42)).toEqual({ type: "someDomain", payload: 42 });
    });
  });

  describe("with options", () => {
    it("should be able to construct an event with prepared payload", () => {
      const creator = createEvent("someDomain", (value: string) => ({
        payload: { depth: Number.parseInt(value) },
      }));

      expect(creator("42")).toEqual({ type: "someDomain", payload: { depth: 42 } });
    });
  });
});
