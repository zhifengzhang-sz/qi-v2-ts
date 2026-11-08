# qi-v2-ts's tools and products, the same on every machine (docs/process.md): `nix develop`, then `make install` and
# the targets of the Makefile. Everything from outside is an input pinned by flake.lock: qi-v2's one nixpkgs and its
# pure shell; the kit, which writes the agents' files from agents/.
{
  description = "qi-v2-ts: @qi/base and @qi/core, the TypeScript foundation libraries";

  inputs.qi-v2.url = "github:zhifengzhang-sz/qi-v2-nix?dir=qi-v2";
  inputs.nixpkgs.follows = "qi-v2/nixpkgs";
  inputs.kit.url = "github:zhifengzhang-sz/qi-v2-nix?dir=kit";
  inputs.kit.inputs.qi-v2.follows = "qi-v2";

  outputs = { self, nixpkgs, qi-v2, kit }:
    let
      systems = [ "x86_64-linux" ];
      forAll = f: nixpkgs.lib.genAttrs systems (system: f (import nixpkgs {
        inherit system;
        config.allowUnfreePredicate = pkg: builtins.elem (nixpkgs.lib.getName pkg) [ "claude-code" "github-copilot-cli" ];
      }));
    in {
      devShells = forAll (pkgs:
        let
          shell = extra: qi-v2.lib.mkPureShell pkgs {
            name = "qi-v2-ts";
            packages = with pkgs; [
              gnumake git gh curl openssh python3
              # the TypeScript (STYLE.md): Bun runs it, Biome lints and formats it; its packages are npm's, pinned
              # by bun.lock; vitest's runtime is Node
              bun biome nodejs_24
            ] ++ extra;
            hostTools = [ "nix" "nix-store" ];
            env = { QI_TS_SHELL = "1"; };
            closing = ''echo "qi-v2-ts: make help lists the targets; docs/opening.md says where the work stands"'';
          };
        in {
          default = shell [ ];
          claude-code = shell [ pkgs.claude-code ];
          copilot = shell [ pkgs.github-copilot-cli ];
        });
    };
}
