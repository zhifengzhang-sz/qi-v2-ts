#!/usr/bin/env bash
# The project's own checks for a commit, after the kit's (make verify, run by the pre-commit hook make install
# writes): every check, whatever is staged: products-check (where the kit's part has not run it), agents-check, ts,
# taker-check. They check the work tree, so the work tree must be what is staged: a change not staged, or a new file
# not added, stops it before the checks; a file a check writes stops it after them. Outside the project's shell
# (QI_TS_SHELL, set by its flake), it runs itself again in it.
set -euo pipefail

if [[ ${QI_TS_SHELL-} != 1 ]]; then
  command -v nix >/dev/null 2>&1 || {
    echo "verify: nix is not on PATH, so the project's checks cannot run (make verify)."
    echo "verify: commit from nix develop, or a shell with nix; git commit --no-verify skips them."
    exit 1
  }
  exec nix develop -c bash "$0" "$@"
fi

staged() {
  git diff --quiet && test -z "$(git ls-files --others --exclude-standard)"
}
staged || {
  echo "verify: the work tree is not what is staged (git status): make verify checks the work tree."
  echo "verify: stage the rest, or stash it (git stash push --keep-index --include-untracked), then commit."
  exit 1
}

# PRODUCTS.md against the project at every commit: the kit's part checks it where PRODUCTS.md or a root *.lock is
# staged, this part where neither is
paths=$(git diff --cached --name-only)
grep -qE '^(PRODUCTS\.md|[^/]+\.lock)$' <<<"$paths" || make --no-print-directory products-check
for t in agents-check ts taker-check; do
  make --no-print-directory "$t"
done

staged || {
  echo "verify: a check changed the work tree (git status): stage what it wrote, then commit."
  exit 1
}
