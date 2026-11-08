# qi-v2-ts: what it owns, gives and takes

## Responsibility

It owns `@qi/base` and `@qi/core`, the TypeScript foundation libraries: `@qi/base` gives `Result`, `Task`, `QiError`,
`pipe` and `flow`; `@qi/core` gives decode, contract, config and log over `@qi/base`. They know no domain and no taker.
It gives them as one product, `qi-v2-ts`, released by tag. The tools, the kit and the npm packages the libraries take
are taken, not owned.

## Products

| Product | What | Form | Version | Release | Doc |
|---|---|---|---|---|---|
| `qi-v2-ts` | `@qi/base` and `@qi/core`: their TypeScript source, with the npm packages they take, for Bun or TypeScript | flake package | 0.1.0 | `qi-v2-ts-0.1.0` | `README.md` |

## Takes

| Product | From | Pinned by |
|---|---|---|
| `qi-v2` | `qi-v2-nix` | `flake.lock` |
| `nixpkgs` | `qi-v2`, which it follows | `flake.lock` |
| `kit` | `qi-v2-nix` | `flake.lock` |
| the TypeScript's packages | npm | `bun.lock` |
