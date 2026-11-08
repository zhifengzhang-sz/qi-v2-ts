// A taker's script: @qi/base and @qi/core from the flake package alone, typechecked by tsc and run by Bun and by
// Node (dev/taker/check.sh). What it prints is compared with expected.txt.

import { error, pipe, result, task } from "@qi/base";
import { config, contract, decode, log, logger } from "@qi/core";
import { z } from "zod";

// The taker's own schema, of the Zod the package carries.
const Settings = z.object({ name: z.string(), log: z.object({ level: log.levelSchema }) });

// A sink that records, so that the line a logger writes is printed below.
const written: string[] = [];
const sink = {
  write: (line: string) => {
    written.push(line);
  },
  now: () => "2026-01-01T00:00:00.000Z",
};

const program = pipe(
  task.fromResult(config.fromText(Settings)('name = "taker"\n[log]\nlevel = "info"')),
  task.tap((s) => logger(s.log.level)(sink).info("loaded", { name: s.name })),
  task.tap((s) => logger(s.log.level)(sink).debug("below the threshold", { name: s.name })),
  task.map((s) => s.name),
);

const shown = result.match(
  (value: unknown) => `success ${JSON.stringify(value)}`,
  (e: { readonly code: string; readonly category: string; readonly context: { readonly code?: unknown } }) =>
    `failure ${e.code} ${e.category}${e.context.code === undefined ? "" : ` ${String(e.context.code)}`}`,
);

const missing = new URL("./missing.toml", import.meta.url).pathname;

console.log(`run: ${shown(await task.run(program))}`);
console.log(`log: ${written.join(" | ")}`);
console.log(`decode: ${shown(decode(z.number())("x"))}`);
console.log(
  `contract: ${shown(
    pipe(
      contract.verify(log.levelContract),
      result.map((c) => c.name),
    ),
  )}`,
);
console.log(`load: ${shown(await task.run(config.load(Settings)(missing)))}`);
console.log(`error: ${error.show({ code: "X", message: "m", category: "BUSINESS", context: {} })}`);
