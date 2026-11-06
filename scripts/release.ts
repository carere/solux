import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { appendFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkRelease, checkReleaseArchive, checkReleaseTag } from "./check-release";
import { stableVersion } from "./set-release-version";

const repository = fileURLToPath(new URL("..", import.meta.url));
const repo = "carere/solux";

function git(root: string, ...args: string[]): string {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function github<T>(path: string, method = "GET", body?: object, optional = false): T | undefined {
  const result = spawnSync(
    "gh",
    ["api", `repos/${repo}/${path}`, "--method", method, ...(body ? ["--input", "-"] : [])],
    { input: body ? JSON.stringify(body) : undefined, encoding: "utf8" },
  );
  if (result.error) throw result.error;
  const data = result.stdout ? JSON.parse(result.stdout) : undefined;
  if (result.status !== 0) {
    if (optional && String(data?.status) === "404") return undefined;
    throw new Error(`GitHub ${method} ${path}: ${result.stderr}`);
  }
  return data as T;
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function output(values: Record<string, string>): void {
  const path = required("GITHUB_OUTPUT");
  appendFileSync(
    path,
    Object.entries(values)
      .map(([key, value]) => `${key}=${value}\n`)
      .join(""),
  );
}

function summary(text: string): void {
  appendFileSync(required("GITHUB_STEP_SUMMARY"), `${text}\n`);
}

export function releaseNotes(tag: string, root = repository): string {
  checkReleaseTag(tag, root);
  const changelog = readFileSync(`${root}/CHANGELOG.md`, "utf8");
  const heading = `## [${tag}](`;
  const start = changelog.indexOf(heading);
  if (start < 0) throw new Error(`Missing changelog entry for ${tag}.`);
  const entry = changelog
    .slice(start)
    .split(/^\s*- - -\s*$/m)[0]
    ?.trim();
  if (!entry) throw new Error(`Empty changelog entry for ${tag}.`);
  return entry;
}

export function verifyReleaseChanges(base: string, tag: string, root = repository): void {
  checkReleaseTag(tag, root);
  git(root, "diff", "--exit-code");
  git(root, "diff", "--cached", "--exit-code");
  if (git(root, "rev-parse", "HEAD^") !== base) {
    throw new Error("The release candidate must be one metadata commit on the dispatched commit.");
  }
  const allowed = new Set(["packages/solux/package.json", "bun.lock", "CHANGELOG.md"]);
  for (const path of git(root, "diff", "--name-only", base, "HEAD").split("\n")) {
    if (!allowed.has(path)) throw new Error(`Unexpected release change: ${path}`);
  }
  const previous = JSON.parse(git(root, "show", `${base}:packages/solux/package.json`));
  const current = JSON.parse(readFileSync(`${root}/packages/solux/package.json`, "utf8"));
  const oldVersion = stableVersion(previous.version);
  const nextVersion = stableVersion(current.version);
  const difference = nextVersion.findIndex((part, index) => part !== oldVersion[index]);
  if (difference < 0 || (nextVersion[difference] ?? 0) < (oldVersion[difference] ?? 0)) {
    throw new Error("The release candidate must increase the package version.");
  }
  previous.version = current.version;
  if (JSON.stringify(previous) !== JSON.stringify(current)) {
    throw new Error("Release preparation may only change the package version.");
  }
  const history = execFileSync("git", ["show", `${base}:CHANGELOG.md`], {
    cwd: root,
    encoding: "utf8",
  });
  const separator = /^- - -[ \t]*\r?\n/m.exec(history);
  if (!separator) throw new Error("The changelog is missing Cog's separator.");
  // Cog retains the document header once and prepends a new release above the
  // previous body. Preserve every historical entry, not a duplicate header.
  const body = history.slice(separator.index + separator[0].length).trimStart();
  if (!readFileSync(`${root}/CHANGELOG.md`, "utf8").endsWith(body)) {
    throw new Error("Release preparation must preserve existing changelog history.");
  }
  releaseNotes(tag, root);
}

interface PullRequest {
  number: number;
  title: string;
  merged_at: string | null;
  merge_commit_sha: string | null;
  state: string;
  head: { sha: string; ref: string; repo: { full_name: string } };
  base: { ref: string };
}

function prepare(root: string): void {
  const base = required("GITHUB_SHA");
  const branch = `release/run-${required("GITHUB_RUN_ID")}`;
  const existing = git(root, "ls-remote", "--heads", "origin", `refs/heads/${branch}`);
  if (existing) {
    git(root, "fetch", "origin", branch);
    git(root, "checkout", "--detach", "FETCH_HEAD");
  } else {
    const pending = github<PullRequest[]>("pulls?state=open&base=main&per_page=100") ?? [];
    if (pending.some((pr) => pr.head.ref.startsWith("release/"))) {
      throw new Error("A release PR is already open. Rerun its release workflow instead.");
    }
    if (git(root, "rev-parse", "origin/main") !== base) {
      throw new Error("main advanced after dispatch. Start a new release run.");
    }
    git(root, "switch", "-C", "main", base);
    execFileSync("cog", ["bump", "--auto"], { cwd: root, stdio: "inherit" });
    if (git(root, "rev-parse", "HEAD") === base) {
      summary("No version-affecting commits since the latest release; nothing was published.");
      return;
    }
  }
  const version = JSON.parse(readFileSync(`${root}/packages/solux/package.json`, "utf8")).version;
  const tag = `v${version}`;
  verifyReleaseChanges(base, tag, root);
  execFileSync("cog", ["check", "--ignore-merge-commits", `${base}..HEAD`], { cwd: root });
  execFileSync("cog", ["verify", "--", `chore(release): ${tag}`], { cwd: root });
  if (!existing) git(root, "push", "origin", `HEAD:refs/heads/${branch}`);
  const pulls =
    github<PullRequest[]>(
      `pulls?state=all&base=main&head=${encodeURIComponent(`carere:${branch}`)}`,
    ) ?? [];
  let pr = pulls[0];
  if (!pr) {
    pr = github<PullRequest>("pulls", "POST", {
      base: "main",
      head: branch,
      title: `chore(release): ${tag}`,
      body: `${readFileSync(`${root}/.github/release-pr.md`, "utf8")}\nWorkflow: https://github.com/${repo}/actions/runs/${required("GITHUB_RUN_ID")}\n`,
    });
  }
  if (!pr || (pr.state === "closed" && !pr.merged_at)) {
    throw new Error("The release PR was closed without merging. Start a new release run.");
  }
  output({ tag, commit: git(root, "rev-parse", "HEAD"), pr: String(pr.number) });
}

function merge(root: string): void {
  const candidate = required("RELEASE_COMMIT");
  const tag = required("RELEASE_TAG");
  const number = required("RELEASE_PR");
  verifyReleaseChanges(required("GITHUB_SHA"), tag, root);
  if (git(root, "rev-parse", "HEAD") !== candidate) throw new Error("Candidate commit changed.");
  const pr = github<PullRequest>(`pulls/${number}`);
  if (
    !pr ||
    pr.head.sha !== candidate ||
    pr.head.repo.full_name !== repo ||
    pr.title !== `chore(release): ${tag}` ||
    pr.head.ref !== `release/run-${required("GITHUB_RUN_ID")}` ||
    pr.base.ref !== "main"
  ) {
    throw new Error("Release PR no longer matches the verified candidate.");
  }
  let commit = pr.merge_commit_sha;
  if (!pr.merged_at) {
    git(root, "fetch", "origin", "main");
    if (git(root, "rev-parse", "origin/main") !== required("GITHUB_SHA")) {
      throw new Error(
        "main advanced during verification. Close the stale release PR and start a new run.",
      );
    }
    // The reusable QA job checks the candidate, but its check run belongs to the
    // dispatch commit. Report its successful result on the exact candidate SHA.
    for (const context of ["All checks passed", "Conventional commits and PR title"]) {
      github(`statuses/${candidate}`, "POST", {
        state: "success",
        context,
        description: "Verified by the manual release workflow",
        target_url: `https://github.com/${repo}/actions/runs/${required("GITHUB_RUN_ID")}`,
      });
    }
    const result = github<{ merged: boolean; sha: string }>(`pulls/${number}/merge`, "PUT", {
      sha: candidate,
      merge_method: "squash",
      commit_title: `chore(release): ${tag}`,
      commit_message: "Version, lockfile, and changelog verified by the release workflow.",
    });
    if (!result?.merged)
      throw new Error("Release PR could not be merged under main's protection rules.");
    commit = result.sha;
  }
  if (!commit) throw new Error("Missing merged release commit.");
  git(root, "fetch", "origin", "main", "--tags");
  if (
    git(root, "rev-parse", `${candidate}^{tree}`) !== git(root, "rev-parse", `${commit}^{tree}`)
  ) {
    throw new Error("The merged tree differs from the verified release candidate.");
  }
  git(root, "checkout", "--detach", commit);
  const remoteTag = git(root, "ls-remote", "--tags", "origin", `refs/tags/${tag}`);
  if (!remoteTag) {
    git(root, "tag", "-a", tag, "-m", `Release ${tag}`);
    git(root, "push", "origin", `refs/tags/${tag}`);
  }
  checkRelease(tag, true, root);
  output({ commit });
}

interface RegistryVersion {
  name: string;
  version: string;
  dist: { tarball: string; integrity: string; attestations?: { url: string } };
}

export function verifyPublishedArchive(
  data: RegistryVersion,
  bytes: Buffer,
  tag: string,
  root = repository,
): void {
  checkReleaseTag(tag, root);
  if (data.name !== "@carere/solux" || data.version !== tag.slice(1))
    throw new Error("Registry version mismatch.");
  if (`sha512-${createHash("sha512").update(bytes).digest("base64")}` !== data.dist.integrity) {
    throw new Error("Published tarball integrity mismatch.");
  }
  // Compare file contents rather than gzip timestamps when recovering a publish.
  const temporary = mkdtempSync(join(tmpdir(), "solux-published-"));
  try {
    const path = join(temporary, "solux.tgz");
    writeFileSync(path, bytes);
    checkReleaseArchive(path, root);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}

export function verifyProvenance(payload: string, integrity: string, commit: string): void {
  const statement = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
  const digest = Buffer.from(integrity.slice("sha512-".length), "base64").toString("hex");
  if (
    !statement.subject?.some(
      (subject: { digest?: { sha512?: string } }) => subject.digest?.sha512 === digest,
    )
  ) {
    throw new Error("Provenance does not match the published tarball.");
  }
  const definition = statement.predicate?.buildDefinition;
  const workflow = definition?.externalParameters?.workflow;
  const dependencies: { digest?: { gitCommit?: string } }[] =
    definition?.resolvedDependencies ?? [];
  if (
    workflow?.repository !== `https://github.com/${repo}` ||
    workflow?.path !== ".github/workflows/release.yml" ||
    !dependencies.some((entry) => entry.digest?.gitCommit === commit)
  ) {
    throw new Error("Provenance does not match the release workflow and commit.");
  }
}

async function registryVersion(version: string): Promise<RegistryVersion | undefined> {
  const response = await fetch(
    `https://registry.npmjs.org/@carere%2fsolux/${version}?verify=${Date.now()}`,
  );
  if (response.status === 404) return undefined;
  if (!response.ok) throw new Error(`npm registry HTTP ${response.status}`);
  return response.json();
}

async function publish(root: string): Promise<void> {
  const tag = required("RELEASE_TAG");
  const archive = required("RELEASE_ARCHIVE");
  const commit = checkRelease(tag, true, root);
  checkReleaseArchive(archive, root);
  const version = tag.slice(1);
  if (!(await registryVersion(version))) {
    // A failed response can still mean npm accepted the upload. Verify registry
    // contents below before deciding whether the publication failed.
    const result = spawnSync(
      "proto",
      [
        "run",
        "npm",
        "--",
        "publish",
        archive,
        "--access",
        "public",
        "--provenance",
        "--ignore-scripts",
      ],
      {
        cwd: `${root}/packages/solux`,
        stdio: "inherit",
        // npm's provenance generator reads GITHUB_SHA, not git HEAD. The
        // dispatch predates the metadata merge; attest the actual source built.
        env: { ...process.env, GITHUB_SHA: commit },
      },
    );
    if (result.error) throw result.error;
  }
  let published: RegistryVersion | undefined;
  let payload: string | undefined;
  for (let attempt = 0; attempt < 31; attempt++) {
    published = await registryVersion(version);
    if (published?.dist.attestations?.url) {
      const response = await fetch(published.dist.attestations.url);
      if (response.ok) {
        const data = await response.json();
        payload = data.attestations?.find(
          (entry: { predicateType: string }) =>
            entry.predicateType === "https://slsa.dev/provenance/v1",
        )?.bundle?.dsseEnvelope?.payload;
        if (payload) break;
      } else if (response.status !== 404) throw new Error(`Provenance HTTP ${response.status}`);
    }
    if (attempt < 30) await Bun.sleep(10000);
  }
  if (!published || !payload)
    throw new Error(
      "npm publication or provenance is still unavailable. Rerun this workflow to resume.",
    );
  const response = await fetch(published.dist.tarball);
  if (!response.ok) throw new Error(`Published tarball HTTP ${response.status}`);
  verifyPublishedArchive(published, Buffer.from(await response.arrayBuffer()), tag, root);
  verifyProvenance(payload, published.dist.integrity, commit);
  const release = github<{ draft: boolean; prerelease: boolean; html_url: string }>(
    `releases/tags/${tag}`,
    "GET",
    undefined,
    true,
  );
  if (release && (release.draft || release.prerelease))
    throw new Error("An unexpected draft or prerelease already exists.");
  const created =
    release ??
    github<{ html_url: string }>("releases", "POST", {
      tag_name: tag,
      name: tag,
      make_latest: "true",
      body: `${releaseNotes(tag, root)}\n\n[npm package](https://www.npmjs.com/package/@carere/solux/v/${version})`,
    });
  summary(
    `Released **${tag}** from \`${commit}\`.\n\n- [npm](https://www.npmjs.com/package/@carere/solux/v/${version})\n- [GitHub Release](${created?.html_url})\n- Published tarball and provenance match the verified commit.`,
  );
}

if (import.meta.main) {
  if (required("GITHUB_REPOSITORY") !== repo) throw new Error("Releases must run in carere/solux.");
  switch (process.argv[2]) {
    case "prepare":
      prepare(repository);
      break;
    case "merge":
      merge(repository);
      break;
    case "publish":
      await publish(repository);
      break;
    default:
      throw new Error("Usage: bun scripts/release.ts prepare|merge|publish");
  }
}
