# qi-v2-ts

`@qi/base` and `@qi/core`, the TypeScript foundation libraries, under `lib/`:

- `@qi/base` (`lib/base`): `Result`, `Task`, `QiError`, `pipe` and `flow`, curried and data-last.
- `@qi/core` (`lib/core`): decode, contract, config and log over `@qi/base`: the way in for outside input.

The code's style is `STYLE.md`; what the project gives and takes is `PRODUCTS.md`.

## Set up

Nix with flakes. Then:

```bash
nix develop
make install
make ts
```

`make help` lists the targets. How a session works: `docs/process.md`.
