# Decisions

Each decision once: its date, who decided (the owner, or the session as a proposal until the owner decides), the
decision, why, and the documents it shapes. A decision still open is under Open, with the proposal.

- **2026-10-15, the owner** (in the libraries' former home). The longest chain `pipe` and `flow` take is a setting,
  `max` in `lib/base/pipe.toml`, from which `src/pipe.ts` is generated. Why: "they are config params to me".
  Shapes: `lib/base/pipe.toml`, `lib/base/scripts/gen-pipe.ts`.
- **2026-10-15, the owner** (in the libraries' former home). `base` gives the shape of an error and nothing of its
  uses; each module defines its own error type, a `QiError` narrowed to its codes. Why: "the base one is kind of like
  the abstract class. each user should have its own error". Shapes: `lib/base/src/error.ts`, `STYLE.md`.
- **2026-11-08, the owner.** The project is the home of `@qi/base` and `@qi/core`, the TypeScript foundation libraries,
  and their product; its earlier content, a plan for research on time series, is removed. Why: the two libraries are
  general, so they live in a project of their own, which every project that takes them pins by its tag. Shapes:
  `README.md`, `PRODUCTS.md`, `docs/milestones.md`.
- **2026-11-08, the owner.** The libraries are brought in at 0.1.0, unchanged. Why: not recorded. Shapes: `lib/`.
- **2026-11-08, the owner.** The project is public: it takes nothing that cannot be read with no login, and names no
  private project in any file. Why: what anyone reads in a public project is then all there is, and its product is
  taken over HTTPS with no key. Shapes: `agents/rules.md`.
- **2026-11-08, the owner.** The project follows the practices of every qi-v2 project (`qi-v2-nix`'s `practices.md`):
  its tools and the kit by flake inputs, `PRODUCTS.md`, the agents' rules by the kit, a release by tag. Why:
  `practices.md` gives its reasons with its sections. Shapes: `flake.nix`, `Makefile`, `PRODUCTS.md`, `agents/`,
  `docs/process.md`.
- **2026-11-08, the owner, on the session's proposal.** `@qi/base` and `@qi/core` are one product: one flake package,
  one version, one tag. Why: core takes base at the same commit (`workspace:*`) and the two are tested together, so
  one tag pins a pair that works; two would leave a taker of core to match two tags. Shapes: `flake.nix`,
  `PRODUCTS.md`, `README.md`.
- **2026-11-08, the owner.** The product is named `qi-v2-ts`, its tag `qi-v2-ts-<version>`; the session had proposed
  `qi-ts`. Why: the project's one product, under the project's own name. Shapes: `flake.nix`, `PRODUCTS.md`,
  `README.md`.
- **2026-11-08, the owner, on the session's proposal.** The first version is 0.1.0. Why: the code's own number, its
  behaviour unchanged by the move; below 1.0, as its API may still change while takers begin. Shapes:
  `lib/base/package.json`, `lib/core/package.json`, `README.md`, `PRODUCTS.md`.
- **2026-11-08, the owner, on the session's proposal.** The licence is MIT. Why: short and permissive, the usual for
  TypeScript libraries, and the licence of Zod and of Node's types, which the package carries. Shapes: `LICENSE`,
  `README.md`, `lib/base/package.json`, `lib/core/package.json`.

## Open

<!-- an entry: - **The question.** The options. Proposed (the session, YYYY-MM-DD): the proposal. Shapes: `path`. -->

- **The kit's compare of a folder input needs gh's login.** Where a folder input's repository has moved, `kit locks`
  asks GitHub's compare through gh, logged in, and where HTTPS fails it asks again by SSH; `make locks-check` runs it
  with neither, so there it stops, at the first input it cannot ask, and the inputs after it go unreported. The
  options: the owner allows gh's login for it, asked each time; or the kit asks the compare over HTTPS with no login
  (GitHub's API serves a public repository so, within its rate limit), a change to the kit in `qi-v2-nix`. Proposed
  (the session, 2026-11-08): the second; until then the check stops there and the owner is asked. Shapes:
  `Makefile`, `docs/process.md`, `dev/no-credential/`.
- **The package's form.** The options: the libraries' source laid out for linking, or JavaScript built from it with
  its declarations. Proposed (the session, 2026-11-08): the source laid out for linking, as it stands: a taker links
  its `node_modules/@qi` and `node_modules/zod` to it and lists neither in its `package.json`, and `make verify` runs
  the taker's check. Why: no build step for Bun or `tsc`; the schemas a taker gives core are of the one Zod core is
  tested with; and a change that breaks a taker stops the commit. Shapes: `flake.nix`, `README.md`, `dev/taker/`,
  `Makefile`.
