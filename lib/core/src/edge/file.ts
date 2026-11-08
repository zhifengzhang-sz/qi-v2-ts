/// <reference types="node" />
// Reading a file: an effect, so a Task (STYLE.md, Effects at the edge). node:fs, which Bun and Node both
// give, so the tests run under either.

import { readFile } from "node:fs/promises";
import { error, type QiError, type Task, task } from "@qi/base";

export type FileError = QiError<"FILE_READ", "SYSTEM">;

// The exception's own facts (its name, its code such as ENOENT) kept in the context, beside the path.
const unreadable =
  (path: string) =>
  (thrown: unknown): FileError => {
    const e = error.fromUnknown("SYSTEM")(thrown);
    return { category: "SYSTEM", code: "FILE_READ", message: e.message, context: { ...e.context, path } };
  };

export const readText = (path: string): Task<string, FileError> =>
  task.tryPromise(unreadable(path))(() => readFile(path, "utf8"));
