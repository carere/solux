import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { stableVersion } from "./set-release-version";

const repository = fileURLToPath(new URL("..", import.meta.url));

export function checkReleaseTag(tag: string, root = repository): void {
  if (!tag.startsWith("v")) throw new Error("Release tags must use vMAJOR.MINOR.PATCH.");
  stableVersion(tag.slice(1));
  const manifest = JSON.parse(readFileSync(resolve(root, "packages/solux/package.json"), "utf8"));
  if (manifest.name !== "@carere/solux" || manifest.private === true) {
    throw new Error("Expected the public @carere/solux package.");
  }
  if (tag !== `v${manifest.version}`)
    throw new Error("Release tag must match the package version.");
}

export function checkRelease(tag: string, requireMain = false, root = repository): string {
  checkReleaseTag(tag, root);
  function git(...args: string[]): string {
    return execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  }
  git("diff", "--exit-code");
  git("diff", "--cached", "--exit-code");
  const commit = git("rev-parse", "HEAD");
  if (git("rev-parse", "--verify", `refs/tags/${tag}^{commit}`) !== commit) {
    throw new Error("The existing release tag must point at the checked-out commit.");
  }
  if (requireMain) git("merge-base", "--is-ancestor", commit, "refs/remotes/origin/main");
  return commit;
}

export function checkReleaseArchive(archive: string, root = repository): void {
  const packageRoot = resolve(root, "packages/solux");
  const files = execFileSync("tar", ["-tzf", archive], { encoding: "utf8" })
    .trim()
    .split("\n")
    .filter((file) => !file.endsWith("/"));
  for (const required of [
    "package.json",
    "LICENSE",
    "README.md",
    "dist/index.js",
    "dist/index.d.ts",
  ]) {
    if (!files.includes(`package/${required}`)) throw new Error(`Archive is missing ${required}.`);
  }
  for (const file of files) {
    const path = file.slice("package/".length);
    if (
      !file.startsWith("package/") ||
      path.split("/").some((part) => part === "." || part === ".." || !part) ||
      !/^(package\.json|LICENSE|README\.md|dist\/[\w./-]+)$/.test(path)
    ) {
      throw new Error(`Unexpected archive entry: ${file}`);
    }
    const packed = execFileSync("tar", ["-xOzf", archive, file]);
    if (!packed.equals(readFileSync(resolve(packageRoot, path)))) {
      throw new Error(`Archive differs from the verified build: ${path}`);
    }
  }
}

if (import.meta.main) {
  const tag = process.env.RELEASE_TAG ?? "";
  const args = process.argv.slice(2);
  const requireMain = args[0] === "--require-main";
  if (requireMain) args.shift();
  let archive: string | undefined;
  if (args[0] === "--archive" && args[1]) {
    archive = resolve(args[1]);
    args.splice(0, 2);
  }
  if (args.length) {
    throw new Error(
      "Usage: RELEASE_TAG=vX.Y.Z bun scripts/check-release.ts [--require-main] [--archive path]",
    );
  }
  const commit = checkRelease(tag, requireMain);
  if (archive) checkReleaseArchive(archive);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `commit=${commit}\n`);
  console.log(
    `${tag}: version, existing tag, clean tracked files${requireMain ? ", main ancestry" : ""}${archive ? ", and archive" : ""} verified`,
  );
}
