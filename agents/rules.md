# The rules of qi-v2-ts's work

qi-v2-ts: `@qi/base` and `@qi/core`, the TypeScript foundation libraries, under `lib/` (`README.md`). These are its
standing rules, for an agent of any kind; the format of this file is the kit's (`agents/README.md`).

## The session

**Read first.**

1. `docs/opening.md`: where the last session stopped, what is open for the owner, the next task, and the files that task needs. Read those files, and no others, before starting.
2. `docs/milestones.md`: what the work is for.
3. `docs/process.md`: how a session starts and ends, and where each rule lives.

Read the others only when the task touches them: `STYLE.md` before writing code; `PRODUCTS.md` before a change to what the project gives or takes.

**The rules.**

- **The owner's local file**: `todo.md`, never committed.
- **The repository.** This folder is on `main`; its remote is `origin`, `zhifengzhang-sz/qi-v2-ts` on GitHub, public; pushed after a commit.
- **What it takes, and from where**: the tools from the flake; the TypeScript's packages from npm, by `bun.lock`. No file of another project is reached by a path.
- **The credentials.** No credential of the owner's is used without asking first, whatever the reason, GitHub's rate limit included: gh's token, a registry login, a token passed to `nix` through `NIX_CONFIG` or the environment, the GitHub tools of an MCP server (they hold the owner's token), an SSH key for anything but a push the brief allows (a `git fetch` or `git ls-remote` of `origin` uses it too). GitHub's public repositories are read over HTTPS; npm's registry with no login.

## Every role

- **Public.** The project is public: it takes nothing that cannot be read with no login, and names no private project in any file.
- **A library is a library.** `@qi/base` and `@qi/core` are general: they know no domain and no taker, and take their input as plain data through their contracts.
- **Code** follows `STYLE.md`; Biome formats it before a check.
- **The project's secrets**: none.
