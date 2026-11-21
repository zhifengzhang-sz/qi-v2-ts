# qi-v2-ts (README.md): make targets, run inside `nix develop` (flake.nix, docs/process.md), which gives every tool
# they call (flake.nix's shell), and the kit at dev/agents (make install); of the host, only nix. Outside it, make
# stops, but for make verify, which the pre-commit hook runs wherever a commit is made: its kit's part, products-check,
# needs only the kit, and its own part (dev/scripts/verify.sh) runs itself again in the shell.
ifneq ($(QI_TS_SHELL),1)
ifneq ($(MAKECMDGOALS),verify)
ifneq ($(MAKECMDGOALS),products-check)
$(error run make inside this project's shell: nix develop, then make …, or nix develop -c make … (docs/process.md))
endif
endif
endif
SHELL := $(shell command -v bash)
ifeq ($(SHELL),)
$(error no bash in this project's shell)
endif

.PHONY: help agents-check ts taker-check

help: ## the targets
	@grep -E '^[a-z-]+:.*##' $(MAKEFILE_LIST) | sed 's/:.*## /\t/' | expand -t 22

# ---------------------------------------------------------------- the kit's part (docs/process.md, The machine)

# The kit's part, as qi-v2-nix's practices.md gives it (section 8); verify then runs the project's own checks
# (dev/scripts/verify.sh), and locks-check the project's own lock, bun.lock (bun outdated, every workspace).

# the kit at the commit flake.lock names (section 1), read by nix when make install needs it
KIT = $(shell nix eval --raw --impure --expr 'let l = builtins.fromJSON (builtins.readFile ./flake.lock); k = l.nodes.$${l.nodes.$${l.root}.inputs.kit}.locked; in "github:$${k.owner}/$${k.repo}/$${k.rev}?dir=$${k.dir}"')
NEEDKIT = @test -x dev/agents/bin/kit || { echo "$@: no kit at dev/agents: make install"; exit 1; }
# the kit for the checks: the one make install linked, else run from KIT (CI, or a machine before make install)
KITRUN = $(if $(wildcard dev/agents/bin/kit),dev/agents/bin/kit,nix run "$(KIT)" --)

.PHONY: install agents run-start run-check locks-check products-check verify

install: ## the kit at dev/agents, the pre-commit hook that runs make verify, then make agents
	mkdir -p dev && nix build "$(KIT)" -o dev/agents
	hook=$$(git rev-parse --git-path hooks/pre-commit) && printf '#!/bin/sh\nexec make verify\n' > "$$hook" && chmod +x "$$hook"
	$(MAKE) agents

agents: ## each kind's files from agents/ (kit generate)
	$(NEEDKIT)
	dev/agents/bin/kit generate

run-start: ## before a role's run, ROLE=<role> (kit run-start)
	$(NEEDKIT)
	dev/agents/bin/kit run-start --role "$(ROLE)"

run-check: ## after it, ROLE=<role>, FILES=<a,b> for a role that writes them (kit run-check)
	$(NEEDKIT)
	dev/agents/bin/kit run-check --role "$(ROLE)" $(if $(FILES),--files "$(FILES)")

locks-check: ## whether each lock's source has moved past it (kit locks; then the project's own locks)
	$(KITRUN) locks --root .
	bun outdated --filter '*'

products-check: ## whether PRODUCTS.md states what the project has (kit products)
	$(KITRUN) products --root .

verify: ## the checks for what is staged, run by the pre-commit hook (then the project's own checks)
	@if git diff --cached --name-only | grep -qE '^(PRODUCTS\.md|[^/]+\.lock)$$'; then $(MAKE) products-check; fi
	@bash dev/scripts/verify.sh

# kit locks asks each input's source over HTTPS; for a folder input with no release branch whose repository moved it
# asks GitHub's compare through gh, and where HTTPS fails it asks again by SSH. Both would act with a credential of
# the owner's, so locks-check runs with neither: dev/no-credential's gh, which never runs, first on PATH, and git with
# no SSH. Where it needs one, it stops, naming it, and the owner is asked (agents/rules.md, The credentials).
locks-check: export PATH := $(CURDIR)/dev/no-credential:$(PATH)
locks-check: export GIT_SSH_COMMAND := false

# ---------------------------------------------------------------- the project's own checks

agents-check: ## agents/ decoded by the kit, nothing written; make verify runs it
	$(NEEDKIT)
	dev/agents/bin/kit check --root .

# ---------------------------------------------------------------- the TypeScript (STYLE.md)

ts: ## the TypeScript of lib/: its packages installed by bun at bun.lock's versions (a package.json that disagrees with bun.lock stops it), base's pipe and flow generated, then Biome (lint, format, the style's plugins and their proof), the types, the tests
	bun install --frozen-lockfile
	bun run gen && bun run check && bun run verify-style && bun run typecheck && bun run test

# ---------------------------------------------------------------- the product, qi-v2-ts (README.md)

taker-check: ## the product as a taker takes it (README.md, Taking it): the flake package built, a taker's script (dev/taker/) linked to it outside this workspace, typechecked by tsc and run by Bun and by Node, its lines against dev/taker/expected.txt; after make ts
	bash dev/taker/check.sh
