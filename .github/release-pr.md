## Summary

```text
Cocogitto
  packages/solux/package.json + bun.lock -> next stable version
  CHANGELOG.md -> changes since the previous release
  review and merge -> eligible for a separate manual release
```

## Evidence

- **Before:** `main` contained unreleased Conventional Commits.
  **After:** `cog bump --auto` prepared the version, lockfile, and changelog.
  The preparation run is linked below. Run Quality Assurance on this branch
  and review its results before merging; PRs created with `GITHUB_TOKEN` do
  not automatically trigger other workflows.

## Merge Danger

**Door:** two-way

Merging changes release metadata. A maintainer must separately create the tag,
start Release to npm on `main`, and approve the `npm` environment to publish.

**Blast Radius:** package

The subsequent npm publication is irreversible; the merge itself does not publish.
