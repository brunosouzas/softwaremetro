# Design

- **One app per repository** (`stackledger-release`, owner's decision AB#251 Q1): a key pasted into a public repository's environment reaches only this repository if it leaks.
- **The release workflow keeps making the tag** (`skip-github-release: true`): the publishing job already reserves the tag before npm and creates the GitHub release with the SBOM; release-please only opens and updates the pull request.
- **The app's own tag push is skipped by name** (`RELEASE_APP_BOT` = `stackledger-release[bot]`), not by any `[bot]` actor, so another app's tag (should one ever be allowed) still reaches the tag check.
