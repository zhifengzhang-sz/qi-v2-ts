# Milestones

## 1. `@qi/base` and `@qi/core`, the project's product

**What.** The two libraries given as the project's product: a flake package of their source with what they take, for
Bun or TypeScript, its README and Changes, its row in `PRODUCTS.md`, released by tag `<product>-<version>`, so that a
taker pins the tag over HTTPS with no login.

**Stands.** Done: the product `qi-v2-ts` 0.1.0, the tag `qi-v2-ts-0.1.0`. The libraries are in `lib/` at 0.1.0, their
comments pointing to `STYLE.md`, `README.md` and `docs/decisions.md`. The flake package is `qi-v2-ts`, its README and
Changes are `README.md`, and `make taker-check` (run by `make verify`) checks a taker's script against the package
alone. Licence MIT.
