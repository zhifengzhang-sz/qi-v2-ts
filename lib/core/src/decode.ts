// decode: the one way in for outside input (dev/ts/STYLE.md, Decode at the boundary). The schema is the
// caller's; core knows none. A failure is a DecodeError, of category VALIDATION, whose context lists every issue.

import { type Exception, error, type Json, pipe, type QiError, type Result, result } from "@qi/base";
import { z } from "zod";

// An issue is what decode writes out, so it has a schema of its own, and its type is read from it.
export const issueSchema = z
  .object({
    path: z.array(z.union([z.string(), z.number()])).readonly(),
    code: z.string(),
    message: z.string(),
  })
  .readonly();

export type Issue = z.output<typeof issueSchema>;

// What decode can fail with: the input does not fit (DECODE, VALIDATION), or the schema itself threw (an async
// schema, an app's refine or transform that throws), the program's fault and not the input's (SYSTEM).
export type DecodeError = QiError<"DECODE", "VALIDATION"> | Exception<"SYSTEM">;

const issue = (i: z.core.$ZodIssue): Issue => ({
  path: i.path.map((key) => (typeof key === "number" ? key : String(key))),
  code: i.code,
  message: i.message,
});

const where = (path: readonly (string | number)[]): string => (path.length === 0 ? "(root)" : path.join("."));

const failed = (issues: readonly Issue[]): DecodeError => ({
  category: "VALIDATION",
  code: "DECODE",
  message: issues.map((i) => `${where(i.path)}: ${i.message}`).join("; "),
  context: { issues },
});

export const decode =
  <S extends z.ZodType>(schema: S) =>
  (input: unknown): Result<z.output<S>, DecodeError> =>
    pipe(
      result.tryCatch(error.fromUnknown("SYSTEM"))(() => schema.safeParse(input)),
      result.flatMap(
        (parsed): Result<z.output<S>, DecodeError> =>
          parsed.success
            ? result.success(parsed.data)
            : result.failure(failed(parsed.error.issues.map(issue))),
      ),
    );

// The schema written out for other languages (dev/docs/lib.md, Contracts). z.toJSONSchema throws on what JSON Schema
// cannot say (a date, a bigint, a transform), so it enters here as a value, the schema's fault (SYSTEM); what it
// returns is JSON by construction. A schema with defaults differs by side: what it takes (input: a field with a
// default may be left out) and what it gives (output: the field always there).
export const jsonSchema = (
  schema: z.ZodType,
  io: "input" | "output" = "output",
): Result<Json, Exception<"SYSTEM">> =>
  result.tryCatch(error.fromUnknown("SYSTEM"))(() => z.toJSONSchema(schema, { io }) as Json);
