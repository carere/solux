import { afterEach, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkRelease, checkReleaseArchive, checkReleaseTag } from "../check-release";
import {
  releaseNotes,
  verifyProvenance,
  verifyPublishedArchive,
  verifyReleaseChanges,
} from "../release";
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
  writeFileSync(join(root, "CHANGELOG.md"), "# Changelog\n\n- - -\n\nExisting release history.\n");
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

function candidate(root: string) {
  const base = git(root, "rev-parse", "HEAD");
  const history = readFileSync(join(root, "CHANGELOG.md"), "utf8");
  setReleaseVersion("4.1.0", root);
  writeFileSync(
    join(root, "CHANGELOG.md"),
    `# Changelog\n\n- - -\n## [v4.1.0](https://example.invalid/compare) - 2026-11-07\n#### Features\n- New feature\n\n- - -\n\n${history}`,
  );
  git(root, "add", ".");
  git(
    root,
    "-c",
    "core.hooksPath=/dev/null",
    "-c",
    "commit.gpgsign=false",
    "commit",
    "-m",
    "chore: release",
  );
  return base;
}

test("release candidates contain only version metadata and preserve changelog history", () => {
  const { root, pkg } = repository();
  const base = candidate(root);
  verifyReleaseChanges(base, "v4.1.0", root);
  expect(releaseNotes("v4.1.0", root)).toContain("New feature");
  expect(releaseNotes("v4.1.0", root)).not.toContain("Existing release history");
  const manifest = JSON.parse(readFileSync(join(pkg, "package.json"), "utf8"));
  manifest.exports = { ".": "./private.js" };
  writeFileSync(join(pkg, "package.json"), JSON.stringify(manifest));
  git(root, "add", ".");
  git(
    root,
    "-c",
    "core.hooksPath=/dev/null",
    "-c",
    "commit.gpgsign=false",
    "commit",
    "--amend",
    "--no-edit",
  );
  expect(() => verifyReleaseChanges(base, "v4.1.0", root)).toThrow(
    "only change the package version",
  );
});

test("release candidates reject source changes and a different dispatch base", () => {
  const { root, pkg } = repository();
  const base = candidate(root);
  expect(() => verifyReleaseChanges(git(root, "rev-parse", "HEAD"), "v4.1.0", root)).toThrow(
    "dispatched commit",
  );
  writeFileSync(join(pkg, "README.md"), "changed outside metadata\n");
  git(root, "add", ".");
  git(
    root,
    "-c",
    "core.hooksPath=/dev/null",
    "-c",
    "commit.gpgsign=false",
    "commit",
    "--amend",
    "--no-edit",
  );
  expect(() => verifyReleaseChanges(base, "v4.1.0", root)).toThrow("Unexpected release change");
});

test("published package recovery checks integrity and all packed file contents", () => {
  const { root, pkg } = fixture();
  const bytes = readFileSync(archive(root, pkg, packageFiles));
  const data = {
    name: "@carere/solux",
    version: "4.0.1",
    dist: {
      tarball: "https://example.invalid/solux.tgz",
      integrity: `sha512-${createHash("sha512").update(bytes).digest("base64")}`,
    },
  };
  verifyPublishedArchive(data, bytes, "v4.0.1", root);
  expect(() =>
    verifyPublishedArchive({ ...data, version: "4.0.2" }, bytes, "v4.0.1", root),
  ).toThrow("version mismatch");
  expect(() => verifyPublishedArchive(data, Buffer.from("wrong tarball"), "v4.0.1", root)).toThrow(
    "integrity mismatch",
  );
  writeFileSync(join(pkg, "dist/index.js"), "different build\n");
  expect(() => verifyPublishedArchive(data, bytes, "v4.0.1", root)).toThrow(
    "differs from the verified build",
  );
});

