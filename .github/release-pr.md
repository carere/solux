## Summary

```text
manual Release workflow
  Cog -> version + lockfile + changelog
  full QA -> automatic merge -> tag -> npm + GitHub Release
```

This metadata-only PR is managed by the Release workflow. No manual review or
merge is needed. The workflow records successful checks on its exact head commit
before merging under the existing main branch rules.

## Evidence

- **Before:** main contains version-affecting changes since the previous tag.
  **After:** Cog generated the next stable version and changelog. The linked
  workflow runs full Quality Assurance before merging and publishing.

## Merge Danger

**Door:** one-way

The workflow publishes the version to npm after merging. npm versions cannot be replaced.

**Blast Radius:** package
