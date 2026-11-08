/// <reference types="node" />
// log, the effect: a logger writes one line per message through a sink, when its Task runs. The sink is the
// effect, passed in so that a test can record it; an app takes toStderr, and the raw sink is not exported. A log
// must never fail the program: a sink that throws loses the line, nothing more.

import { writeSync } from "node:fs";
import { type Context, pipe, type Task, task } from "@qi/base";
import { enabled, format, type Level } from "../log.ts";

export type Sink = { readonly write: (line: string) => void; readonly now: () => string };

// writeSync on fd 2, not process.stderr.write: a closed pipe (EPIPE) then throws here, where it is caught, instead
// of arriving later as an 'error' event that would end the process.
const stderr: Sink = {
  write: (line) => {
    writeSync(2, `${line}\n`);
  },
  now: () => new Date().toISOString(),
};

export type Logger = { readonly [L in Level]: (message: string, context?: Context) => Task<void, never> };

const at =
  (threshold: Level, sink: Sink) =>
  (level: Level) =>
  (message: string, context: Context = {}): Task<void, never> =>
    pipe(
      task.tryPromise((thrown: unknown) => thrown)(() =>
        Promise.resolve(
          enabled(threshold)(level)
            ? sink.write(format({ level, time: sink.now(), message, context }))
            : undefined,
        ),
      ),
      task.orElse(() => task.of(undefined)),
    );

export const logger =
  (threshold: Level) =>
  (sink: Sink): Logger => {
    const write = at(threshold, sink);
    return { debug: write("debug"), info: write("info"), warn: write("warn"), error: write("error") };
  };

export const toStderr = (threshold: Level): Logger => logger(threshold)(stderr);
