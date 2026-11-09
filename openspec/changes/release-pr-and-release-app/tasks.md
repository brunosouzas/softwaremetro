## 1. Release pull request and title

- [ ] 1.1 `Release PR` and `Title` workflows, `release-please-config.json`, `.release-please-manifest.json` (scenarios Caller and configuration, Title workflow): `test/unit/release-workflow.test.ts` (unit) reads the files
- [ ] 1.2 Release pull request without a release: covered by the existing detection test "A later merge with the same version" (the release pull request changes nothing on `main` until it merges); Title that is not a Conventional Commit: proven by the reusable workflow's own check on this repository's pull requests (the title `release: 0.9.0` fails it), no test here

## 2. Release app

- [ ] 2.1 Publishing job with the release app's token (scenarios Publishing job, Token before publishing, Contents only): `test/unit/release-workflow.test.ts` (unit)
- [ ] 2.2 Detection skips the release app's own tag (scenarios Tag pushed by the release app, Another bot or no bot name, Pushed tag and other refs): `test/unit/release-detect.test.ts` (unit), each guard proven by mutation

## 3. Documentation

- [ ] 3.1 `docs/release.md` (release pull request, release app, tag ruleset), `AGENTS.md` (`Model: 2 release PR`, titles)
