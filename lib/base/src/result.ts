// Result, the Either type (STYLE.md): a failure is a value. Every operation is curried and data-last,
// for pipe and flow; the ways out are match and getOrElse, both total. Its laws (functor, monad) are its tests.

import type { QiError } from "./error.ts";

export type Success<T> = { readonly tag: "success"; readonly value: T };
export type Failure<E> = { readonly tag: "failure"; readonly error: E };
export type Result<T, E = QiError> = Success<T> | Failure<E>;

export const success = <T>(value: T): Result<T, never> => ({ tag: "success", value });
export const failure = <E>(error: E): Result<never, E> => ({ tag: "failure", error });

// The eliminator: the one total way out of a Result.
export const match =
  <T, E, R>(onSuccess: (value: T) => R, onFailure: (error: E) => R) =>
  (result: Result<T, E>): R =>
    result.tag === "success" ? onSuccess(result.value) : onFailure(result.error);

export const map =
  <T, U>(f: (value: T) => U) =>
  <E>(result: Result<T, E>): Result<U, E> =>
    result.tag === "success" ? success(f(result.value)) : result;

export const mapError =
  <E, F>(f: (error: E) => F) =>
  <T>(result: Result<T, E>): Result<T, F> =>
    result.tag === "failure" ? failure(f(result.error)) : result;

export const flatMap =
  <T, U, F>(f: (value: T) => Result<U, F>) =>
  <E>(result: Result<T, E>): Result<U, E | F> =>
    result.tag === "success" ? f(result.value) : result;

// The same bind under the name other traditions give it.
export const andThen = flatMap;

export const flatten = <T, E, F>(result: Result<Result<T, F>, E>): Result<T, E | F> =>
  result.tag === "success" ? result.value : result;

export const orElse =
  <E, U, F>(f: (error: E) => Result<U, F>) =>
  <T>(result: Result<T, E>): Result<T | U, F> =>
    result.tag === "failure" ? f(result.error) : result;

export const ensure =
  <T, F>(predicate: (value: T) => boolean, onFalse: (value: T) => F) =>
  <E>(result: Result<T, E>): Result<T, E | F> =>
    result.tag === "success" && !predicate(result.value) ? failure(onFalse(result.value)) : result;

export const getOrElse =
  <E, T>(onFailure: (error: E) => T) =>
  (result: Result<T, E>): T =>
    result.tag === "success" ? result.value : onFailure(result.error);

export const fromNullable =
  <E>(onNull: () => E) =>
  <T>(value: T | null | undefined): Result<NonNullable<T>, E> =>
    value === null || value === undefined ? failure(onNull()) : success(value);

// The boundary where a throwing function enters as a value: in src/edge/, the one try (STYLE.md).
export { tryCatch } from "./edge/catch.ts";

// All successes, or the first failure in order.
export const sequence = <T, E>(results: readonly Result<T, E>[]): Result<readonly T[], E> => {
  const failed = results.find((r): r is Failure<E> => r.tag === "failure");
  return failed ?? success(results.flatMap((r) => (r.tag === "success" ? [r.value] : [])));
};

export const traverse =
  <A, T, E>(f: (a: A) => Result<T, E>) =>
  (as: readonly A[]): Result<readonly T[], E> =>
    sequence(as.map(f));

// Every failure, or all successes: for decoding a list where each bad row must be reported.
export const partition = <T, E>(
  results: readonly Result<T, E>[],
): { readonly successes: readonly T[]; readonly failures: readonly E[] } => ({
  successes: results.flatMap((r) => (r.tag === "success" ? [r.value] : [])),
  failures: results.flatMap((r) => (r.tag === "failure" ? [r.error] : [])),
});
