// The arbitraries and the law helper the tests share.

import fc from "fast-check";
import { expect } from "vitest";
import type { Result, Task } from "../src/index.ts";
import { result, task } from "../src/index.ts";

// A property must return true or nothing; returning a matcher's own value failed every law here (2026-10-15).
export const law = <T>(actual: T, expected: T): true => {
  expect(actual).toEqual(expected);
  return true;
};

export const same = async <T, E>(a: Task<T, E>, b: Task<T, E>): Promise<true> => {
  expect(await task.run(a)).toEqual(await task.run(b));
  return true;
};

export const arbResult: fc.Arbitrary<Result<number, string>> = fc.oneof(
  fc.integer().map((n) => result.success(n)),
  fc.string().map((s) => result.failure(s)),
);
export const arbFn = fc.func<[number], number>(fc.integer());
export const arbErrFn = fc.func<[string], string>(fc.string());
export const arbKleisli: fc.Arbitrary<(n: number) => Result<number, string>> = fc.func(arbResult);
export const arbTask: fc.Arbitrary<Task<number, string>> = arbResult.map(task.fromResult);
export const arbTaskKleisli: fc.Arbitrary<(n: number) => Task<number, string>> = fc.func(arbTask);
