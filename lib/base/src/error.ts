// Errors as data (STYLE.md): base gives the shape of an error and nothing of its uses; each module defines
// its own error type, a QiError narrowed to its codes, as each user of an abstract class has its own
// (docs/decisions.md). The context is Json, so that writing an error out as JSON is total (a number NaN or
// ±Infinity is written as null, JSON's own rule).

import { describe } from "./edge/catch.ts";

export type Json = null | boolean | number | string | readonly Json[] | { readonly [key: string]: Json };

export type Context = { readonly [key: string]: Json };

// The categories are a vocabulary shared across modules, so that an app can sort errors from any module alike;
// the codes are each module's own.
export const categories = [
  "VALIDATION",
  "NETWORK",
  "SYSTEM",
  "BUSINESS",
  "AUTHENTICATION",
  "AUTHORIZATION",
  "CONFIGURATION",
  "TIMEOUT",
  "RESOURCE",
  "CONCURRENCY",
] as const;

export type Category = (typeof categories)[number];

export type QiError<Code extends string = string, Cat extends Category = Category> = {
  readonly code: Code;
  readonly message: string;
  readonly category: Cat;
  readonly context: Context;
};

export const isCategory = (value: string): value is Category =>
  (categories as readonly string[]).includes(value);

export const withContext =
  (context: Context) =>
  <E extends QiError>(error: E): E => ({ ...error, context: { ...error.context, ...context } });

export const show = (error: QiError): string => `[${error.code}] ${error.message}`;

// base's own errors: what an exception carries, and a bug caught by task.run.
export type Exception<Cat extends Category = Category> = QiError<"EXCEPTION" | "UNKNOWN_EXCEPTION", Cat>;

export type Defect = QiError<"DEFECT", "SYSTEM">;

// The boundary where a thrown value becomes data, as strings. Total: a value that cannot be printed (a null
// prototype, a throwing toString) is described by edge/catch.ts. The category is the caller's: only it knows
// what the exception means.
export const fromUnknown =
  <Cat extends Category>(category: Cat) =>
  (thrown: unknown): Exception<Cat> =>
    thrown instanceof Error
      ? {
          category,
          code: "EXCEPTION",
          message: describe(thrown.message),
          context: {
            name: describe(thrown.name),
            stack: thrown.stack === undefined ? null : describe(thrown.stack),
            code: "code" in thrown && typeof thrown.code === "string" ? thrown.code : null,
            cause: thrown.cause === undefined ? null : describe(thrown.cause),
          },
        }
      : { category, code: "UNKNOWN_EXCEPTION", message: describe(thrown), context: {} };

// A throw where none is allowed (in a function given to map, flatMap, orElse): a bug, kept as data by task.run.
export const defect = (thrown: unknown): Defect => ({ ...fromUnknown("SYSTEM")(thrown), code: "DEFECT" });
