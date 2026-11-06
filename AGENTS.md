# Working in Solux

Solux is the `@carere/solux` state management library for SolidJS. Read
[CODING_STANDARD.md](CODING_STANDARD.md) before changing code and
[the workspace guide](docs/agents/workspace.md) before choosing commands.

The workspace uses Bun + Moon: `packages/solux` owns the public package,
`apps/website` owns the Solid documentation site, and root tooling is shared.
Use the checked-in manifests and Moon configuration for project commands.
Package count does not imply separate domains.

Keep changes scoped to the request. Preserve the public package name, exports,
type inference, and existing Gurafu adoption fixes. Report the checks actually
run and their results; distinguish anticipated commands from verified ones.

## Agent skills

Skills are vendored in `.agents/skills/`; provenance, the exact copied inventory,
and known upstream gaps are in [the skills README](.agents/skills/README.md).
Keep vendor resources unchanged and put Solux configuration in repository docs.
Use relevant skills when requested or applicable; installing them does not run
their workflows or require the setup questionnaire. User scope and active
environment/tool instructions take precedence over vendor workflow defaults.

### Issue tracker

Issues and specs live in GitHub Issues for `carere/solux`. Read
[the tracker guide](docs/agents/issue-tracker.md) before ticket work. Installing
skills does not authorize creating issues, comments, labels, or other external
writes.

### Triage labels

Use the five canonical roles mapped in
[the triage guide](docs/agents/triage-labels.md). The mapping is configuration,
not a claim that those labels have been provisioned in GitHub.

### Domain docs

Solux has one core state/event domain. Read
[the domain guide](docs/agents/domain.md) before domain or architecture work.
Do not create speculative context documents or ADRs as part of skill setup.
