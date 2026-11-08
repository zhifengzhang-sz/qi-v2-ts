// core: decode (the contracts' way in), contract, config and log, over @qi/base (STYLE.md; README.md,
// @qi/core). The schemas are the caller's; core knows none.

import * as pureConfig from "./config.ts";

export type { ConfigError, TextError, TomlParseError } from "./config.ts";

import { load } from "./edge/config.ts";

export type { FileError } from "./edge/file.ts";

// One namespace for config, its pure part and its effect kept in two files.
export const config = { ...pureConfig, load };
export type { Contract, ContractError, Vectors } from "./contract.ts";
export * as contract from "./contract.ts";
export type { DecodeError, Issue } from "./decode.ts";
export { decode, issueSchema, jsonSchema } from "./decode.ts";
export type { Logger, Sink } from "./edge/log.ts";
export { logger, toStderr } from "./edge/log.ts";
export type { Entry, Level } from "./log.ts";
export * as log from "./log.ts";
