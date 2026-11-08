# qi-v2-ts

`@qi/base` and `@qi/core`, the TypeScript foundation libraries, under `lib/`, given as one product, `qi-v2-ts`:

- `@qi/base` (`lib/base`): `Result`, `Task`, `QiError`, `pipe` and `flow`, curried and data-last.
- `@qi/core` (`lib/core`): decode, contract, config and log over `@qi/base`: the way in for outside input.

They know no domain and no taker. The rule their code is written by is `STYLE.md`; what the project gives and takes
is `PRODUCTS.md`.

## The product

`qi-v2-ts` is a flake package of the two libraries' source, with what they take, for Bun or TypeScript, on
`x86_64-linux`. There is no build step: the source is TypeScript, run as it is by Bun (or by Node 24, which strips
its types) and checked by the taker's `tsc`. Its layout:

| Path | Holds |
|---|---|
| `@qi/base/`, `@qi/core/` | each library's `package.json` and `src/` |
| `node_modules/@qi` | a link to `../@qi`, so that core finds base |
| `node_modules/zod`, `node_modules/smol-toml` | what core takes, at `bun.lock`'s versions, checked by its hashes |
| `node_modules/@types/node`, `node_modules/undici-types` | Node's types, which the edge's files name for `tsc` |
| `README.md`, `STYLE.md`, `LICENSE` | this file, the rule, the licence |

Each release is a tag `qi-v2-ts-<version>` (Changes, below), read over HTTPS with no login.

## Taking it

The tag, as an input of the taker's flake:

```nix
inputs.qi-v2-ts.url = "github:zhifengzhang-sz/qi-v2-ts?ref=qi-v2-ts-0.1.0";
```

The package, at the taker's own pin (`--inputs-from .`), linked into the taker's `node_modules`:

```bash
nix build --inputs-from . qi-v2-ts#qi-v2-ts -o .qi-v2-ts    # .qi-v2-ts ignored by git
mkdir -p node_modules
ln -sfn ../.qi-v2-ts/node_modules/@qi node_modules/@qi
ln -sfn ../.qi-v2-ts/node_modules/zod node_modules/zod
```

- **Zod from the package.** The taker's schemas, given to `decode`, `config` and `contract`, are then of the one Zod
  core is tested with. Neither `@qi/*` nor `zod` is listed in the taker's `package.json`; `bun install` leaves the
  links alone.
- **Resolved from the package.** Bun, Node and `tsc` follow a link to its real path and resolve the libraries' own
  imports from there, so core finds base, Zod and smol-toml in the package whatever the taker has. The real path of
  the source is outside any `node_modules`, where Node strips types.
- **The taker's `tsc`** checks the libraries' source under the taker's options. The source imports with `.ts`
  extensions, is found through each `package.json`'s `exports`, and uses ES2022's library (`Error`'s `cause`), so the
  taker's `tsconfig.json` sets what `dev/taker/tsconfig.json` sets, which the check uses: `"target": "ES2023"`,
  `"module": "ESNext"`, `"moduleResolution": "Bundler"`, `"allowImportingTsExtensions": true`, `"noEmit": true`,
  `"strict": true`, `"skipLibCheck": true`, `"types": []`. The libraries are also checked under this project's
  `tsconfig.json` (with `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess` besides).

`make taker-check` checks all of this, and `make verify` runs it: the package built, a taker's script
(`dev/taker/main.ts`) copied outside this workspace and linked as above, typechecked by `tsc` and run by Bun and by
Node, each run's lines against `dev/taker/expected.txt`.

## Using it

```ts
import { pipe, task } from "@qi/base";
import { config, log, toStderr } from "@qi/core";
import { z } from "zod";

const Settings = z.object({ name: z.string(), log: z.object({ level: log.levelSchema }) });

const main = pipe(
  config.load(Settings)("settings.toml"),
  task.tap((s) => toStderr(s.log.level).info("started", { name: s.name })),
);

const outcome = await task.run(main); // a Result: run never rejects
```

The operations are curried and data-last, for `pipe` and `flow` (`jsonSchema`, which takes a schema and a side, is
not). Failure is a value, a `Result`; an effect is a value,
a `Task`, run once by `task.run` in the app's `main`. The full list of each module is its `src/index.ts`.

### `@qi/base`

- `result`: a `Result<T, E>` is a `Success` or a `Failure`. `match` and `getOrElse` are the ways out, both total;
  `map`, `mapError`, `flatMap` (`andThen`), `orElse`, `ensure`, `flatten`; `fromNullable`; `tryCatch`, where a
  throwing function enters as a value; `sequence`, `traverse` (the first failure) and `partition` (every failure).
- `task`: a `Task<T, E>` is an effect not yet run. `tryPromise` is where a promise enters; `map`, `mapError`,
  `flatMap` (`andThen`), `flatMapResult`, `tap` (a step on the side), `orElse`; `sequence` and `traverse` (one after
  another), `all` (at once). `task.run` is the only way to start one; it never rejects: a throw where none is allowed
  becomes a `QiError` of code `DEFECT`.
- `error`: a `QiError` is `code`, `message`, `category` (one of the shared `categories`) and a `Json` `context`.
  `base` gives the shape; each module narrows it to its own codes and returns that. `fromUnknown` makes a thrown value
  data; `withContext`, `show`.
- `pipe`, `flow`: composition left to right, typed up to `maxSteps` steps (`lib/base/pipe.toml`); `identity`.

### `@qi/core`

- `decode(schema)(input)`: the way in for outside input, through the caller's Zod schema, as a `Result`. Its
  `DecodeError` is `DECODE` (the input does not fit; every issue in `context.issues`, each of `issueSchema`) or an
  exception of category `SYSTEM` (the schema itself threw). `jsonSchema` writes a schema out as JSON Schema.
- `config`: a settings file in TOML against the app's schema. `parseToml` and `fromText` are pure; `load(schema)(path)`
  is the `Task` that reads the file, with the path in every failure; `toText` writes a value as TOML. Its errors are
  `TOML_PARSE`, `CONFIG_INVALID`, the file's `FILE_READ`, and an exception of category `SYSTEM` where the app's
  schema throws or a value cannot be written as TOML.
- `contract`: a module's schema with its test vectors, and `verify` (Contracts, below).
- `log`: the levels, a threshold, an entry as one JSON line (`format`). `logger(threshold)(sink)` and
  `toStderr(threshold)` give a `Logger`, whose methods are `Task<void, never>`: a log never fails the program.

## Contracts

A module's contract is its Zod schema and the test vectors beside it: `Json` values the schema must accept and values
it must reject; `contract.verify` fails, naming each wrong vector by its index, where the schema disagrees with them. The vectors
are `Json`, and the schema is written out as JSON Schema (`jsonSchema`), so that another language can decode the
same input and run the same vectors. What core writes out has a schema of its own: a decode issue (`issueSchema`), a
log line (`log.entrySchema`, with `log.entryContract`), the log level (`log.levelSchema`, with `log.levelContract`).

## Working on it

Nix with flakes. Then:

```bash
nix develop
make install
make ts
```

`make help` lists the targets. How a session works: `docs/process.md`.

## Licence

MIT (`LICENSE`). The packages the product carries keep their own licences, each in its folder: Zod, Node's types and
undici's types are MIT, smol-toml is BSD-3-Clause.

## Changes

- **0.1.0**: the first release. `@qi/base` and `@qi/core` as one product, a flake package of their source with Zod,
  smol-toml and Node's types at `bun.lock`'s versions; taken by the tag `qi-v2-ts-0.1.0`.
