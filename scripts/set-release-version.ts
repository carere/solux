import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repository = fileURLToPath(new URL("..", import.meta.url));

export function stableVersion(version: string): number[] {
  if (version !== version.trim() || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) {
    throw new Error("Provide a stable MAJOR.MINOR.PATCH version without a prefix or prerelease.");
  }
  const parts = version.split(".").map(Number);
  if (!parts.every(Number.isSafeInteger))
    throw new Error("Version components must be safe integers.");
  return parts;
}

export function setReleaseVersion(version: string, root = repository): void {
  const next = stableVersion(version);
  const path = resolve(root, "packages/solux/package.json");
  const manifest = JSON.parse(readFileSync(path, "utf8"));
  if (manifest.name !== "@carere/solux" || manifest.private === true) {
    throw new Error("Only the public @carere/solux package can be versioned.");
  }
  const current = stableVersion(manifest.version);
  const difference = next.findIndex((part, index) => part !== current[index]);
  if (difference < 0 || (next[difference] ?? 0) < (current[difference] ?? 0)) {
    throw new Error("The release version must be greater than the current package version.");
  }
  manifest.version = version;
  writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`);
}

if (import.meta.main) {
  const version = process.argv[2];
  if (!version || process.argv.length !== 3) {
    throw new Error("Usage: bun scripts/set-release-version.ts MAJOR.MINOR.PATCH");
  }
  setReleaseVersion(version);
}
