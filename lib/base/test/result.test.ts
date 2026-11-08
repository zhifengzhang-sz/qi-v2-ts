// The laws of Result as properties: its specification (STYLE.md, The laws).

import fc from "fast-check";
import { describe, expect, it } from "vitest";
import type { Result } from "../src/index.ts";
import { error, flow, identity, pipe, result } from "../src/index.ts";
import { arbErrFn, arbFn, arbKleisli, arbResult, law } from "./arb.ts";

describe("functor laws", () => {
  it("map(identity) is identity", () => {
    fc.assert(fc.property(arbResult, (r) => law(result.map(identity)(r), r)));
  });
  it("map(g ∘ f) is map(g) ∘ map(f)", () => {
    fc.assert(
      fc.property(arbResult, arbFn, arbFn, (r, f, g) =>
        law(result.map(flow(f, g))(r), pipe(r, result.map(f), result.map(g))),
      ),
    );
  });
  it("mapError(g ∘ f) is mapError(g) ∘ mapError(f)", () => {
    fc.assert(
      fc.property(arbResult, arbErrFn, arbErrFn, (r, f, g) =>
        law(result.mapError(flow(f, g))(r), pipe(r, result.mapError(f), result.mapError(g))),
      ),
    );
  });
  it("mapError(identity) is identity", () => {
    fc.assert(fc.property(arbResult, (r) => law(result.mapError(identity)(r), r)));
  });
});

describe("monad laws", () => {
  it("left identity: flatMap(f)(success(a)) is f(a)", () => {
    fc.assert(
      fc.property(fc.integer(), arbKleisli, (a, f) => law(result.flatMap(f)(result.success(a)), f(a))),
    );
  });
  it("right identity: flatMap(success)(m) is m", () => {
    fc.assert(fc.property(arbResult, (m) => law(result.flatMap(result.success)(m), m)));
  });
  it("associativity", () => {
    fc.assert(
      fc.property(arbResult, arbKleisli, arbKleisli, (m, f, g) =>
        law(
          pipe(m, result.flatMap(f), result.flatMap(g)),
          result.flatMap((x: number) => result.flatMap(g)(f(x)))(m),
        ),
      ),
    );
  });
  it("flatten is flatMap(identity)", () => {
    fc.assert(
      fc.property(arbResult, arbKleisli, (m, f) => {
        const nested = result.map(f)(m);
        expect(result.flatten(nested)).toEqual(result.flatMap(identity<Result<number, string>>)(nested));
      }),
    );
  });
});

describe("eliminator and traversal", () => {
  it("match(success, failure) rebuilds the result", () => {
    fc.assert(
      fc.property(arbResult, (r) =>
        law(result.match<number, string, Result<number, string>>(result.success, result.failure)(r), r),
      ),
    );
  });
  it("sequence gives the first failure in order, or every value", () => {
    fc.assert(
      fc.property(fc.array(arbResult), (rs) => {
        const firstFailure = rs.find((r) => r.tag === "failure");
        const expected =
          firstFailure ?? result.success(rs.map(result.getOrElse<string, number>(() => Number.NaN)));
        expect(result.sequence(rs)).toEqual(expected);
      }),
    );
  });
  it("partition keeps every failure and every success, in order", () => {
    fc.assert(
      fc.property(fc.array(arbResult), (rs) =>
        law(result.partition(rs), {
          successes: rs.flatMap((r) => (r.tag === "success" ? [r.value] : [])),
          failures: rs.flatMap((r) => (r.tag === "failure" ? [r.error] : [])),
        }),
      ),
    );
  });
  it("ensure fails a value its predicate refuses", () => {
    expect(
      pipe(
        result.success(3),
        result.ensure(
          (n: number) => n > 5,
          (n) => `small ${n}`,
        ),
      ),
    ).toEqual(result.failure("small 3"));
  });
  it("fromNullable", () => {
    expect(result.fromNullable(() => "none")(null)).toEqual(result.failure("none"));
    expect(result.fromNullable(() => "none")(0)).toEqual(result.success(0));
  });
});

describe("the boundary", () => {
  it("tryCatch turns a throw into a QiError with a Json context", () => {
    const r = result.tryCatch(error.fromUnknown("VALIDATION"))(() => JSON.parse("{"));
    expect(r.tag).toBe("failure");
    expect(() => JSON.stringify(r)).not.toThrow();
    expect(
      result.match(
        () => "",
        (e: ReturnType<ReturnType<typeof error.fromUnknown>>) => e.category,
      )(r),
    ).toBe("VALIDATION");
  });
  it("tryCatch passes a value through", () => {
    expect(result.tryCatch(error.fromUnknown("SYSTEM"))(() => 1)).toEqual(result.success(1));
  });
});

describe("fromUnknown is total", () => {
  it("describes values that cannot be printed", () => {
    const odd = [
      Object.create(null),
      {
        toString: () => {
          throw new Error("no");
        },
      },
      { a: 1 },
      Object.assign(new Error("e"), { code: "ENOENT" }),
    ];
    const errors = odd.map(error.fromUnknown("SYSTEM"));
    expect(errors.map((e) => e.message)).toEqual(["{}", "{}", '{"a":1}', "e"]);
    expect(errors[3]?.context.code).toBe("ENOENT");
    expect(() => JSON.stringify(errors)).not.toThrow();
  });
});
