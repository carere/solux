# Releases and deployment checks

Only `packages/solux` is published as `@carere/solux`. The root workspace and
`apps/website` stay private. Releases use one manually triggered **Release**
workflow (`release.yml`); pushes, tags, PR merges, and ordinary checks never
publish on their own. Website deployment is independent.

## Run a release

1. Merge the changes you want to release into `main`, using Conventional Commits.
2. Open GitHub Actions → **Release** → **Run workflow**, select **main**, and run it.
   There is no version input, release-tag input, or deployment approval.
3. Read the run summary for the npm version, GitHub Release, and verification result.

Cog chooses a stable version from commits since the latest reachable release tag:
`fix:` bumps patch, `feat:` bumps minor, and breaking changes bump major. Docs,
CI, and chore commits alone produce a successful no-op. Solux has one published
package, so workspace folders do not need independently versioned releases.
See [Cocogitto automatic versioning](https://docs.cocogitto.io/guide/bump.html).

The workflow updates the package version, lockfile, and changelog in a local
Cog commit. It pushes only an internal `release/run-<run-id>` branch, creates a
metadata-only PR, and runs the full reusable Quality Assurance workflow against
that exact candidate. It checks the candidate's Conventional Commit metadata
and the automatic PR title before reporting successful checks on that SHA.

The workflow merges the PR itself under the existing main branch rules. No
manual PR review or merge is required. It verifies the merged tree is identical
to the tested candidate, creates the immutable tag on the merged commit, builds
fresh artifacts, reruns strict packed consumers, and publishes the checked
tarball with npm OIDC and provenance. It waits up to five minutes for npm and
its provenance endpoint, compares downloaded package files with the fresh build,
and verifies the provenance identifies the tarball, workflow, and merged commit.
Only then does it create the GitHub Release using the same Cog changelog entry.

Existing changelog history is retained. Only the new version's entry is used
for GitHub notes; historical migration notes are not copied into every release.

## Configuration

- Keep `main` protected by PRs and the **All checks passed** and **Conventional
  commits and PR title** checks from GitHub Actions. Automated metadata PRs need
  no approving reviews. The workflow uses normal squash merges and does not
  bypass protections. If main advances during candidate verification, the
  workflow fails rather than releasing a different tree.
- Allow GitHub Actions to create PRs. Job permissions are scoped to preparing
  the branch/PR, recording candidate check results, merging/tagging, or publishing.
  No PAT or npm token is needed.
- Keep the GitHub environment **`npm`** restricted to `main`, with **no required
  reviewers or wait timer**. Manual workflow dispatch is the release authorization.
- Configure npm's trusted publisher for owner **`carere`**, repository **`solux`**,
  workflow **`release.yml`**, and environment **`npm`**. Allow direct `npm publish`.
  A new configuration needs its first successful publish within two days;
  recreate an expired one. See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/).

The workflow keeps the existing workflow filename and environment identity so
an established npm trusted publisher continues to match. Node and npm come from
`.prototools`; publication uses `proto run npm -- ...`, not the runner's ambient
npm. OIDC credentials and npm 11.5.1 or newer are checked before publication.

## Retry a failed run

Use **Re-run all jobs** on the same Release run. The run's branch retains the
original candidate so retrying does not calculate another version. Completed
merges and matching tags are reused; existing tags are never moved. Retain that
branch until publication and any retries are complete.

If npm already accepted the version, the workflow checks its integrity, packed
file contents, and source provenance before skipping the upload. An existing
version with different contents or provenance is an error. An npm network or
permission failure is not treated as a missing version. Existing public GitHub
Releases are retained, allowing a retry to finish a failed release-creation step.

If main advanced before the metadata PR could merge, close that stale PR and
start a new Release run from current main. A second dispatch is blocked while a
release PR remains open. Never force-push a tag or attempt to replace an npm
version. A source fix after publication requires another version.

## Checks

Quality Assurance runs on PRs, pushes to `main`, and manual dispatch. It installs
with `bun install --frozen-lockfile`, then runs:

```sh
bun sort-package-json --check package.json 'apps/*/package.json' 'packages/*/package.json'
bun biome check . --error-on-warnings
bun moon run solux:build website:build
bun tsc --noEmit
bun --bun knip
bun test scripts/tests
bun moon run solux:test-unit solux:test-unit-browser
bun moon run solux:test-package
(cd apps/website && bun playwright install --with-deps chromium)
bun moon run website:test-browser
(cd apps/website && bun wrangler deploy --dry-run)
git diff --exit-code
git diff --cached --exit-code
```

These are the workflow's commands, not a record that they have all passed
locally. The build precedes TypeScript and Knip because the website consumes the
library's public built exports. `test-package` creates temporary consumers,
installs their dependencies, and checks declarations with `skipLibCheck: false`
in NodeNext and Bundler modes plus server/browser runtime resolution.
The CI deployment check runs Wrangler directly with `--dry-run` and uploads
nothing. The equivalent local Moon target is `website:deploy-check`; it currently
sets `runInCI: false`, which Moon 2.6.5 also applies to explicit CI targets.

Release helper tests are included in root TypeScript checking through
`scripts/**/*.ts`. They run with `bun test scripts/tests`; no install, network,
publish, or changes to this checkout are needed. Git commits/tags used by these
tests are isolated disposable fixtures. Configure Knip to include `scripts/*.ts`
and `scripts/tests/*.ts` as entry points. The helpers only execute their command
line behavior when `import.meta.main` is true.

Commit metadata checks use PR base-to-head ranges, or the previous-to-current
commit range on pushes to `main`. A newly created `main` branch falls back to
`v4.0.1..HEAD`, preserving the historical release baseline without imposing the
new policy retroactively. Merge commits are ignored. PR titles use `cog verify`
with a quoted environment variable; PR bodies are not separately enforced.

## Cloudflare builds

Run Cloudflare's build from the **repository root**, with the pinned toolchain
available and a frozen workspace install:

```sh
bun install --frozen-lockfile
bash scripts/build-cloudflare.sh
```

The helper fetches `main` and creates a local base branch only when it is absent,
matching Moon's needs in shallow Cloudflare preview clones. It then runs
`bun moon run website:build`, including the library build dependency. Website
client/server output is in `apps/website/dist`, with generated deployment metadata
in `apps/website/.wrangler/deploy`. Use the site's Wrangler configuration and
Cloudflare Vite plugin output; deploying just the client assets drops SSR and
request-scoped language handling. CI only runs the deployment dry-run. Actual
Cloudflare account configuration and deployment are separate maintainer actions.
