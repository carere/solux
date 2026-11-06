# Releases and deployment checks

Only `packages/solux` is published as `@carere/solux`. The root workspace and
`apps/website` stay private. This tooling migration leaves the package at
**4.0.1** and preserves all existing release tags and `CHANGELOG.md` history.
Cocogitto replaces Knope and commitlint; there is no automatic publication on a
push, tag, or merged PR.

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

## External setup before the first release

These settings are required but are not provisioned by the workflows:

1. Protect `main` with reviewed PRs and required Quality Assurance and commit
   metadata checks. Restrict who can create or modify `v*` release tags.
2. Create a GitHub environment named **`npm`**, require maintainer approval,
   prevent self-approval, and limit deployment branches to `main`. The publish
   job names this environment; without configured protection GitHub does not
   supply an approval gate automatically.
3. In the existing `@carere/solux` npm package settings, configure its GitHub
   trusted publisher for owner **`carere`**, repository **`solux`**, workflow
   filename **`release.yml`**, and environment **`npm`**. Permit direct
   `npm publish` if npm offers an allowed-actions setting. Verify the actual
   package settings rather than copying another repository's trust relationship.
4. Allow GitHub Actions to create PRs if using Prepare Release PR. Its scoped
   `GITHUB_TOKEN` needs contents and pull-request write permissions. No PAT or
   npm token is required.

The publish job uses a GitHub-hosted runner, `id-token: write`, and the explicitly
pinned Node 24.22.1 and npm 11.19.1 from `.prototools`. Proto does not expose
Node's bundled npm by default, so npm is installed as a separate pinned tool.
Both the prerequisite check and publication use `proto run npm -- ...` to avoid
the runner image's ambient npm. It also checks npm is at least 11.5.1. Trusted
publishing needs Node 22.14.0 or newer; the pinned Node 24.22.1 meets this minimum.
See [npm's trusted publishing setup](https://docs.npmjs.com/trusted-publishers/)
for identity matching and configuration expiry requirements. This file does not
assert that the environment or trusted publisher already exists.

## Prepare a reviewed release

1. Ensure the intended changes and CI modernization are merged into `main`.
   Start **Prepare Release PR** (`pre-release.yml`) manually on `main`.
2. On the first preparation, the workflow adds Cocogitto's required separator
   above the legacy changelog in a local migration commit. Every original byte
   is retained; preparation verifies this before pushing its branch.
   Cocogitto then chooses the next stable version from commits since the latest
   version tag, updates only `packages/solux/package.json` via
   `scripts/set-release-version.ts`, refreshes `bun.lock` with scripts disabled,
   and adds a changelog entry. It makes a local release commit and tag.
3. The workflow pushes only the `release/vX.Y.Z` branch and opens a PR containing
   version, lockfile, and changelog changes. It does **not** push its local tag,
   create a GitHub release, deploy the website, or publish to npm. An existing
   open release branch PR blocks preparation of another release.
4. Review the version and complete changelog, including retained older entries
   and any existing Unreleased notes. Cocogitto's generated entry does not
   replace a maintainer's review of those notes.
5. PRs created with `GITHUB_TOKEN` do not trigger automatic PR checks. Manually
   run **Quality Assurance** on the release branch and inspect its results before
   merging. To trigger the normal PR checks, a maintainer can close and reopen
   the prepared PR using their own GitHub identity. Do not bypass required
   checks. Keep the release PR title Conventional Commit compliant.
6. Merge the reviewed release PR. **Merging does not publish or create a tag.**

[Cocogitto's bump procedure](https://docs.cocogitto.io/guide/bump.html) appends a
release entry and records pre-bump hook changes in its release commit. The
version helper refuses unchanged versions, downgrades, prereleases, and changes
to a renamed or private package. Do not run `cog bump` in a dirty working tree.

## Publish the reviewed existing tag

After the release PR is merged and its checks pass, a maintainer creates the tag
on the **reviewed merged commit**, not on the preparation branch's old commit.
For example, in a clean checkout with current `origin/main` (replace the example
version and commit with the reviewed values):

```sh
git fetch origin main --tags
git switch --detach <reviewed-main-commit>
git merge-base --is-ancestor HEAD origin/main
git tag -a vX.Y.Z -m 'Release vX.Y.Z'
RELEASE_TAG=vX.Y.Z bun scripts/check-release.ts --require-main
git push origin refs/tags/vX.Y.Z
```

Tag creation alone does nothing. Start **Release to npm** (`release.yml`)
manually, select **main**, and supply that existing tag as `release_tag`.
The workflow rejects malformed or mismatched tags, missing tags, tags off
`main`, and dirty tracked files. It resolves one exact commit and runs the full
Quality Assurance workflow against it before requesting `npm` environment
approval. Review the selected tag, commit, and check results when approving.

After approval the job rechecks the tag, installs frozen dependencies, builds
fresh artifacts, and reruns strict packed consumers. It packs only
`packages/solux`, checks required runtime/declaration/readme/license files,
rejects source/website leakage, compares every packed file to the build, and
checks tracked-file cleanliness. npm publishes that verified tarball with OIDC
and provenance. The workflow never creates, moves, or pushes a tag and does not
create or modify a GitHub release.

Publication is irreversible. If a run fails before npm publication, fix the
cause and manually rerun with the same immutable tag. If npm may already have
accepted the version, inspect the registry before retrying; an existing version
cannot be replaced, and this workflow does not automatically skip publication
or silently retag it. A source fix requires a new reviewed version and tag.

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
