# Opening

**Where it stands.** Milestone 1 is done: `@qi/base` and `@qi/core` are the project's product, `qi-v2-ts` 0.1.0, a
flake package of their source with the npm packages they take, released by the tag `qi-v2-ts-0.1.0` on the commit
that holds this file. How a taker takes it: `README.md`, Taking it. `make verify` runs the taker's check
(`make taker-check`, `dev/taker/`). `make locks-check` asks `flake.lock`'s inputs with no credential, and `bun.lock`
by `bun outdated`.

**Open for the owner:**
- `flake.lock`'s `nixpkgs` is outdated: locked `fa1373130d`, while `nixos-26.05` is at `c56a87d8e4`. It comes
  through `qi-v2`, so it is updated in `qi-v2-nix`'s lock, then `nix flake update qi-v2`.
- Every package `bun.lock` pins has a newer release (`make locks-check` lists them). A new Zod or smol-toml changes
  what the product carries, so it is a new version of `qi-v2-ts`.
- `docs/decisions.md`, Open: the kit's compare of a folder input needs gh's login; the package's form, as the session
  proposed it and built it.
- `docs/decisions.md`: the reason for bringing the libraries in unchanged is not recorded.

**The next task:** none set. Milestone 1 is done; the next is the owner's to give.

## Standing rules learnt

None yet.
