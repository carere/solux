# Triage labels

The skills use five canonical triage roles. Map them directly to these label
strings in `carere/solux`:

| Label in mattpocock/skills | Label in our tracker | Meaning |
| --- | --- | --- |
| `needs-triage` | `needs-triage` | Maintainer needs to evaluate this issue |
| `needs-info` | `needs-info` | Waiting on reporter for more information |
| `ready-for-agent` | `ready-for-agent` | Fully specified, ready for an AFK agent |
| `ready-for-human` | `ready-for-human` | Requires human implementation |
| `wontfix` | `wontfix` | Will not be actioned |

When a skill mentions a role, use the corresponding tracker string. This is the
mapping from Gurafu's setup template, not evidence that labels already exist in
GitHub. Installation does not create or edit labels. Additional workflow labels
such as `wayfinder:map` are not extra triage roles and require an authorized
workflow before use.
