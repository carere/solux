import { afterEach, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkRelease, checkReleaseArchive, checkReleaseTag } from "../check-release";
import { setReleaseVersion } from "../set-release-version";

const fixtures: string[] = [];
afterEach(() => {
  for (const root of fixtures.splice(0)) rmSync(root, { recursive: true, force: true });
});

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "solux-release-test-"));
  fixtures.push(root);
  const pkg = join(root, "packages/solux");
  mkdirSync(join(pkg, "dist"), { recursive: true });
  mkdirSync(join(root, "apps/website"), { recursive: true });
  const manifest = { name: "@carere/solux", version: "4.0.1", exports: { ".": "./dist/index.js" } };
  writeFileSync(join(pkg, "package.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  writeFileSync(join(root, "package.json"), '{"private":true}\n');
  writeFileSync(join(root, "apps/website/package.json"), '{"private":true}\n');
  writeFileSync(join(root, "bun.lock"), "lockfile sentinel\n");
  writeFileSync(join(root, ".gitignore"), "packages/solux/dist/\n");
  for (const path of ["LICENSE", "README.md", "dist/index.js", "dist/index.d.ts"]) {
    writeFileSync(join(pkg, path), `fixture ${path}\n`);
  }
  return { root, pkg, manifest };
}

function git(root: string, ...args: string[]) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function repository() {
  const data = fixture();
  git(data.root, "init", "--initial-branch=main");
  git(data.root, "config", "user.name", "Release test");
  git(data.root, "config", "user.email", "release-test@example.invalid");
  git(data.root, "add", ".");
  git(
    data.root,
    "-c",
    "core.hooksPath=/dev/null",
    "-c",
    "commit.gpgsign=false",
    "commit",
    "-m",
    "test: fixture",
  );
  git(data.root, "-c", "tag.gpgsign=false", "tag", "-a", "v4.0.1", "-m", "fixture");
  git(data.root, "update-ref", "refs/remotes/origin/main", "HEAD");
  return data;
}

function archive(root: string, pkg: string, files: string[]) {
  const staging = join(root, "staging/package");
  mkdirSync(staging, { recursive: true });
  for (const file of files) {
    const parent = file.includes("/")
      ? join(staging, file.slice(0, file.lastIndexOf("/")))
      : staging;
    mkdirSync(parent, { recursive: true });
    writeFileSync(join(staging, file), readFileSync(join(pkg, file)));
  }
  const target = join(root, "solux.tgz");
  execFileSync("tar", ["-czf", target, "-C", join(root, "staging"), "package"]);
  return target;
}
const packageFiles = ["package.json", "LICENSE", "README.md", "dist/index.js", "dist/index.d.ts"];

test("version preparation changes only the public package version, preserving its exports", () => {
  const { root, pkg, manifest } = fixture();
  setReleaseVersion("4.1.0", root);
  expect(JSON.parse(readFileSync(join(pkg, "package.json"), "utf8"))).toEqual({
    ...manifest,
    version: "4.1.0",
  });
  expect(readFileSync(join(root, "package.json"), "utf8")).toBe('{"private":true}\n');
  expect(readFileSync(join(root, "apps/website/package.json"), "utf8")).toBe('{"private":true}\n');
  expect(readFileSync(join(root, "bun.lock"), "utf8")).toBe("lockfile sentinel\n");
});

test("invalid versions, prereleases, and non-increasing versions never write the manifest", () => {
  const { root, pkg } = fixture();
  const original = readFileSync(join(pkg, "package.json"), "utf8");
  for (const version of [
    "4.0.1",
    "3.9.9",
    "v4.1.0",
    "04.1.0",
    "4.1.0-beta.1",
    "4.1.0+build",
    "4.1.0\n",
    "4.1.0; touch bad",
    "9007199254740992.0.0",
  ]) {
    expect(() => setReleaseVersion(version, root)).toThrow();
  }
  expect(readFileSync(join(pkg, "package.json"), "utf8")).toBe(original);
});

test("version preparation refuses a private or renamed package", () => {
  const { root, pkg, manifest } = fixture();
  for (const changed of [
    { ...manifest, private: true },
    { ...manifest, name: "solux" },
  ]) {
    writeFileSync(join(pkg, "package.json"), JSON.stringify(changed));
    expect(() => setReleaseVersion("4.1.0", root)).toThrow("public @carere/solux");
  }
});

test("tag validation rejects version mismatches and shell-shaped inputs", () => {
  const { root } = fixture();
  checkReleaseTag("v4.0.1", root);
  for (const tag of [
    "4.0.1",
    "v4.0.2",
    "v4.0.1-beta.1",
    "v4.0.1\n",
    "v4.0.1$(touch bad)",
    "--help",
  ]) {
    expect(() => checkReleaseTag(tag, root)).toThrow();
  }
});

test("release verification accepts an annotated tag on main and rejects staged or unstaged changes", () => {
  const { root, pkg } = repository();
  expect(checkRelease("v4.0.1", true, root)).toBe(git(root, "rev-parse", "HEAD"));
  writeFileSync(join(pkg, "README.md"), "dirty\n");
  expect(() => checkRelease("v4.0.1", true, root)).toThrow();
  git(root, "add", "packages/solux/README.md");
  expect(() => checkRelease("v4.0.1", true, root)).toThrow();
});

test("release verification requires an existing tag on HEAD and main ancestry", () => {
  const { root } = repository();
  git(root, "checkout", "-b", "unreviewed");
  git(
    root,
    "-c",
    "core.hooksPath=/dev/null",
    "-c",
    "commit.gpgsign=false",
    "commit",
    "--allow-empty",
    "-m",
    "test: unreviewed",
  );
  expect(() => checkRelease("v4.0.1", false, root)).toThrow("checked-out commit");
  git(root, "-c", "tag.gpgsign=false", "tag", "--force", "v4.0.1");
  expect(() => checkRelease("v4.0.1", true, root)).toThrow();
  git(root, "tag", "--delete", "v4.0.1");
  expect(() => checkRelease("v4.0.1", false, root)).toThrow();
});

test("archive verification accepts the built package and detects stale build bytes", () => {
  const { root, pkg } = fixture();
  const target = archive(root, pkg, packageFiles);
  checkReleaseArchive(target, root);
  writeFileSync(join(pkg, "dist/index.js"), "changed build\n");
  expect(() => checkReleaseArchive(target, root)).toThrow("differs from the verified build");
});

test("archive verification rejects missing declarations and leaked source files", () => {
  const { root, pkg } = fixture();
  const target = archive(
    root,
    pkg,
    packageFiles.filter((file) => file !== "dist/index.d.ts"),
  );
  expect(() => checkReleaseArchive(target, root)).toThrow("missing dist/index.d.ts");
  writeFileSync(join(pkg, "source.ts"), "private source fixture\n");
  archive(root, pkg, [...packageFiles, "source.ts"]);
  expect(() => checkReleaseArchive(target, root)).toThrow("Unexpected archive entry");
});
