// Bun imports a .toml file as its parsed table; this tells tsc so (the generator reads pipe.toml that way).
declare module "*.toml" {
  const table: { readonly [key: string]: unknown };
  export default table;
}
