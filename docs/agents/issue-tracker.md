# Issue tracker: GitHub

Issues and specs live in GitHub Issues for `carere/solux`. Use `gh` for ticket
operations when available. Explicitly scope commands with `--repo carere/solux`
or API paths under `repos/carere/solux`; do not depend on a fork's default target.
Installing skills or reading a ticket does not authorize external writes.

## Conventions

- Read: `gh issue view <number> --repo carere/solux --json number,title,body,labels,comments`.
- List: `gh issue list --repo carere/solux --state open --json number,title,body,labels,comments`
  with appropriate state/label filters.
- When authorized to create an issue, check the target first with
  `gh repo view carere/solux --json nameWithOwner`. Never file Solux work in
  `carere/gurafu`, `mattpocock/skills`, or a dependency's tracker by default.
- Create: `gh issue create --repo carere/solux --title "..." --body-file <file>`.
  Write exact multiline issue bodies, comments, and edits to a temporary file
  and pass `--body-file`; preserve real newlines and literal text.
- Comment: `gh issue comment <number> --repo carere/solux --body-file <file>`.
- Apply/remove labels: `gh issue edit <number> --repo carere/solux --add-label "..."`
  or `--remove-label "..."`. Use [the five triage roles](triage-labels.md).
- Close: post the explanation with `gh issue comment ... --body-file <file>`,
  then `gh issue close <number> --repo carere/solux`. On an already closed issue,
  `gh issue close --comment` can drop the comment while still exiting 0.
- For `/implement-spec`, resolve tickets at the point that workflow defines;
  comment, close, and confirm with
  `gh issue view <number> --repo carere/solux --json state`. Closing keywords on
  a merge into a spec branch do not themselves close an issue; they take effect
  when merged into the default branch.

## Sub-issues and blockers

Where supported by the installed `gh` (the source template specifies 2.94+),
create a child with `gh issue create --repo carere/solux --parent <parent> ...`
or link it with `gh issue edit <parent> --repo carere/solux --add-sub-issue <child>`.
Use native dependencies with `--blocked-by <n>,<n>` at creation or
`gh issue edit <child> --repo carere/solux --add-blocked-by <blocker>`.
Check command help before relying on these flags.

On older clients, the API fallbacks from the template are:

```sh
gh api --method POST repos/carere/solux/issues/<parent>/sub_issues -F sub_issue_id=<child-db-id>
gh api --method POST repos/carere/solux/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>
```

These IDs are numeric database IDs from
`gh api repos/carere/solux/issues/<n> --jq .id`, not issue numbers or node IDs.
If native relationships are unavailable, use `Part of #<parent>` and
`Blocked by: #<n>, #<n>` at the top of the child body and a task list in the
parent. A ticket is startable only when every blocker is closed.

For native open-blocker counts use
`gh api repos/carere/solux/issues/<n> --jq .issue_dependencies_summary.blocked_by`.
If using `gh issue view ... --json blockedBy`, filter to open nodes before
counting; the field can include closed blockers.

## Pull requests as a triage surface

**PRs as a request surface: no.** External PRs are not automatically feature
requests. An explicitly named PR can still be reviewed or triaged as requested.
GitHub shares issue and PR numbers; resolve an ambiguous `#<number>` with
`gh pr view <number> --repo carere/solux`, falling back to `gh issue view`.

## Skill operations

When a skill says "publish to the issue tracker", it means create a GitHub
issue under the current task's authorization. "Fetch the relevant ticket"
means read the issue as above. Do not publish just because a skill was installed.

For an authorized `/wayfinder` workflow, the map is one issue with label
`wayfinder:map`. Tickets are its sub-issues (or task-list entries with a
`Part of` backlink), using `wayfinder:research`, `wayfinder:prototype`,
`wayfinder:grilling`, or `wayfinder:task`. The frontier is the first open,
unassigned, unblocked child in map order. Claim with
`gh issue edit <n> --repo carere/solux --add-assignee @me`. Resolve by commenting
the answer, closing the child, and adding a linked summary to the map's
Decisions-so-far. Claiming, labeling, and resolving are external writes, not
installation steps.
