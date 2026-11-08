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
- **2026-11-08, the owner.** The libraries are brought in at 0.1.0, unchanged. Why (the book keeper's, the owner
  leaving it): the libraries were moved, not changed; a version names what the code does, and the code does what it
  did in its former home (only its comments and package descriptions now point to this project's files), so a taker
  of the copies gets the same code by the tag, and a new number would say that something changed. Shapes: `lib/`.
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
- **2026-11-08, the book keeper, the owner leaving it, on the session's proposal.** The package's form is the
  libraries' source laid out for linking: a taker links its `node_modules/@qi` and `node_modules/zod` to it and lists
  neither in its `package.json`, and `make verify` runs the taker's check; not JavaScript built from it with its
  declarations. Why: what is tested is what a taker takes, with no build between, for Bun or `tsc`; the taker's check
  proves it from the package alone, and a change that breaks a taker stops the commit; the schemas a taker gives core
  are of the one Zod core is tested with; the first real taker is about to take it and reports what the README lacks
  for it, and a change to the form then is a new version. Shapes: `flake.nix`, `README.md`, `dev/taker/`, `Makefile`.
- **2026-11-08, the book keeper, the owner leaving it, on the session's proposal.** Where a folder input's repository
  has moved, the kit asks GitHub's compare over HTTPS with no login (GitHub's API serves a public repository so,
  within its rate limit), a change to the kit in `qi-v2-nix`, in a round of its own; not gh's login, allowed by the
  owner each time. Until then `make locks-check` stops there, at the first input it cannot ask, and the owner is
  asked. Why: the project reads GitHub's public repositories over HTTPS with no login (`agents/rules.md`), and a
  public repository's compare needs none; gh's login would put the owner's token into a check every session runs.
  Shapes: `Makefile`, `docs/process.md`, `dev/no-credential/`.
- **2026-11-08, the book keeper, the owner leaving it.** `LICENSE`'s copyright line stays as it is, the account's
  name: `Copyright (c) 2026 zhifengzhang-sz`. Why: it is the name every commit and the tag of the project carry; the
  line is in the package (`flake.nix` copies `LICENSE` into it), so a change waits for a release, and the owner may
  make it then. Shapes: `LICENSE`.

## Open

<!-- an entry: - **The question.** The options. Proposed (the session, YYYY-MM-DD): the proposal. Shapes: `path`. -->

None.
