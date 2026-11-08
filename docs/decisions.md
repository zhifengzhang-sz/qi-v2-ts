# Decisions

Each decision once: its date, who decided (the owner, or the session as a proposal until the owner decides), the
decision, why, and the documents it shapes. A decision still open is under Open, with the proposal.

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

## Open

<!-- an entry: - **The question.** The options. Proposed (the session, YYYY-MM-DD): the proposal. Shapes: `path`. -->

- **The product's name and version.** One product holding both libraries, or one each; its name; its first version
  (the code is 0.1.0). Shapes: `PRODUCTS.md`, `flake.nix`.
- **The licence.** A public repository with no licence gives no one the right to use it. Shapes: `LICENSE`, `README.md`.
- **The kit's compare of a folder input needs gh's login.** Where a folder input's repository has moved, `kit locks`
  asks GitHub's compare through gh, logged in, and where HTTPS fails it asks again by SSH; `make locks-check` runs it
  with neither, so there it stops, at the first input it cannot ask, and the inputs after it go unreported. The
  options: the owner allows gh's login for it, asked each time; or the kit asks the compare over HTTPS with no login
  (GitHub's API serves a public repository so, within its rate limit), a change to the kit in `qi-v2-nix`. Proposed
  (the session, 2026-11-08): the second; until then the check stops there and the owner is asked. Shapes:
  `Makefile`, `docs/process.md`, `dev/no-credential/`.
