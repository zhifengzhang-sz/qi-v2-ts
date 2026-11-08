// config, the effect: a settings file read and decoded, as one Task. Here, not in ../config.ts, so that the pure
// part imports no effect (STYLE.md, The structure).

import { error, pipe, type Task, task } from "@qi/base";
import type { z } from "zod";
import { type ConfigError, fromText } from "../config.ts";
import { readText } from "./file.ts";

// The path in every failure, so that an app with several files can say which one.
export const load =
  <S extends z.ZodType>(schema: S) =>
  (path: string): Task<z.output<S>, ConfigError> =>
    pipe(readText(path), task.flatMapResult(fromText(schema)), task.mapError(error.withContext({ path })));
