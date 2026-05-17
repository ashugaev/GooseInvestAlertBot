# Contributing

Thanks for considering a contribution! This is a hobby/community project, so
the bar to entry is intentionally low.

## Workflow

1. Open an issue first if the change is non-trivial. For typos and small
   fixes, just open a PR.
2. Fork the repo and create a topic branch off `master`:
   ```
   git checkout -b add-volume-alerts
   ```
   Use short, kebab-case names. There's no enforced prefix scheme.
3. Make the change. Keep one feature per PR.
4. Run the checks locally before pushing:
   ```
   npm run lint
   npm test
   npm run build
   ```
5. Open a PR against `master` with a description of the change and why.

CI runs the same checks on every PR. Don't merge while CI is red — fix the
failure even if it predates your branch.

## Code style

See [`CLAUDE.md`](CLAUDE.md) for the full set of conventions. Highlights:

- **English only** for all code, comments, identifiers, log messages, and
  commit messages. User-facing strings live in [`locales/`](locales/).
- **No semicolons**, single quotes, sorted imports.
- **Path aliases** (`@/*` → `src/*`). Don't reintroduce `../../` imports —
  the lint rule will reject them.
- **Tests are mandatory** for any function you add or change. Keep tests pure:
  no live Mongo, no live network, no transitive imports of `src/app.ts`. If
  the function has heavy collaborators, extract a pure dep-injected helper
  and test that.

## Commit messages

Plain, English, imperative ("Add volume alerts", not "Added volume alerts").
No required prefix.

## Reporting bugs

Open an [issue](https://github.com/ashugaev/GooseInvestAlertBot/issues) with:

- What you did (commands run, configuration).
- What you expected.
- What actually happened (logs, screenshots, stack traces).
- Versions: Node, MongoDB, OS, exchange involved if relevant.

## Security issues

See [`SECURITY.md`](SECURITY.md) — please don't open public issues for
vulnerabilities.
