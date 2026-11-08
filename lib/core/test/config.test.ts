/// <reference types="node" />
// config: TOML to Json, each failure its own code, and load as a Task that reads nothing until it runs.

import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { task } from "@qi/base";
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { config, log } from "../src/index.ts";
import { isJson } from "./json.ts";

// An app's schema: core knows none.
const Settings = z.object({ ledger: z.string(), log: z.object({ level: log.levelSchema }) });

const fixture = fileURLToPath(new URL("./fixture/settings.toml", import.meta.url));

// Each kind of TOML date, and what parseToml makes of it (smol-toml's TomlDate.toISOString).
const dates: readonly (readonly [string, string])[] = [
  ["1979-05-27", "1979-05-27"],
  ["07:32:00", "07:32:00.000"],
  ["07:32:00.123456", "07:32:00.123"],
  ["1979-05-27T07:32:00", "1979-05-27T07:32:00.000"],
  ["1979-05-27 07:32:00Z", "1979-05-27T07:32:00.000Z"],
];

// TOML documents that reach toJson: dates alone, in arrays and in inline tables, beside other values.
const value: fc.Arbitrary<string> = fc.letrec<{ v: string }>((tie) => ({
  v: fc.oneof(
    { depthSize: "small" },
    fc.constantFrom(...dates.map(([d]) => d), "1", "-2.5", "true", '"s"', "1979-05-27T07:32:00-07:00"),
    fc.array(tie("v"), { maxLength: 3 }).map((vs) => `[${vs.join(", ")}]`),
    fc.array(tie("v"), { maxLength: 3 }).map((vs) => `{ ${vs.map((v, i) => `k${i} = ${v}`).join(", ")} }`),
  ),
})).v;
const document = fc.array(value, { maxLength: 4 }).map((vs) => vs.map((v, i) => `key${i} = ${v}`).join("\n"));

describe("config.parseToml", () => {
  it("gives the content as Json", () => {
    expect(config.parseToml('a = 1\n[b]\nc = "x"\nd = [true, 2.5]')).toEqual({
      tag: "success",
      value: { a: 1, b: { c: "x", d: [true, 2.5] } },
    });
  });
  it.each(dates)("gives the date %s as %s", (written, read) => {
    expect(config.parseToml(`d = ${written}`)).toEqual({ tag: "success", value: { d: read } });
  });
  it("fails on malformed TOML with TOML_PARSE", () => {
    const r = config.parseToml("a = 1\nb = ");
    expect(r.tag === "failure" && [r.error.category, r.error.code]).toEqual(["CONFIGURATION", "TOML_PARSE"]);
    expect(r.tag === "failure" && r.error.context.line).toBe(2);
  });
  // Not isJson here: TOML's nan and inf are numbers, which base's Json admits (JSON writes them as null).
  it("never throws, on any text", () => {
    fc.assert(
      fc.property(fc.string(), (text) => ["success", "failure"].includes(config.parseToml(text).tag)),
    );
  });
  it("never throws on documents full of dates, and gives Json", () => {
    fc.assert(
      fc.property(document, (text) => {
        const r = config.parseToml(text);
        return r.tag === "success" && isJson(r.value);
      }),
    );
  });
});

describe("config.fromText", () => {
  it("gives the settings, typed", () => {
    expect(config.fromText(Settings)('ledger = "x"\n[log]\nlevel = "info"')).toEqual({
      tag: "success",
      value: { ledger: "x", log: { level: "info" } },
    });
  });
  it("fails on a field that does not fit with CONFIG_INVALID, naming it", () => {
    const r = config.fromText(Settings)('ledger = "x"\n[log]\nlevel = "verbose"');
    expect(r.tag).toBe("failure");
    if (r.tag === "failure") {
      expect([r.error.category, r.error.code]).toEqual(["CONFIGURATION", "CONFIG_INVALID"]);
      expect(r.error.context.issues).toEqual([expect.objectContaining({ path: ["log", "level"] })]);
    }
  });
});

describe("config.fromText, a schema that throws", () => {
  it("passes the exception on as the program's fault, not CONFIG_INVALID", () => {
    const thrower = z.object({
      ledger: z.string().refine(() => {
        throw new Error("bug");
      }),
    });
    const r = config.fromText(thrower)('ledger = "x"');
    expect(r.tag === "failure" && [r.error.category, r.error.code]).toEqual(["SYSTEM", "EXCEPTION"]);
  });
});

describe("config.load", () => {
  it("reads, parses and decodes a file", async () => {
    expect(await task.run(config.load(Settings)(fixture))).toEqual({
      tag: "success",
      value: { ledger: "ledger", log: { level: "warn" } },
    });
  });
  it("fails on a missing file with FILE_READ and the path, and run does not reject", async () => {
    const path = join(tmpdir(), "qi-core-no-such-file.toml");
    const r = await task.run(config.load(Settings)(path));
    expect(r.tag === "failure" && [r.error.category, r.error.code, r.error.context.path]).toEqual([
      "SYSTEM",
      "FILE_READ",
      path,
    ]);
  });
  it("reads nothing until the Task runs", async () => {
    const path = join(await mkdtemp(join(tmpdir(), "qi-core-")), "late.toml");
    const later = config.load(Settings)(path);
    await writeFile(path, 'ledger = "y"\n[log]\nlevel = "debug"');
    expect(await task.run(later)).toEqual({
      tag: "success",
      value: { ledger: "y", log: { level: "debug" } },
    });
  });
});
