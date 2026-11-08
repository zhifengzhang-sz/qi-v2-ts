# qi-v2-ts's tools and products, the same on every machine (docs/process.md): `nix develop`, then `make install` and
# the targets of the Makefile. Everything from outside is an input pinned by flake.lock: qi-v2's one nixpkgs and its
# pure shell; the kit, which writes the agents' files from agents/. The product, qi-v2-ts (README.md), is the
# package of the same name.
{
  description = "qi-v2-ts: @qi/base and @qi/core, the TypeScript foundation libraries";

  inputs.qi-v2.url = "github:zhifengzhang-sz/qi-v2-nix?dir=qi-v2";
  inputs.nixpkgs.follows = "qi-v2/nixpkgs";
  inputs.kit.url = "github:zhifengzhang-sz/qi-v2-nix?dir=kit";
  inputs.kit.inputs.qi-v2.follows = "qi-v2";

  outputs = { self, nixpkgs, qi-v2, kit }:
    let
      lib = nixpkgs.lib;
      systems = [ "x86_64-linux" ];
      forAll = f: lib.genAttrs systems (system: f (import nixpkgs {
        inherit system;
        config.allowUnfreePredicate = pkg: builtins.elem (lib.getName pkg) [ "claude-code" "github-copilot-cli" ];
      }));

      # The product's one number, written in both package.json files (README.md, Changes).
      versionOf = name: (builtins.fromJSON (builtins.readFile ./lib/${name}/package.json)).version;
      version =
        assert versionOf "core" == versionOf "base";
        versionOf "base";

      # bun.lock is JSON with trailing commas; without them it is read as JSON. Each package's entry is
      # [ "name@version" registry { dependencies } integrity ].
      lock = builtins.fromJSON (lib.concatMapStrings (s: if builtins.isList s then builtins.head s else s)
        (builtins.split ",[[:space:]]*([]}])" (builtins.readFile ./bun.lock)));
      # What the libraries take: core's dependencies but base, and Node's types, which the edge's files name
      # (/// <reference types="node" />) for tsc; then what those take, as bun.lock resolves them.
      takes = builtins.attrNames (lib.filterAttrs (_: v: !lib.hasPrefix "workspace:" v)
        lock.workspaces."lib/core".dependencies) ++ [ "@types/node" ];
      dependsOn = name: builtins.attrNames ((builtins.elemAt lock.packages.${name} 2).dependencies or { });
      closure = map (x: x.key) (builtins.genericClosure {
        startSet = map (key: { inherit key; }) takes;
        operator = x: map (key: { inherit key; }) (dependsOn x.key);
      });
    in {
      # The product: the libraries' source at @qi/, beside node_modules/ with what they take, fetched from npm at
      # bun.lock's versions and checked by its hashes. node_modules/@qi is a link to ../@qi, so that core finds base;
      # the source's own path is outside any node_modules, where Node strips its types. A taker links its
      # node_modules/@qi and node_modules/zod here (README.md, Taking it).
      packages = forAll (pkgs:
        let
          tarball = name:
            let entry = lock.packages.${name};
            in pkgs.fetchurl {
              url = "https://registry.npmjs.org/${name}/-/${baseNameOf name}-${
                  lib.removePrefix "${name}@" (builtins.elemAt entry 0)
                }.tgz";
              hash = builtins.elemAt entry 3;
            };
          qi-v2-ts = pkgs.runCommand "qi-v2-ts-${version}" { } ''
            mkdir -p $out/@qi $out/node_modules
            ${lib.concatMapStrings (name: ''
              mkdir $out/@qi/${name}
              cp -r ${./lib/${name}/src} $out/@qi/${name}/src
              cp ${./lib/${name}/package.json} $out/@qi/${name}/package.json
            '') [ "base" "core" ]}
            ln -s ../@qi $out/node_modules/@qi
            ${lib.concatMapStrings (name: ''
              mkdir -p $out/node_modules/${name}
              tar -xzf ${tarball name} -C $out/node_modules/${name} --strip-components=1
            '') closure}
            cp ${./README.md} $out/README.md
            cp ${./STYLE.md} $out/STYLE.md
            cp ${./LICENSE} $out/LICENSE
          '';
        in {
          inherit qi-v2-ts;
          default = qi-v2-ts;
        });

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
