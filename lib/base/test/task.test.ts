// The laws of Task, by running both sides (dev/ts/STYLE.md, The laws), and its boundary.

import fc from "fast-check";
import { describe, expect, it } from "vitest";
import type { Task } from "../src/index.ts";
import { error, flow, identity, pipe, result, task } from "../src/index.ts";
import { arbErrFn, arbFn, arbTaskKleisli as arbKleisli, arbResult, arbTask, same } from "./arb.ts";

describe("Task laws", () => {
  it("map(identity) is identity", async () => {
    await fc.assert(fc.asyncProperty(arbTask, (t) => same(task.map(identity)(t), t)));
  });
  it("map(g ∘ f) is map(g) ∘ map(f)", async () => {
    await fc.assert(
      fc.asyncProperty(arbTask, arbFn, arbFn, (t, f, g) =>
        same(task.map(flow(f, g))(t), pipe(t, task.map(f), task.map(g))),
      ),
    );
  });
  it("mapError(g ∘ f) is mapError(g) ∘ mapError(f)", async () => {
    await fc.assert(
      fc.asyncProperty(arbTask, arbErrFn, arbErrFn, (t, f, g) =>
        same(task.mapError(flow(f, g))(t), pipe(t, task.mapError(f), task.mapError(g))),
      ),
    );
  });
  it("left identity", async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer(), arbKleisli, (a, f) => same(task.flatMap(f)(task.of(a)), f(a))),
    );
  });
  it("right identity", async () => {
    await fc.assert(fc.asyncProperty(arbTask, (m) => same(task.flatMap(task.of)(m), m)));
  });
  it("associativity", async () => {
    await fc.assert(
      fc.asyncProperty(arbTask, arbKleisli, arbKleisli, (m, f, g) =>
        same(
          pipe(m, task.flatMap(f), task.flatMap(g)),
          task.flatMap((x: number) => task.flatMap(g)(f(x)))(m),
        ),
      ),
    );
  });
  it("sequence and all agree with result.sequence", async () => {
    await fc.assert(
      fc.asyncProperty(fc.array(arbResult), async (rs) => {
        const ts = rs.map(task.fromResult);
        expect(await task.run(task.sequence(ts))).toEqual(result.sequence(rs));
        expect(await task.run(task.all(ts))).toEqual(result.sequence(rs));
      }),
    );
  });
});

describe("laziness and the boundary", () => {
  it("nothing runs until run", async () => {
    const calls: string[] = [];
    const t = task.tryPromise(error.fromUnknown("SYSTEM"))(() => {
      calls.push("ran");
      return Promise.resolve(1);
    });
    const composed = task.map((n: number) => n + 1)(t);
    expect(calls).toEqual([]);
    expect(await task.run(composed)).toEqual(result.success(2));
    expect(calls).toEqual(["ran"]);
  });
  it("a rejection becomes a failure", async () => {
    const t = task.tryPromise(error.fromUnknown("NETWORK"))(() => Promise.reject(new Error("down")));
    const r = await task.run(t);
    expect(r.tag).toBe("failure");
    expect(() => JSON.stringify(r)).not.toThrow();
  });
  it("a throw before the promise becomes a failure", async () => {
    const t = task.tryPromise(error.fromUnknown("SYSTEM"))((): Promise<number> => {
      throw new Error("early");
    });
    expect((await task.run(t)).tag).toBe("failure");
  });
  it("sequence stops at the first failure", async () => {
    const calls: number[] = [];
    const step = (n: number): Task<number, string> =>
      task.tryPromise(() => "x")(() => {
        calls.push(n);
        return n === 2 ? Promise.reject(new Error("two")) : Promise.resolve(n);
      });
    const r = await task.run(task.traverse(step)([1, 2, 3]));
    expect(r).toEqual(result.failure("x"));
    expect(calls).toEqual([1, 2]);
  });
});

describe("effects run as composed", () => {
  const counted = (calls: number[], n: number): Task<number, string> =>
    task.tryPromise(() => "x")(() => {
      calls.push(n);
      return Promise.resolve(n);
    });
  it("flatMap runs its task once, then the next", async () => {
    const calls: number[] = [];
    const t = pipe(
      counted(calls, 1),
      task.flatMap((n: number) => counted(calls, n + 1)),
    );
    expect(await task.run(t)).toEqual(result.success(2));
    expect(calls).toEqual([1, 2]);
  });
  it("traverse calls nothing before run", async () => {
    const calls: number[] = [];
    const t = task.traverse((n: number) => counted(calls, n))([1, 2, 3]);
    expect(calls).toEqual([]);
    expect(await task.run(t)).toEqual(result.success([1, 2, 3]));
    expect(calls).toEqual([1, 2, 3]);
  });
});

describe("run never rejects", () => {
  it("a throw in a function given to map is a DEFECT", async () => {
    const t = task.map((): number => {
      throw new Error("bug");
    })(task.of(1));
    const r = await task.run(t);
    expect(r.tag === "failure" && "code" in r.error ? r.error.code : null).toBe("DEFECT");
  });
  it("a long sequence does not overflow the stack", async () => {
    const n = 20000;
    const r = await task.run(task.sequence(Array.from({ length: n }, (_, i) => task.of(i))));
    expect(r.tag === "success" ? r.value.length : -1).toBe(n);
  });
});

describe("tap", () => {
  const recorded =
    (calls: number[]) =>
    (n: number): Task<void, string> =>
      task.tryPromise(() => "x")(() => {
        calls.push(n);
        return Promise.resolve();
      });
  it("runs its task once, after the value, and passes the value on unchanged", async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer(), async (n) => {
        const calls: number[] = [];
        const t = pipe(task.of(n), task.tap(recorded(calls)));
        expect(calls).toEqual([]);
        expect(await task.run(t)).toEqual(result.success(n));
        expect(calls).toEqual([n]);
      }),
    );
  });
  it("does not run on a failure, and its own failure stops the chain", async () => {
    const calls: number[] = [];
    expect(await task.run(pipe(task.fail("e"), task.tap(recorded(calls))))).toEqual(result.failure("e"));
    expect(calls).toEqual([]);
    expect(
      await task.run(
        pipe(
          task.of(1),
          task.tap(() => task.fail("side")),
        ),
      ),
    ).toEqual(result.failure("side"));
  });
});

describe("only run starts a Task", () => {
  it("a Task is not a function", () => {
    const t = task.of(1);
    // @ts-expect-error: a Task cannot be called by hand (dev/ts/STYLE.md, The API)
    expect(() => t()).toThrow(TypeError);
  });
});
