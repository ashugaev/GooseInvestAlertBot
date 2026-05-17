# Security policy

## Supported versions

Only the `master` branch is actively maintained. Historical tags and branches
do not receive security updates.

## Reporting a vulnerability

Please **do not open a public issue** for security problems.

Instead, report privately using one of:

- GitHub's [private security advisory](https://github.com/ashugaev/GooseInvestAlertBot/security/advisories/new)
  flow (preferred).
- Telegram DM to [@ashugaev](https://t.me/ashugaev).

When reporting, include:

- A description of the issue and its impact.
- Reproduction steps or a proof-of-concept.
- Any relevant logs / commit hashes / versions.

You can expect an initial response within a few days. Coordinated disclosure
is appreciated — please give the maintainer reasonable time to ship a fix
before publishing details.

## Secrets in commits

If you accidentally commit a secret (token, API key, session string, etc.):

1. Rotate / revoke the secret immediately at the issuing provider.
2. Open a private report (above) so the history can be rewritten if needed.

The repository runs [`gitleaks`](https://github.com/gitleaks/gitleaks) in CI
to catch obvious cases, but it isn't a substitute for care on your end.
