// pipe and flow apply their steps left to right; the limit, pipe.toml's max, is tested in the generated
// pipe.limit.test.ts.

import { describe, expect, it } from "vitest";
import { flow, pipe } from "../src/index.ts";

const inc = (n: number): number => n + 1;

describe("pipe and flow", () => {
  it("apply the steps left to right", () => {
    expect(pipe(2, inc, (n) => n * 10)).toBe(30);
    expect(flow(inc, (n: number) => n * 10)(2)).toBe(30);
  });
});
