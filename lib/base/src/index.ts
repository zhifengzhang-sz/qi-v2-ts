// base: Result, Task, QiError, pipe and flow (dev/ts/STYLE.md; dev/docs/lib.md). The modules are
// namespaces, result.map beside task.map; the types are named apart.

export type { Category, Context, Defect, Exception, Json, QiError } from "./error.ts";
export * as error from "./error.ts";
export { flow, identity, maxSteps, pipe } from "./pipe.ts";
export type { Failure, Result, Success } from "./result.ts";
export * as result from "./result.ts";
export type { Task } from "./task.ts";
export * as task from "./task.ts";
