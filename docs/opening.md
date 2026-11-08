# Opening

**Where it stands.** Milestone 1 is done: `@qi/base` and `@qi/core` are the project's product, `qi-v2-ts` 0.1.0, a
flake package of their source with the npm packages they take, released by the tag `qi-v2-ts-0.1.0` (on `3c55f72`).
How a taker takes it: `README.md`, Taking it. `make verify` runs the taker's check (`make taker-check`, `dev/taker/`).
`make locks-check` asks `flake.lock`'s inputs with no credential, and `bun.lock` by `bun outdated`. The open
decisions of 0.1.0's round are settled (`docs/decisions.md`): the package's form, the kit's compare of a folder
input, `LICENSE`'s copyright line, and the reason the libraries came in unchanged; none changed the package.

**Open for the owner:**
- `flake.lock`'s `nixpkgs` is outdated: locked `fa1373130d`, while `nixos-26.05` is at `c56a87d8e4`. It comes
  through `qi-v2`, so it is updated in `qi-v2-nix`'s lock, then `nix flake update qi-v2`.
- Every package `bun.lock` pins has a newer release (`make locks-check` lists them). A new Zod or smol-toml changes
  what the product carries, so it is a new version of `qi-v2-ts`.
- The kit's compare of a folder input over HTTPS with no login is a change to the kit in `qi-v2-nix`, in a round of
  its own (`docs/decisions.md`). Until then, where a folder input's repository has moved, `make locks-check` stops
  at the first input it cannot ask, and the owner is asked.

**The next task:** none set; the next is the owner's to give. The first taker's report on what `README.md` lacks for
it is expected; a change to the package's form it leads to is a new version (`docs/decisions.md`).

## Standing rules learnt

None yet.
