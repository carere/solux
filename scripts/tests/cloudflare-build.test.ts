import { expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const buildScript = fileURLToPath(new URL("../build-cloudflare.sh", import.meta.url));

test("Cloudflare builds restore main in a shallow single-branch clone and reuse it", () => {
  const root = mkdtempSync(join(tmpdir(), "solux-cloudflare-test-"));
  try {
    const source = join(root, "origin");
    const preview = join(root, "preview");
    const binaries = join(root, "bin");
    const log = join(root, "build.log");
    mkdirSync(source);
    mkdirSync(binaries);
    function git(cwd: string, ...args: string[]) {
      return execFileSync("git", args, {
        cwd,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }).trim();
    }
    git(source, "init", "--initial-branch=main");
    git(source, "config", "user.name", "Cloudflare test");
    git(source, "config", "user.email", "cloudflare-test@example.invalid");
    git(
      source,
      "-c",
      "core.hooksPath=/dev/null",
      "-c",
      "commit.gpgsign=false",
      "commit",
      "--allow-empty",
      "-m",
      "test: main fixture",
    );
    const main = git(source, "rev-parse", "HEAD");
    git(source, "checkout", "-b", "preview");
    git(
      source,
      "-c",
      "core.hooksPath=/dev/null",
      "-c",
      "commit.gpgsign=false",
      "commit",
      "--allow-empty",
      "-m",
      "test: preview fixture",
    );
    git(
      root,
      "clone",
      "--depth=1",
      "--single-branch",
      "--branch=preview",
      `file://${source}`,
      preview,
    );
    const head = git(preview, "rev-parse", "HEAD");
    expect(git(preview, "branch", "--list", "main")).toBe("");
    expect(git(preview, "branch", "--remotes", "--list", "origin/main")).toBe("");
    writeFileSync(
      join(binaries, "bun"),
      '#!/usr/bin/env bash\nprintf "%s\\n" "$*" >> "$SOLUX_BUILD_LOG"\n',
      { mode: 0o755 },
    );
    const env = { ...process.env, PATH: `${binaries}:${process.env.PATH}`, SOLUX_BUILD_LOG: log };
    execFileSync("bash", [buildScript], { cwd: preview, env, stdio: "pipe" });
    expect(git(preview, "rev-parse", "main")).toBe(main);
    expect(git(preview, "rev-parse", "HEAD")).toBe(head);
    // An existing main must allow a subsequent build even without a fetchable origin.
    git(preview, "remote", "remove", "origin");
    execFileSync("bash", [buildScript], { cwd: preview, env, stdio: "pipe" });
    expect(readFileSync(log, "utf8")).toBe("moon run website:build\nmoon run website:build\n");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
