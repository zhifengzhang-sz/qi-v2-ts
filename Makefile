# qi-v2-ts (README.md): make targets, run inside `nix develop` (flake.nix, docs/process.md), which gives every tool
# they call (flake.nix's shell), and the kit at dev/agents (make install); of the host, only nix. Outside it, make
# stops.
ifneq ($(QI_TS_SHELL),1)
$(error run make inside this project's shell: nix develop, then make …, or nix develop -c make … (docs/process.md))
endif
SHELL := $(shell command -v bash)
ifeq ($(SHELL),)
$(error no bash in this project's shell)
endif

PY := python3
AGENT_KIND ?= all

.PHONY: help install agents agents-check run-start run-check verify locks-check products-check ts taker-check

help: ## the targets
	@grep -E '^[a-z-]+:.*##' $(MAKEFILE_LIST) | sed 's/:.*## /\t/' | expand -t 22

# ---------------------------------------------------------------- the project set up (docs/process.md, The machine)

install: ## the project set up on this machine: git's hooks at dev/hooks (the pre-commit runs make verify); the kit linked at dev/agents from flake.lock's pin, then make agents
	git config core.hooksPath dev/hooks
	@test -n "$(KIT)" || { echo "install: no kit's pin read from flake.lock (nodes.kit.locked)"; exit 1; }
	nix build "$(KIT)" -o dev/agents
	$(MAKE) agents

# The kit at the commit flake.lock pins (nix build --inputs-from drops its ?dir=, so its reference is read from the lock).
KIT := $(shell $(PY) -c "import json; n = json.load(open('flake.lock'))['nodes']['kit']['locked']; print(f\"{n['type']}:{n['owner']}/{n['repo']}/{n['rev']}?dir={n['dir']}\")" 2>/dev/null)

agents: ## each kind's agent files from agents/ (AGENTS.md, CLAUDE.md, .claude/agents/, .github/agents/), by the kit at dev/agents; AGENT_KIND=claude-code|copilot|all; after any change to agents/
	@test -x dev/agents/bin/kit || { echo "agents: no kit at dev/agents: make install"; exit 1; }
	dev/agents/bin/kit generate --kind $(AGENT_KIND) --root .

agents-check: ## agents/ decoded by the kit, nothing written
	@test -x dev/agents/bin/kit || { echo "agents-check: no kit at dev/agents: make install"; exit 1; }
	dev/agents/bin/kit check --root .

run-start: ## before a role's run: the work tree recorded; make run-start ROLE=reviewer
	@test -x dev/agents/bin/kit || { echo "run-start: no kit at dev/agents: make install"; exit 1; }
	@test -n "$(ROLE)" || { echo "run-start: ROLE=<role> is needed"; exit 1; }
	dev/agents/bin/kit run-start --role $(ROLE) --root .

run-check: ## after it: what changed against the role's writes (none: nothing; brief-files: only FILES=a,b; else reported)
	@test -x dev/agents/bin/kit || { echo "run-check: no kit at dev/agents: make install"; exit 1; }
	@test -n "$(ROLE)" || { echo "run-check: ROLE=<role> is needed"; exit 1; }
	dev/agents/bin/kit run-check --role $(ROLE) $(if $(FILES),--files $(FILES)) --root .

verify: ## the checks a commit requires, every one; the pre-commit hook runs it
	$(MAKE) --no-print-directory products-check
	$(MAKE) --no-print-directory agents-check
	$(MAKE) --no-print-directory ts
	$(MAKE) --no-print-directory taker-check

# kit locks asks each input's source over HTTPS; for a folder input whose repository moved it asks GitHub's compare
# through gh, and where HTTPS fails it asks again by SSH. Both would act with a credential of the owner's, so it runs
# with neither: dev/no-credential's gh, which never runs, first on PATH, and git with no SSH. Where it needs one, it
# stops, naming it, and the owner is asked (agents/rules.md, The credentials). bun.lock is asked whatever the kit
# gives, and the target fails if either does.
locks-check: ## whether each lock is outdated: flake.lock's inputs (the kit's kit locks, with no credential), and bun.lock's packages against npm (bun outdated, every workspace); changes nothing
	@test -x dev/agents/bin/kit || { echo "locks-check: no kit at dev/agents: make install"; exit 1; }
	@failed=0; \
	PATH="$(CURDIR)/dev/no-credential:$$PATH" GIT_SSH_COMMAND=false dev/agents/bin/kit locks --root . || failed=1; \
	bun outdated --filter '*' || failed=1; \
	exit $$failed

products-check: ## whether PRODUCTS.md states what the project has (the kit's kit products)
	@test -x dev/agents/bin/kit || { echo "products-check: no kit at dev/agents: make install"; exit 1; }
	dev/agents/bin/kit products --root .

# ---------------------------------------------------------------- the TypeScript (STYLE.md)

ts: ## the TypeScript of lib/: its packages installed by bun at bun.lock's versions (a package.json that disagrees with bun.lock stops it), base's pipe and flow generated, then Biome (lint, format, the style's plugins and their proof), the types, the tests
	bun install --frozen-lockfile
	bun run gen && bun run check && bun run verify-style && bun run typecheck && bun run test

# ---------------------------------------------------------------- the product, qi-v2-ts (README.md)

taker-check: ## the product as a taker takes it (README.md, Taking it): the flake package built, a taker's script (dev/taker/) linked to it outside this workspace, typechecked by tsc and run by Bun and by Node, its lines against dev/taker/expected.txt; after make ts
	bash dev/taker/check.sh
