// Task, an effect as a value (STYLE.md): a computation not yet run that gives a Result. An effect's own
// failure is a value (tryPromise); a throw in a function given to map, flatMap or orElse is a defect, which run
// turns into a QiError of code DEFECT, so run never rejects. Tasks compose before anything runs; run runs one,
// once, at the program's edge. The function inside is kept under a key this module does not export, so run is the
// only way to start a Task: the types forbid calling one by hand.

import { type Defect, defect, type QiError } from "./error.ts";
import type { Result } from "./result.ts";
import * as result from "./result.ts";

const start: unique symbol = Symbol("task");

export type Task<T, E = QiError> = { readonly [start]: () => Promise<Result<T, E>> };

const make = <T, E>(thunk: () => Promise<Result<T, E>>): Task<T, E> => ({ [start]: thunk });

export const of = <T>(value: T): Task<T, never> => make(() => Promise.resolve(result.success(value)));

export const fail = <E>(error: E): Task<never, E> => make(() => Promise.resolve(result.failure(error)));

export const fromResult = <T, E>(r: Result<T, E>): Task<T, E> => make(() => Promise.resolve(r));

// The boundary where a promise enters: its rejection, or a throw before it, becomes onReject's error.
export const tryPromise =
  <E>(onReject: (thrown: unknown) => E) =>
  <T>(thunk: () => Promise<T>): Task<T, E> =>
    make(() =>
      Promise.resolve()
        .then(thunk)
        .then(
          (value) => result.success(value),
          (thrown: unknown) => result.failure(onReject(thrown)),
        ),
    );

export const map =
  <T, U>(f: (value: T) => U) =>
  <E>(task: Task<T, E>): Task<U, E> =>
    make(() => task[start]().then(result.map(f)));

export const mapError =
  <E, F>(f: (error: E) => F) =>
  <T>(task: Task<T, E>): Task<T, F> =>
    make(() => task[start]().then(result.mapError(f)));

export const flatMap =
  <T, U, F>(f: (value: T) => Task<U, F>) =>
  <E>(task: Task<T, E>): Task<U, E | F> =>
    make(() =>
      task[start]().then(
        (r): Promise<Result<U, E | F>> => (r.tag === "success" ? f(r.value)[start]() : Promise.resolve(r)),
      ),
    );

export const andThen = flatMap;

// A step whose result is a Result, not a Task: decoding inside an effect.
export const flatMapResult =
  <T, U, F>(f: (value: T) => Result<U, F>) =>
  <E>(task: Task<T, E>): Task<U, E | F> =>
    make(() => task[start]().then(result.flatMap(f)));

// A step on the side (a log line): f's Task runs, then the value goes on unchanged; f's failure stops the chain.
export const tap =
  <T, F>(f: (value: T) => Task<unknown, F>) =>
  <E>(task: Task<T, E>): Task<T, E | F> =>
    flatMap((x: T) => map((): T => x)(f(x)))(task);

export const orElse =
  <E, U, F>(f: (error: E) => Task<U, F>) =>
  <T>(task: Task<T, E>): Task<T | U, F> =>
    make(() =>
      task[start]().then(
        (r): Promise<Result<T | U, F>> => (r.tag === "failure" ? f(r.error)[start]() : Promise.resolve(r)),
      ),
    );

// One after another, stopping at the first failure. One promise chain, each step in its own microtask, so a long
// list does not deepen the stack; the values are copied at each step (quadratic), fine for the thousands we run.
export const sequence = <T, E>(tasks: readonly Task<T, E>[]): Task<readonly T[], E> =>
  make(() =>
    tasks.reduce<Promise<Result<readonly T[], E>>>(
      (acc, t) =>
        acc.then((r) =>
          r.tag === "failure" ? r : t[start]().then(result.map((x: T): readonly T[] => [...r.value, x])),
        ),
      Promise.resolve(result.success([])),
    ),
  );

// All at once, with no limit on how many run together; the first failure in order, once all have settled.
export const all = <T, E>(tasks: readonly Task<T, E>[]): Task<readonly T[], E> =>
  make(() => Promise.all(tasks.map((t) => t[start]())).then(result.sequence));

export const traverse =
  <A, T, E>(f: (a: A) => Task<T, E>) =>
  (as: readonly A[]): Task<readonly T[], E> =>
    make(() => sequence(as.map(f))[start]());

// The edge: where a Task runs. Never rejects: a defect (a throw where none is allowed) becomes a QiError.
export const run = <T, E>(task: Task<T, E>): Promise<Result<T, E | Defect>> =>
  Promise.resolve()
    .then(() => task[start]())
    .then(
      (r): Result<T, E | Defect> => r,
      (thrown: unknown) => result.failure(defect(thrown)),
    );
