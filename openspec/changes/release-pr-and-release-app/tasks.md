## 0. Precondition

- [ ] 0.1 The tag `v0.1.0` of `brunosouzas/github-reusable-workflows` exists with the interface this change calls (input `environment`, secret `RELEASE_APP_PRIVATE_KEY`, variable `RELEASE_APP_CLIENT_ID`): `git ls-remote --tags https://github.com/brunosouzas/github-reusable-workflows v0.1.0` prints one line, and `gh api repos/brunosouzas/github-reusable-workflows/contents/.github/workflows/release-please.yml?ref=v0.1.0` holds `RELEASE_APP_PRIVATE_KEY`

## 1. Release pull request and title

- [ ] 1.1 `Release PR` and `Title` workflows, `release-please-config.json`, `.release-please-manifest.json` (scenarios Caller, Configuration, Manifest out of step, Title workflow, Title workflow on another event): `test/unit/release-workflow.test.ts` (unit) reads the files
- [ ] 1.2 A merge that does not change the version: the existing unit test for "A later merge with the same version" in `test/unit/release-detect.test.ts` (unit) proves it; no new test

## 2. Release app

- [ ] 2.1 Publishing job with the release app's token (scenarios Publishing job, Contents only, Token before publishing): `test/unit/release-workflow.test.ts` (unit)
- [ ] 2.2 Detection skips the release app's own tag (scenarios Tag pushed by the release app, Another actor, no actor or no bot name, Pushed tag and other refs): `test/unit/release-detect.test.ts` (unit); Workflow wiring: `test/unit/release-workflow.test.ts` (unit); each guard proven by mutation

## 3. Documentation

- [ ] 3.1 `docs/release.md` (release pull request, release app, tag ruleset with the app and the owner's admin bypass), `AGENTS.md`: `Model: 2 release PR`, the `Deliver and verify` line and the release rule rewritten for the release pull request (line 11 and line 26 today), Conventional Commit titles
