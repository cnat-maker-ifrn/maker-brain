# Contributing

## Branches

Two permanent branches exist in this repository:

- `main` — stable, production-ready code. Never commit directly to this branch.
- `develop` — continuous integration. All feature branches are merged here first.

### Naming convention

| Prefix | Purpose | Example |
|---|---|---|
| `feature/` | New functionality | `feature/maker-auth/jwt-authentication` |
| `fix/` | Bug fixes | `fix/maker-auth/403-patch-request` |
| `chore/` | Infrastructure, configs, tooling | `chore/docker-compose-setup` |

Always include the service name when the branch affects a specific service:

```
feature/maker-auth/rabbitmq-publisher
feature/maker-app/auth-consumer
fix/maker-app/consumer-reconnect
chore/maker-auth/dockerfile
```

---

## Workflow

```
feature/* → develop → main
```

1. Always branch off from `develop`
2. Open a Pull Request back to `develop` when done
3. At the end of each sprint, `develop` is merged into `main` if stable
4. Delete the branch after merging

---

## Commits

Write commits in English using Conventional Commits format:

```
feat: add CPF validation
fix: resolve 403 on PATCH request
chore: update RabbitMQ payload
refactor: remove unused import
```

Keep commits small and focused. One logical change per commit.

---

## Pull Requests

- PRs must target `develop`, never `main` directly
- The PR title must follow the same convention as commits
- Describe what was changed and why, not how
- Reference the related task or issue if applicable

---

## Definition of Done

A task is considered done when:

- Code is on the repository
- Tests are written and passing
- Swagger documentation is updated (if applicable)
- Runs without errors via Docker Compose
- No debug code or commented-out blocks left behind