// log, the pure part: the levels, which pass a threshold, and an entry as one JSON line. The writing is an effect
// (src/edge/log.ts). Where the level sits in a settings file is the app's: it decodes it with levelSchema.

import type { Context } from "@qi/base";
import { z } from "zod";
import type { Contract } from "./contract.ts";

export const levels = ["debug", "info", "warn", "error"] as const;

export type Level = (typeof levels)[number];

export const levelSchema = z.enum(levels);

export type Entry = {
  readonly level: Level;
  readonly time: string;
  readonly message: string;
  readonly context: Context;
};

// A line is what log writes out, so it has a schema, for a reader in another language (README.md, Contracts).
export const entrySchema: z.ZodType<Entry> = z
  .object({
    level: levelSchema,
    time: z.string(),
    message: z.string(),
    context: z.record(z.string(), z.json()),
  })
  .readonly();

export const levelContract: Contract<typeof levelSchema> = {
  name: "log level",
  schema: levelSchema,
  vectors: { accept: ["debug", "info", "warn", "error"], reject: ["verbose", "INFO", 1, null] },
};

export const entryContract: Contract<typeof entrySchema> = {
  name: "log entry",
  schema: entrySchema,
  vectors: {
    accept: [
      { level: "info", time: "2026-10-15T00:00:00.000Z", message: "m", context: {} },
      { level: "error", time: "t", message: "", context: { n: 1, list: [null, "x"], nested: { b: true } } },
    ],
    reject: [
      { level: "verbose", time: "t", message: "m", context: {} },
      { level: "info", time: "t", message: "m" },
      { level: "info", time: 0, message: "m", context: {} },
      null,
    ],
  },
};

export const enabled =
  (threshold: Level) =>
  (level: Level): boolean =>
    levels.indexOf(level) >= levels.indexOf(threshold);

// JSON escapes a newline inside a string, so a line never breaks. The keys in a fixed order, for a reader.
export const format = (entry: Entry): string =>
  JSON.stringify({ level: entry.level, time: entry.time, message: entry.message, context: entry.context });
