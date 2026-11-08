// A contract's vectors checked against its schema, and core's own contracts: the log's level and line.

import { describe, expect, it } from "vitest";
import { z } from "zod";
import { type Contract, contract, jsonSchema, log } from "../src/index.ts";

const Point = z.object({ name: z.string(), n: z.number().int() });

const point: Contract<typeof Point> = {
  name: "point",
  schema: Point,
  vectors: { accept: [{ name: "a", n: 1 }], reject: [{ name: "a" }, { name: "a", n: 1.5 }, null] },
};

describe("contract.verify", () => {
  it("passes a contract whose schema agrees with its vectors", () => {
    expect(contract.verify(point)).toEqual({ tag: "success", value: point });
  });
  it("names, by index, each vector on the wrong side", () => {
    const r = contract.verify({
      ...point,
      vectors: { accept: [{ name: "a", n: 1 }, { name: "a" }], reject: [null, { name: "b", n: 2 }] },
    });
    expect(r.tag).toBe("failure");
    if (r.tag === "failure") {
      expect(r.error.code).toBe("CONTRACT");
      expect(r.error.context).toEqual({ name: "point", wrongAccept: [1], wrongReject: [1] });
    }
  });
  it.each<Contract<z.ZodType>>([
    log.levelContract,
    log.entryContract,
  ])("passes core's contract: $name", (c) => {
    expect(contract.verify(c).tag).toBe("success");
    expect(jsonSchema(c.schema).tag).toBe("success");
  });
  it("counts a vector the schema throws on as wrong, on either side", () => {
    const thrower = z.string().refine((s) => {
      if (s === "") throw new Error("undecided");
      return true;
    });
    const r = contract.verify({
      name: "thrower",
      schema: thrower,
      vectors: { accept: ["a", ""], reject: [""] },
    });
    expect(r.tag === "failure" && r.error.context).toEqual({
      name: "thrower",
      wrongAccept: [1],
      wrongReject: [0],
    });
  });
});
