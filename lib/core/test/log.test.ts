// log: the threshold as an order, a line as a JSON round trip, and a logger observed through a recording sink.

import { type Context, task } from "@qi/base";
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { log, logger, type Sink } from "../src/index.ts";

const level = fc.constantFrom(...log.levels);

// fast-check types a JSON object's fields as optional (undefined); it never generates one, so the value is a Context.
const context = fc.dictionary(fc.string(), fc.jsonValue()).map((c) => c as Context);

const recording = () => {
  const lines: string[] = [];
  const sink: Sink = {
    write: (line) => {
      lines.push(line);
    },
    now: () => "2026-10-15T00:00:00.000Z",
  };
  return { lines, sink };
};

describe("log, pure", () => {
  it("passes a level exactly when its rank is at least the threshold's", () => {
    fc.assert(
      fc.property(
        level,
        level,
        (t, l) => log.enabled(t)(l) === log.levels.indexOf(l) >= log.levels.indexOf(t),
      ),
    );
  });
  it("writes an entry as one line that reads back as the entry", () => {
    fc.assert(
      fc.property(level, fc.string(), fc.string(), context, (l, time, message, c) => {
        const line = log.format({ level: l, time, message, context: c });
        expect(line.includes("\n")).toBe(false);
        expect(JSON.parse(line)).toEqual({
          level: l,
          time,
          message,
          context: JSON.parse(JSON.stringify(c)),
        });
      }),
    );
  });
});

describe("log, the logger", () => {
  it("writes the lines at or above its threshold, and nothing before it runs", async () => {
    const { lines, sink } = recording();
    const say = logger("warn")(sink);
    const tasks = [say.debug("d"), say.info("i"), say.warn("w", { n: 1 }), say.error("e")];
    expect(lines).toEqual([]);
    await task.run(task.sequence(tasks));
    expect(lines.map((line) => JSON.parse(line))).toEqual([
      { level: "warn", time: "2026-10-15T00:00:00.000Z", message: "w", context: { n: 1 } },
      { level: "error", time: "2026-10-15T00:00:00.000Z", message: "e", context: {} },
    ]);
  });
  it("does not fail when the sink throws", async () => {
    const broken: Sink = {
      write: () => {
        throw new Error("stderr closed");
      },
      now: () => "t",
    };
    expect(await task.run(logger("debug")(broken).error("lost"))).toEqual({
      tag: "success",
      value: undefined,
    });
  });
});
