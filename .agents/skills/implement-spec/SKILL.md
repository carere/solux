---
name: implement-spec
description: "Implement the result of /to-spec and /to-tickets in code."
disable-model-invocation: true
---

You have been provided a spec. This spec should have tickets associated with it, describing how to implement the spec.

The issue tracker should have been provided to you. If not, tell the user to run `/setup-matt-pocock-skills`.

The goal is the entire spec implemented on a single **integration branch** (the spec branch), with each ticket resolved as its verified work lands there.

The tickets are not a list of steps. They are a **task graph** with blocking relationships between them. This means there is always a **frontier** of tickets which are ready to be grabbed.

Start every subagent with a fresh context window.

Communication to and from subagents should be sparse. Communicate primarily through **context pointers**: to the spec, tickets, research notes, and previous commits. Don't duplicate information already available via pointers.

**Implementer subagents** should be run in the background where possible for maximum concurrency.

## Steps

1. Read the spec and tickets to understand the task graph.

2. (optional) Use an **exploration subagent** to conduct any exploration required by the tickets - relevant codebase files or external documentation. Ensure the exploration subagent can save files - it should save its markdown notes in a directory outside the repo, accessible by all future subagents. This lets **implementer subagents** focus on implementation rather than exploration.

3. Create the integration branch. If the issue tracker closes work through PRs, or the user asks for one, open a draft PR after the first merge in step 5 (a branch with no commits ahead of main can't open one), marked as closing only the parent spec issue, if one exists.

4. Use a fresh **implementer subagent** for each ticket, each in its own worktree on its own branch. Each implementer subagent:
   - confirms its worktree is based on the integration branch before starting, and resets onto it if not;
   - calls the Skill tool with `tdd` to build the ticket;
   - merges the integration branch tip into its own branch and reports verification results before reporting done;
   - leaves its ticket open for resolution after the merge in step 5.

5. Once an **implementer subagent** completes, merge its work to the integration branch with a **merger subagent**, then resolve its ticket:
   - Confirm its work is on the integration branch and verify its acceptance criteria and required checks on the merged result. If the merge or verification fails, keep the ticket open while fixing it.
   - Immediately record the integration branch, merged commit, and verification results in the configured tracker, then close the ticket (or mark its local file done). Confirm the tracker records it as closed before treating it as resolved.
   - Close tickets here even when a draft PR exists, rather than waiting for the integration branch to merge into the default branch.

6. Recompute the **frontier** after each confirmed ticket closure, and kick off more **implementer subagents** for newly available tickets. Start a dependent ticket only when all its blockers are confirmed closed. If tracker closure fails, report the failure and keep that ticket's dependents blocked until closure is confirmed.

7. Once all tickets are complete, call the Skill tool with `code-review` on the integration branch. Fix all issues raised by the code review in a single fresh **implementer subagent**.

8. Confirm every ticket is closed. If a draft PR exists, mark it ready for review. Otherwise, report the integration branch and resolved tickets. Keep the parent spec issue open until the integration branch is merged into the repository's default branch.

9. Clean up all **implementer subagent** worktrees.
