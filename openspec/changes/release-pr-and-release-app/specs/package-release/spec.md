## ADDED Requirements

### Requirement: Release pull request
A `Release PR` workflow SHALL run on every push to `main` and call `brunosouzas/github-reusable-workflows/.github/workflows/release-please.yml` at a `v*` tag with `skip-github-release: true`, passing `RELEASE_APP_PRIVATE_KEY` by name. `release-please-config.json` SHALL declare one package `.` of release type `node`, without the component in the tag, with `bump-minor-pre-major` and `CHANGELOG.md`; `.release-please-manifest.json` SHALL hold the published version.

#### Scenario: Caller and configuration
- **WHEN** the workflow and configuration files are read
- **THEN** the `Release PR` workflow runs on pushes to `main` only, uses the reusable workflow pinned to a `v*` tag with `skip-github-release: true` and the secret `RELEASE_APP_PRIVATE_KEY`, the configuration has release type `node`, `include-component-in-tag: false` and `bump-minor-pre-major: true`, and the manifest's version equals `version` in `package.json`

#### Scenario: Release pull request without a release
- **WHEN** a push to `main` updates the release pull request
- **THEN** the release workflow's detection answers `release=false`, because `version` did not change on `main`

### Requirement: Conventional Commit pull request titles
A `Title` workflow SHALL run on pull requests (opened, edited, synchronize, reopened) and call `brunosouzas/github-reusable-workflows/.github/workflows/pr-title.yml` at a `v*` tag with the job id `pr-title`.

#### Scenario: Title workflow
- **WHEN** the title workflow file is read
- **THEN** it runs on those pull request events only, with `permissions: {}`, and its job `pr-title` uses the reusable workflow pinned to a `v*` tag

#### Scenario: Title that is not a Conventional Commit
- **WHEN** a pull request is titled `release: 0.9.0`
- **THEN** the check `pr-title / conventional-commit` fails

### Requirement: Release app token
The publishing job SHALL make the token it gives the publishing script with `actions/create-github-app-token`, from the environment's `RELEASE_APP_CLIENT_ID` and `RELEASE_APP_PRIVATE_KEY`, for this repository only and with `permission-contents: write` as its only permission, after the checkout and the download.

#### Scenario: Contents only
- **WHEN** the release workflow file is read
- **THEN** the token step names `repositories: ${{ github.event.repository.name }}` and `permission-contents: write`, and no other `permission-*` input

### Requirement: Release app's own tag
The detection SHALL answer `release=false`, keeping `tag`, for a pushed tag whose actor equals the non-empty `RELEASE_APP_BOT` that the workflow sets to the release app's bot login (`stackledger-release[bot]`); the run that created the tag is already releasing it.

#### Scenario: Tag pushed by the release app
- **WHEN** the push is the tag `v0.2.0` and the actor is `stackledger-release[bot]`, equal to `RELEASE_APP_BOT`
- **THEN** the detection answers `release=false` with `tag=v0.2.0` and a line naming the actor

#### Scenario: Another bot or no bot name
- **WHEN** the tag `v0.2.0` is pushed by `other-app[bot]`, or `RELEASE_APP_BOT` is empty
- **THEN** the tag goes on with `release=true`

## MODIFIED Requirements

### Requirement: Publication of the checked tarball
A publishing job SHALL run only after the checks succeed, in the environment `npm` (owner approval), with `contents: read` and `id-token: write`. It SHALL check out the released commit for `scripts/release-publish.sh`, treat the artifact as data only, install and build nothing, run the script with the release app's token as `GH_TOKEN`, and publish the tarball with `npm publish <tarball> --provenance --access public --ignore-scripts` through OIDC; `NPM_TOKEN` is read only for the first version.

#### Scenario: Publishing job
- **WHEN** the release workflow file is read
- **THEN** the publishing job `needs` the detection and checks jobs, uses environment `npm`, has `contents: read`, checks out without credentials, makes the release app's token after the checkout and the download with `permission-contents: write` and no other permission, runs the script from the checkout with that token as `GH_TOKEN`, has no install or build step, and the script publishes with `--provenance` and `--ignore-scripts`

#### Scenario: Token before publishing
- **WHEN** the release workflow file is read
- **THEN** the token step reads `vars.RELEASE_APP_CLIENT_ID` and `secrets.RELEASE_APP_PRIVATE_KEY`, comes before the step that runs the publishing script, and `GH_TOKEN` is set from that step's output and nowhere from `github.token`, so a token step that fails stops the job before anything is published

### Requirement: Release on the version merge
`release.yml` SHALL run on pushes to `main` and on pushed tags `v*`. A first job with only `contents: read`, given the event values and the actor through `env`, SHALL answer `release` and `tag`: a pushed tag goes on unless `Release app's own tag` applies; a push to `main` goes on only when it is neither forced nor a non-fast-forward, changes `version` against the commit before the push, and `v<version>` does not exist. It prints one line saying why.

#### Scenario: The version merge releases
- **WHEN** a push to `main` moves `version` from `0.1.0` to `0.2.0` and no tag `v0.2.0` exists
- **THEN** the detection answers `release=true` and `tag=v0.2.0`

#### Scenario: A later merge with the same version
- **WHEN** a push to `main` leaves `version` at `0.2.0`, with or without the tag `v0.2.0`
- **THEN** the detection answers `release=false`, and the workflow runs neither the checks nor the publishing job

#### Scenario: Version whose tag exists
- **WHEN** a push to `main` changes `version` to `0.2.0` but the tag `v0.2.0` already exists
- **THEN** the detection answers `release=false`

#### Scenario: Several commits in one push
- **WHEN** one push to `main` carries the version change and a later commit
- **THEN** the detection answers `release=true` for the new version

#### Scenario: Forced or rewritten main
- **WHEN** the push to `main` is forced, or its previous tip is not an ancestor of the new one
- **THEN** the detection answers `release=false`

#### Scenario: Pushed tag and other refs
- **WHEN** the push is the tag `v0.2.0` by a person, a push to another branch, or a push to `main` whose previous commit is all zeros or not in the checkout
- **THEN** the tag goes on with `tag=v0.2.0`; the others answer `release=false`
