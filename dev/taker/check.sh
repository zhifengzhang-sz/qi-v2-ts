#!/usr/bin/env bash
# The taker's check (README.md, Taking it), run by make taker-check from the repository's root: the product built
# from this flake; a taker's script copied outside this workspace, so that none of its node_modules is found;
# node_modules/@qi and node_modules/zod linked to the package, as a taker links them; then the script typechecked by
# tsc (bun.lock's TypeScript) and run by Bun and by Node, each run's lines against expected.txt.
set -euo pipefail

here=dev/taker
tsc="$PWD/node_modules/.bin/tsc"
test -x "$tsc" || { echo "taker-check: no tsc at node_modules/.bin: make ts"; exit 1; }

dir=$(mktemp -d)
trap 'rm -rf "$dir"' EXIT

nix build .#qi-v2-ts -o "$dir/qi-v2-ts"
cp "$here/main.ts" "$here/tsconfig.json" "$dir/"
mkdir "$dir/node_modules"
ln -s ../qi-v2-ts/node_modules/@qi "$dir/node_modules/@qi"
ln -s ../qi-v2-ts/node_modules/zod "$dir/node_modules/zod"

"$tsc" -p "$dir"
bun "$dir/main.ts" | diff "$here/expected.txt" -
node "$dir/main.ts" | diff "$here/expected.txt" -
echo "taker-check: $(readlink "$dir/qi-v2-ts"): typechecked by tsc, run by Bun and by Node, as $here/expected.txt"