test("provenance must identify the tarball, release workflow, and exact source commit", () => {
  const integrity = `sha512-${createHash("sha512").update("tarball").digest("base64")}`;
  const digest = createHash("sha512").update("tarball").digest("hex");
  const commit = "a".repeat(40);
  const statement = {
    subject: [{ digest: { sha512: digest } }],
    predicate: {
      buildDefinition: {
        externalParameters: {
          workflow: {
            repository: "https://github.com/carere/solux",
            path: ".github/workflows/release.yml",
          },
        },
        resolvedDependencies: [{ digest: { gitCommit: commit } }],
      },
    },
  };
  const encode = () => Buffer.from(JSON.stringify(statement)).toString("base64");
  verifyProvenance(encode(), integrity, commit);
  expect(() => verifyProvenance(encode(), integrity, "b".repeat(40))).toThrow(
    "workflow and commit",
  );
  statement.predicate.buildDefinition.externalParameters.workflow.repository =
    "https://github.com/other/repo";
  expect(() => verifyProvenance(encode(), integrity, commit)).toThrow("workflow and commit");
  statement.subject = [{ digest: { sha512: "wrong" } }];
  expect(() => verifyProvenance(encode(), integrity, commit)).toThrow("published tarball");
});

for (const [message, expected] of [
  ["fix: resolve a regression", "4.0.2"],
  ["feat: add a capability", "4.1.0"],
  ["feat!: change the public API", "5.0.0"],
  ["docs: explain usage", "4.0.1"],
] as const) {
  test(`real Cog calculates ${expected} for ${message}`, () => {
    const { root, pkg } = fixture();
    mkdirSync(join(root, "scripts"));
    writeFileSync(
      join(root, "scripts/set-release-version.ts"),
      readFileSync(new URL("../set-release-version.ts", import.meta.url)),
    );
    writeFileSync(
      join(root, "cog.toml"),
      'tag_prefix = "v"\nbranch_whitelist = ["main"]\npre_bump_hooks = ["bun scripts/set-release-version.ts {{version}}"]\n\n[changelog]\npath = "CHANGELOG.md"\ntemplate = "remote"\nremote = "github.com"\nowner = "carere"\nrepository = "solux"\n',
    );
    git(root, "init", "--initial-branch=main");
    git(root, "config", "user.name", "Release test");
    git(root, "config", "user.email", "release-test@example.invalid");
    git(root, "config", "core.hooksPath", "/dev/null");
    git(root, "config", "commit.gpgsign", "false");
    git(root, "add", ".");
    git(root, "commit", "-m", "chore: baseline");
    git(root, "-c", "tag.gpgsign=false", "tag", "v4.0.1");
    git(root, "commit", "--allow-empty", "-m", message);
    const base = git(root, "rev-parse", "HEAD");
    execFileSync("cog", ["bump", "--auto"], { cwd: root, stdio: "pipe" });
    expect(JSON.parse(readFileSync(join(pkg, "package.json"), "utf8")).version).toBe(expected);
    if (expected === "4.0.1") {
      expect(git(root, "rev-parse", "HEAD")).toBe(base);
    } else {
      verifyReleaseChanges(base, `v${expected}`, root);
      expect(git(root, "describe", "--tags", "--exact-match")).toBe(`v${expected}`);
    }
  });
}

