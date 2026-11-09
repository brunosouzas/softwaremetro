# Release pull request and release app

## Why

Releases move to delivery model 2 (card AB#243): release-please keeps a release pull request from the Conventional Commit titles that reach `main`, so nobody sets the version by hand and every release carries its changelog. A pull request opened with `GITHUB_TOKEN` starts no checks, so release-please needs a GitHub App; the owner decided one app per repository (`brunosouzas-stackledger-release`, AB#251 Q1). The same app then creates the release tag, as in `brunosouzas-design-system` (AB#251, AB#243 Q4), so the `v*` tag ruleset can refuse every identity but the app and the owner, who keeps an admin bypass to tag by hand or retry (the manual tag path of `Release tags` stays).

## What Changes

- A `Release PR` workflow calls the reusable release-please workflow of `brunosouzas/github-reusable-workflows` (`@v0.1.0`) with `skip-github-release`, as the release app, in the environment `release-please` (deployment branch `main` only). Merging the release pull request changes `version`, so the unchanged detection releases it.
- A `Title` workflow fails a pull request whose title is not a Conventional Commit; the repository's squash merges use the title and the description.
- The publishing job writes to GitHub (the tag, the GitHub release) with a one-hour token of the release app, for this repository and Contents only; its own token drops to `contents: read`.
- The detection answers `release=false` for a tag pushed by the release app: a tag made with an app's token starts the workflow again, and the run that made it is already releasing.
- `AGENTS.md` declares `Model: 2 release PR`; `docs/release.md` describes the release pull request and the release app.

Out of scope: the title rule and the release-please logic (the reusable workflows at `v0.1.0`, in their own repository), the tag ruleset and the repository settings (applied by the owner's login after the merge, AB#243), the Hermes plugins (AB#318), any change to what the package contains.

## Implicit requirements

- Errors and invalid input: the publishing requirement keeps its error behaviour in `Completing a partial release` and `Tag reserved before publishing` (unchanged), so its MODIFIED text adds no error scenario; an empty Client ID or key stops the release pull request run at its first step with a named error (the reusable workflow); a release app that cannot create the tag stops the publishing job before npm (`Tag reserved before publishing`, unchanged).
- Limits: n/a, one release pull request per repository.
- Repetition and idempotency: release-please rewrites its pull request on every push; a re-run of the publishing job keeps `Completing a partial release` (unchanged); the app's own tag push releases nothing.
- Concurrency: unchanged (`One release of a version at a time`); the reusable workflow has its own concurrency group.
- Security: the app's key is only in the environments `release-please` (main only) and `npm` (owner approval); the minted token reaches this repository and Contents only and is revoked at the job's end.
- Logs and observability: the detection's line names the release app when it skips its tag.

## Documentation

`docs/release.md`, `AGENTS.md`, `CHANGELOG.md` (created by release-please); brain: the stackledger changelog and roadmap, `10-personal/processos/entrega-e-releases-v1.md` (model 2 rows).
