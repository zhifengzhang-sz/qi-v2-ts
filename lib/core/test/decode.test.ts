// decode against Zod's own safeParse, its failure as Json, and the JSON Schema written out (STYLE.md).

import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { decode, jsonSchema } from "../src/index.ts";
import { isJson } from "./json.ts";

const Point = z.object({ name: z.string(), n: z.number().int() });

describe("decode", () => {
  it("gives the value when the schema accepts it", () => {
    expect(decode(Point)({ name: "a", n: 1 })).toEqual({ tag: "success", value: { name: "a", n: 1 } });
  });
  it("names the field that does not fit", () => {
    const r = decode(Point)({ name: 1, n: 2 });
    expect(r.tag).toBe("failure");
    if (r.tag === "failure") {
      expect(r.error.category).toBe("VALIDATION");
      expect(r.error.code).toBe("DECODE");
      expect(r.error.context.issues).toEqual([expect.objectContaining({ path: ["name"] })]);
    }
  });
  it("never throws, and agrees with safeParse on any input", () => {
    fc.assert(
      fc.property(fc.anything(), (input) => {
        const p = Point.safeParse(input);
        expect(decode(Point)(input)).toEqual(
          p.success ? { tag: "success", value: p.data } : expect.objectContaining({ tag: "failure" }),
        );
      }),
    );
  });
  it("its failure is Json", () => {
    fc.assert(
      fc.property(fc.anything(), (input) => {
        const r = decode(Point)(input);
        return r.tag === "success" || isJson(r.error);
      }),
    );
  });
  it("gives a failure, not a throw, for an async schema and for a refine that throws", () => {
    const thrower = z.string().refine(() => {
      throw new Error("the app's refine");
    });
    expect(decode(z.string().refine(async () => true))("x").tag).toBe("failure");
    const r = decode(thrower)("x");
    expect(r.tag === "failure" && [r.error.category, r.error.message]).toEqual([
      "SYSTEM",
      "the app's refine",
    ]);
  });
});

describe("jsonSchema", () => {
  it("writes the schema out", () => {
    const r = jsonSchema(Point);
    expect(r).toEqual({
      tag: "success",
      value: expect.objectContaining({
        type: "object",
        properties: { name: { type: "string" }, n: expect.objectContaining({ type: "integer" }) },
        required: ["name", "n"],
      }),
    });
  });
  it("writes a field with a default as optional on the input side, required on the output side", () => {
    const WithDefault = z.object({ k: z.number().default(1) });
    const side = (io: "input" | "output"): unknown => {
      const r = jsonSchema(WithDefault, io);
      return r.tag === "success" ? (JSON.parse(JSON.stringify(r.value)).required ?? []) : null;
    };
    expect(side("input")).toEqual([]);
    expect(side("output")).toEqual(["k"]);
  });
  it("gives a failure, not a throw, for what JSON Schema cannot say", () => {
    const r = jsonSchema(z.date());
    expect(r.tag).toBe("failure");
    if (r.tag === "failure") expect(r.error.category).toBe("SYSTEM");
  });
});
