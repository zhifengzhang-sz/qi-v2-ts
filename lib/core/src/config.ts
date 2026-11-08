// config, the pure part: a settings file's text against the app's schema (README.md, @qi/core).
// Parse the TOML, then decode; the first failure stops the rest. Reading the file is the edge's
// (src/edge/config.ts). No builder and no unsafe way out.

import { type Exception, error, flow, type Json, type QiError, type Result, result } from "@qi/base";
import { parse, stringify, TomlDate, TomlError } from "smol-toml";
import type { z } from "zod";
import { type DecodeError, decode } from "./decode.ts";
import type { FileError } from "./edge/file.ts";

// Each function's error lists exactly what it can return, so that an app's handler knows every case.
export type TomlParseError = QiError<"TOML_PARSE", "CONFIGURATION">;
// The content does not fit the app's schema; or the schema itself threw, the program's fault, passed on as it is.
export type TextError = TomlParseError | QiError<"CONFIG_INVALID", "CONFIGURATION"> | Exception<"SYSTEM">;
export type ConfigError = FileError | TextError;

// Json has no dates, so a TOML date becomes smol-toml's ISO text of it: its kind is kept (a local date, a local
// time, a local or an offset date-time), the time written to the millisecond, finer digits dropped.
const toJson = (value: unknown): Json =>
  value instanceof TomlDate
    ? value.toISOString()
    : Array.isArray(value)
      ? value.map(toJson)
      : typeof value === "object" && value !== null
        ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toJson(v)]))
        : (value as Json);

// The line and column are what the user needs to find the fault.
const malformed = (thrown: unknown): TomlParseError => ({
  category: "CONFIGURATION",
  code: "TOML_PARSE",
  message: error.fromUnknown("CONFIGURATION")(thrown).message,
  context: thrown instanceof TomlError ? { line: thrown.line, column: thrown.column } : {},
});

// toJson inside the catch too, so that nothing smol-toml returns can make parseToml throw.
export const parseToml = (text: string): Result<Json, TomlParseError> =>
  result.tryCatch(malformed)(() => toJson(parse(text)));

// A settings file that does not fit is the app's configuration at fault, not an input in flight; the message and
// the issues are kept, what the user needs to fix the file. A schema that threw is not the file's fault.
const invalid = (e: DecodeError): TextError =>
  e.code === "DECODE" ? { ...e, category: "CONFIGURATION", code: "CONFIG_INVALID" } : e;

export const fromText = <S extends z.ZodType>(
  schema: S,
): ((text: string) => Result<z.output<S>, TextError>) =>
  flow(parseToml, result.flatMap(flow(decode(schema), result.mapError(invalid))));

// A value as a settings file's text, TOML: what an app writes for its user to keep (a JSON object, its keys sections).
// TOML has no null: a value TOML cannot hold (a null in a list, too deep a value) a failure, not a throw.
export const toText = (value: { readonly [key: string]: Json }): Result<string, Exception<"SYSTEM">> =>
  result.tryCatch(error.fromUnknown("SYSTEM"))(() => stringify(value));
