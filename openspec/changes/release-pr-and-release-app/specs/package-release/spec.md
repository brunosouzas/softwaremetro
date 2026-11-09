## ADDED Requirements

### Requirement: Release pull request
A `Release PR` workflow with `permissions: {}` SHALL run on every push to `main` and call `brunosouzas/github-reusable-workflows/.github/workflows/release-please.yml@v0.1.0` with `skip-github-release: true`, its default environment `release-please`, and `secrets: RELEASE_APP_PRIVATE_KEY: ${{ secrets.RELEASE_APP_PRIVATE_KEY }}`.

#### Scenario: Caller
- **WHEN** the workflow file is read
- **THEN** the `Release PR` workflow has `permissions: {}`, runs on pushes to `main` only, and uses the reusable workflow at `@v0.1.0` with `skip-github-release: true` and the secret passed by name (not `inherit`)

#### Scenario: A merge that does not change the version
- **WHEN** a push to `main` does not change `version` (release-please then updates its pull request on its own branch, which `release.yml` ignores)
- **THEN** the release workflow's detection answers `release=false`

### Requirement: Release-please configuration
`release-please-config.json` SHALL declare one package `.` of release type `node`, with `include-component-in-tag: false`, `bump-minor-pre-major: true` and `changelog-path: CHANGELOG.md`; `.release-please-manifest.json` SHALL hold the version in `package.json`.

#### Scenario: Configuration
- **WHEN** the configuration files are read
- **THEN** they have those values, and the manifest's version equals `version` in `package.json`

#### Scenario: Manifest out of step
- **WHEN** the manifest's version differs from `version` in `package.json`
- **THEN** the unit test fails naming both versions

### Requirement: Conventional Commit pull request titles
A `Title` workflow with `permissions: {}` SHALL run on pull requests (opened, edited, synchronize, reopened) and call `brunosouzas/github-reusable-workflows/.github/workflows/pr-title.yml@v0.1.0` from a job with the id `pr-title`. The title rule itself belongs to that reusable workflow at the pinned tag.

#### Scenario: Title workflow
- **WHEN** the title workflow file is read
- **THEN** it runs on those pull request events only, with `permissions: {}`, and its job `pr-title` uses the reusable workflow at `@v0.1.0`

#### Scenario: Title workflow on another event
- **WHEN** the title workflow file is read
- **THEN** it has no `push` or `pull_request_target` trigger

### Requirement: Release app token
The publishing job SHALL give `scripts/release-publish.sh` as `GH_TOKEN` a token made after the checkout and the download by `actions/create-github-app-token` from the environment's `RELEASE_APP_CLIENT_ID` and `RELEASE_APP_PRIVATE_KEY`, for this repository only, with `permission-contents: write` as its only permission and the action's default revocation at the job's end; never `github.token`.

#### Scenario: Contents only
- **WHEN** the release workflow file is read
- **THEN** the token step names `repositories: ${{ github.event.repository.name }}` and `permission-contents: write`, no other `permission-*` input and no `skip-token-revoke`

#### Scenario: Token before publishing
- **WHEN** the release workflow file is read
- **THEN** the token step comes after the checkout and the download and before the step that runs the publishing script, that step's `GH_TOKEN` is the token step's output, and `github.token` appears nowhere in the workflow, so a token step that fails stops the job before anything is published

### Requirement: Release app's own tag
The detection SHALL take `github.actor` as an optional sixth argument and the release app's bot login from `RELEASE_APP_BOT`, set in the detection step's `env` to `stackledger-release[bot]`. For a pushed tag whose actor equals a non-empty `RELEASE_APP_BOT` it SHALL answer `release=false`, keeping `tag`: the run that created the tag is already releasing it.

#### Scenario: Tag pushed by the release app
- **WHEN** the push is the tag `v0.2.0` and the sixth argument is `stackledger-release[bot]`, equal to `RELEASE_APP_BOT`
- **THEN** the detection answers `release=false` with `tag=v0.2.0` and a line naming the actor

#### Scenario: Another actor, no actor or no bot name
- **WHEN** the tag `v0.2.0` is pushed by `brunosouzas` or `other-app[bot]`, or the sixth argument is missing, or `RELEASE_APP_BOT` is empty
- **THEN** the tag goes on with `release=true`

#### Scenario: Workflow wiring
- **WHEN** the release workflow file is read
- **THEN** the detection step's `env` holds `ACTOR: ${{ github.actor }}` and `RELEASE_APP_BOT: stackledger-release[bot]`, and its command passes `"$ACTOR"` as the sixth argument

## MODIFIED Requirements

### Requirement: Publication of the checked tarball
A publishing job SHALL run only after the checks succeed, in the GitHub environment `npm` (owner approval), with `contents: read` and `id-token: write`. It SHALL check out the released commit to get `scripts/release-publish.sh`, treat the downloaded artifact as data only, install and build nothing, and publish that tarball with `npm publish <tarball> --provenance --access public --ignore-scripts` through OIDC; `NPM_TOKEN` is read only for the first version.

#### Scenario: Publishing job
- **WHEN** the release workflow file is read
- **THEN** the publishing job `needs` the detection and checks jobs, uses environment `npm`, has `contents: read`, checks out without credentials, runs the script from the checkout, has no install or build step, and the script publishes with `--provenance` and `--ignore-scripts`

### Requirement: Release on the version merge
`release.yml` SHALL run on pushes to `main` and on pushed tags `v*`. A first job with only `contents: read`, given the event values through `env`, SHALL answer `release` and `tag`: a pushed tag goes on unless `Release app's own tag` applies; a push to `main` goes on only when it is neither forced nor a non-fast-forward, changes `version` against the commit before the push, and `v<version>` does not exist. It prints one line saying why.

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
