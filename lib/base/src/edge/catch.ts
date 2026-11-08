// The boundaries where an exception enters as a value: tryCatch (onThrow: error.fromUnknown() for a QiError) and
// describe, a string for any thrown value. The packages' only try is here, in the edge (dev/ts/STYLE.md).

import type { Result } from "../result.ts";

export const tryCatch =
  <E>(onThrow: (thrown: unknown) => E) =>
  <T>(thunk: () => T): Result<T, E> => {
    try {
      return { tag: "success", value: thunk() };
    } catch (thrown) {
      return { tag: "failure", error: onThrow(thrown) };
    }
  };

const unprintable = "unprintable thrown value";

export const describe = (value: unknown): string => {
  try {
    return typeof value === "string"
      ? value
      : typeof value === "object" && value !== null && !(value instanceof Error)
        ? (JSON.stringify(value) ?? String(value))
        : String(value);
  } catch {
    return unprintable;
  }
};
