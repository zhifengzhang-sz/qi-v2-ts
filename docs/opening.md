# Opening

**Where it stands.** Milestone 1 is done: `@qi/base` and `@qi/core` are the project's product, `qi-v2-ts` 0.1.0, a
flake package of their source with the npm packages they take, released by the tag `qi-v2-ts-0.1.0` (on `3c55f72`)
and taken by its release branch, `release/qi-v2-ts`, at that commit (`README.md`, Taking it; `docs/decisions.md`,
2026-11-21). The project's files follow the kit's shared rules (kit 0.7.0) and `qi-v2-nix`'s `practices.md` section
8: `qi-v2` and the kit are taken by `release/qi-v2` and `release/kit` (at this writing `qi-v2-1.0.2` and
`kit-0.7.0`); the `Makefile` and `.gitignore` hold the kit's part; the pre-commit hook is the one `make install`
writes, and `make verify` runs the kit's check and then the project's own (`dev/scripts/verify.sh`): the work tree
what is staged, then `products-check`, `agents-check`, `ts` and `taker-check`. `make locks-check` asks `flake.lock`'s
inputs with no credential, by their release branches' tags (no compare, so no gh), then `bun.lock` by `bun
outdated`. `docs/designs/` holds what a later session relies on; none yet but its `README.md`.

**Open for the owner:**
- `release/qi-v2-ts` is the owner's to push, at `3c55f72`; until it is on `origin`, `README.md`'s Taking it names a
  branch a taker cannot fetch.
- Every package `bun.lock` pins had a newer release when last asked. A new Zod or smol-toml changes what the product
  carries, so it is a new version of `qi-v2-ts`.

**The next task:** none set; the next is the owner's to give. The first taker's report on what `README.md` lacks for
it is expected; a change to the package's form it leads to is a new version (`docs/decisions.md`).

## Standing rules learnt

None yet.
