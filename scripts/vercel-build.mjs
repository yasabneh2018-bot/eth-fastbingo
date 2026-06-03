#!/usr/bin/env node
// Restructure dist/ -> .vercel/output/ for Vercel Build Output API v3
import { cpSync, mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");
const out = join(root, ".vercel", "output");

if (!existsSync(dist)) {
  console.error("dist/ not found — run vite build first");
  process.exit(1);
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

// Static assets
cpSync(join(dist, "client"), join(out, "static"), { recursive: true });

// Server function
const fnDir = join(out, "functions", "index.func");
mkdirSync(fnDir, { recursive: true });
cpSync(join(dist, "server"), fnDir, { recursive: true });

// Write Vercel function config so the platform can load the function.
// Include multiple common keys to be compatible with different platform checks.
const fnConfig = {
  // Use a currently supported Node runtime for Vercel functions.
  runtime: "nodejs20.x",
  // Common variants: `handler` (older), `entrypoint` (official), `launcher` (some tools)
  handler: "server.js",
  entrypoint: "server.js",
  launcher: "server.js"
};
writeFileSync(join(fnDir, ".vc-config.json"), JSON.stringify(fnConfig, null, 2));

// Build Output API config — route all non-static requests to the function
const config = {
  version: 3,
  routes: [
    { handle: "filesystem" },
    { src: "/(.*)", dest: "/index" },
  ],
};
writeFileSync(join(out, "config.json"), JSON.stringify(config, null, 2));

console.log("✓ Vercel output ready at .vercel/output/");
