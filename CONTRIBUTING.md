# Contributing / release process

## Branching
- `main` is protected and always deployable. Never push to it directly.
- Work on a branch (`feature/...`, `fix/...`), open a pull request into `main`.
- The **CI** workflow (tests, build, deploy dry-run) must pass before merging.

## Environments
| Environment | Worker | URL | Deployed when |
| --- | --- | --- | --- |
| dev | `ryu-films-dev` | `https://ryu-films-dev.<subdomain>.workers.dev` | automatically after merge to `main` |
| production | `ryu-films` | https://ryufilms.com | after dev smoke tests pass **and** a reviewer approves |

Pipeline (`.github/workflows/deploy.yml`): tests → deploy dev → smoke test dev → (approval) → deploy production → smoke test production.

## Local commands
```sh
npm ci
npm test          # unit tests (node:test + jsdom)
npm run dev       # serve dist/ at http://localhost:3000
```

## One-time setup (repo owner)
1. **Disable Cloudflare's own Git build** for the `ryu-films` Worker (Settings → Builds → Disconnect). GitHub Actions is now the only deploy path.
2. Create a Cloudflare API token (template "Edit Cloudflare Workers"). In GitHub → Settings → Secrets and variables → Actions add secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
3. Add repository variable `DEV_URL` (the dev workers.dev URL).
4. GitHub → Settings → Environments: create `dev` and `production`; on `production` enable **Required reviewers** (yourself).
5. GitHub → Settings → Branches → add a rule for `main`: require a pull request, require the `test` status check, block force pushes.
6. Email: ryufilms.com needs Email Routing enabled and the destination address verified.

## Rollback
Revert the commit on `main` through a PR, or in Cloudflare → Worker → Deployments roll back to a previous version.