test("workflow retries reuse the candidate, merged tag, and accepted upload with mocked services", () => {
  const { root } = repository();
  const scratch = join(root, ".release-test");
  mkdirSync(join(scratch, "bin"), { recursive: true });
  writeFileSync(join(root, ".gitignore"), "packages/solux/dist/\n.release-test/\n");
  mkdirSync(join(root, "scripts"));
  for (const name of ["release.ts", "check-release.ts", "set-release-version.ts"]) {
    writeFileSync(
      join(root, "scripts", name),
      readFileSync(new URL(`../${name}`, import.meta.url)),
    );
  }
  mkdirSync(join(root, ".github"));
  writeFileSync(join(root, ".github/release-pr.md"), "Fixture release PR\n");
  writeFileSync(
    join(root, "cog.toml"),
    'tag_prefix = "v"\nbranch_whitelist = ["main"]\npre_bump_hooks = ["bun scripts/set-release-version.ts {{version}}"]\n\n[changelog]\npath = "CHANGELOG.md"\ntemplate = "remote"\nremote = "github.com"\nowner = "carere"\nrepository = "solux"\n',
  );
  git(root, "config", "core.hooksPath", "/dev/null");
  git(root, "config", "commit.gpgsign", "false");
  git(root, "add", ".");
  git(root, "commit", "-m", "feat: fixture capability");
  const base = git(root, "rev-parse", "HEAD");
  const remote = join(scratch, "origin.git");
  execFileSync("git", ["init", "--bare", remote], { stdio: "pipe" });
  git(root, "remote", "add", "origin", remote);
  git(root, "push", "--tags", "origin", "main");
  const gh = join(scratch, "bin/gh");
  writeFileSync(
    gh,
    `#!/usr/bin/env bun
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
const statePath = process.env.FIXTURE_STATE;
const state = existsSync(statePath) ? JSON.parse(readFileSync(statePath, "utf8")) : {statuses:[]};
const route = process.argv[3];
const method = process.argv[process.argv.indexOf("--method") + 1];
const body = process.argv.includes("--input") ? JSON.parse(readFileSync(0,"utf8")) : undefined;
const git = (...args) => execFileSync("git", args, {encoding:"utf8", stdio:["pipe","pipe","pipe"]}).trim();
let result;
if (route.includes("/pulls?")) result = state.pr ? [state.pr] : [];
else if (route.endsWith("/pulls") && method === "POST") {
  state.pr = {number:42,title:body.title,state:"open",merged_at:null,merge_commit_sha:null,head:{sha:git("rev-parse","HEAD"),ref:body.head,repo:{full_name:"carere/solux"}},base:{ref:"main"}};
  result = state.pr;
} else if (route.includes("/statuses/")) {
  state.statuses.push({sha:route.split("/").at(-1),...body}); result = {};
} else if (route.endsWith("/pulls/42/merge")) {
  if (body.sha !== state.pr.head.sha) throw new Error("Candidate moved");
  const tree = git("rev-parse", body.sha + "^{tree}");
  const commit = git("commit-tree", tree, "-p", process.env.GITHUB_SHA, "-m", body.commit_title);
  git("push", "origin", commit + ":refs/heads/main");
  Object.assign(state.pr,{merged_at:"fixture-time",merge_commit_sha:commit,state:"closed"});
  result = {merged:true,sha:commit};
} else if (route.endsWith("/pulls/42")) result = state.pr;
else if (route.includes("/releases/tags/")) {
  if (state.release) result = state.release;
  else {console.log(JSON.stringify({status:"404",message:"Not Found"}));process.exit(1);}
} else if (route.endsWith("/releases") && method === "POST") {
  state.releaseCreations = (state.releaseCreations ?? 0) + 1;
  state.release = {html_url:"https://example.invalid/release",draft:false,prerelease:false,body:body.body};
  result = state.release;
} else throw new Error("Unexpected mocked GitHub request: " + method + " " + route);
writeFileSync(statePath,JSON.stringify(state));
console.log(JSON.stringify(result));
`,
    { mode: 0o755 },
  );
  const output = join(scratch, "output");
  const env = {
    ...process.env,
    PATH: `${join(scratch, "bin")}:${process.env.PATH}`,
    FIXTURE_STATE: join(scratch, "state.json"),
    GITHUB_REPOSITORY: "carere/solux",
    GITHUB_SHA: base,
    GITHUB_RUN_ID: "123",
    GITHUB_OUTPUT: output,
    GITHUB_STEP_SUMMARY: join(scratch, "summary"),
    GH_TOKEN: "fixture-no-network",
  };
  function run(command: string, extra: Record<string, string> = {}) {
    writeFileSync(output, "");
    const preload = command === "publish" ? ["--preload", join(scratch, "fetch.ts")] : [];
    execFileSync(process.execPath, [...preload, join(root, "scripts/release.ts"), command], {
      cwd: root,
      env: { ...env, ...extra },
      stdio: "pipe",
    });
    return Object.fromEntries(
      readFileSync(output, "utf8")
        .trim()
        .split("\n")
        .map((line) => line.split("=")),
    );
  }
  const first = run("prepare");
  expect(first.tag).toBe("v4.1.0");
  const resumed = run("prepare");
  expect(resumed).toEqual(first);
  const extra = {
    RELEASE_COMMIT: first.commit ?? "",
    RELEASE_TAG: first.tag ?? "",
    RELEASE_PR: first.pr ?? "",
  };
  // The merge job uses a fresh checkout; Cog's unpublished local tag stays
  // in the prepare job. Only remote tags carry across jobs.
  git(root, "tag", "--delete", first.tag ?? "");
  const concurrent = git(
    root,
    "commit-tree",
    `${base}^{tree}`,
    "-p",
    base,
    "-m",
    "docs: concurrent change",
  );
  git(root, "push", "origin", `${concurrent}:refs/heads/main`);
  expect(() => run("merge", extra)).toThrow("main advanced during verification");
  expect(JSON.parse(readFileSync(env.FIXTURE_STATE, "utf8")).statuses).toHaveLength(0);
  // Restore only the disposable fixture remote to exercise a successful run.
  execFileSync("git", ["--git-dir", remote, "update-ref", "refs/heads/main", base]);
  const merged = run("merge", extra);
  expect(merged.commit).not.toBe(first.commit);
  expect(git(root, "rev-parse", "v4.1.0^{commit}")).toBe(merged.commit);
  expect(git(root, "rev-parse", `${merged.commit}^{tree}`)).toBe(
    git(root, "rev-parse", `${first.commit}^{tree}`),
  );
  const state = JSON.parse(readFileSync(env.FIXTURE_STATE, "utf8"));
  expect(
    state.statuses.map((status: { sha: string; context: string }) => [status.sha, status.context]),
  ).toEqual([
    [first.commit, "All checks passed"],
    [first.commit, "Conventional commits and PR title"],
  ]);
  expect(run("prepare")).toEqual(first);
  expect(run("merge", extra)).toEqual(merged);
  const publishedArchive = archive(root, join(root, "packages/solux"), packageFiles);
  writeFileSync(
    join(scratch, "bin/proto"),
    `#!/usr/bin/env bun
import {readFileSync,writeFileSync} from "node:fs";
const path = process.env.FIXTURE_STATE;
const state = JSON.parse(readFileSync(path,"utf8"));
if (process.env.GITHUB_SHA !== state.pr.merge_commit_sha) throw new Error("npm provenance would identify the wrong commit");
state.uploads = (state.uploads ?? 0) + 1;
state.accepted = true;
writeFileSync(path,JSON.stringify(state));
// Simulate npm accepting the upload before its response fails.
process.exit(1);
`,
    { mode: 0o755 },
  );
  writeFileSync(
    join(scratch, "fetch.ts"),
    `import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
globalThis.fetch = async (url) => {
  const state = JSON.parse(readFileSync(process.env.FIXTURE_STATE,"utf8"));
  const bytes = readFileSync(process.env.RELEASE_ARCHIVE);
  const integrity = "sha512-" + createHash("sha512").update(bytes).digest("base64");
  if (String(url).startsWith("https://registry.npmjs.org/@carere%2fsolux/")) {
    if (!state.accepted) return new Response("{}",{status:404});
    return Response.json({name:"@carere/solux",version:"4.1.0",dist:{integrity,tarball:"https://fixture.invalid/tarball",attestations:{url:"https://fixture.invalid/provenance"}}});
  }
  if (url === "https://fixture.invalid/tarball") return new Response(bytes);
  if (url === "https://fixture.invalid/provenance") {
    const statement = {subject:[{digest:{sha512:createHash("sha512").update(bytes).digest("hex")}}],predicate:{buildDefinition:{externalParameters:{workflow:{repository:"https://github.com/carere/solux",path:".github/workflows/release.yml"}},resolvedDependencies:[{digest:{gitCommit:state.pr.merge_commit_sha}}]}}};
    return Response.json({attestations:[{predicateType:"https://slsa.dev/provenance/v1",bundle:{dsseEnvelope:{payload:Buffer.from(JSON.stringify(statement)).toString("base64")}}}]});
  }
  throw new Error("Unexpected network request in fixture: " + url);
};
`,
  );
  run("publish", { ...extra, RELEASE_ARCHIVE: publishedArchive });
  run("publish", { ...extra, RELEASE_ARCHIVE: publishedArchive });
  const published = JSON.parse(readFileSync(env.FIXTURE_STATE, "utf8"));
  expect(published.uploads).toBe(1);
  expect(published.releaseCreations).toBe(1);
  expect(published.release.body).toContain("v4.1.0");
  expect(readFileSync(env.GITHUB_STEP_SUMMARY, "utf8")).toContain(
    merged.commit ?? "missing commit",
  );
});
