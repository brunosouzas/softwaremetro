## MODIFIED Requirements

### Requirement: Home link icon setting
A home link's `icon` SHALL be one of `github`, `website`, `linkedin`, `email`, `stackledger` and `brunosouzas`, the link icon names of `@brunosouzas/design-system`; any other value SHALL be an error on its path. A link MAY have both `icon` and `description`, with no problem: the description is not shown (catalogue-site, Home link icons).

#### Scenario: Link icon
- **WHEN** `links[0]` has `icon: github`, `links[1]` has `icon: website`, `links[2]` has `icon: stackledger` and `links[3]` has `icon: brunosouzas`
- **THEN** it has no problem

#### Scenario: Description beside an icon
- **WHEN** `links[0]` has `icon: github` and `description: Our code`
- **THEN** it has no problem, neither error nor warning

#### Scenario: Unknown link icon
- **WHEN** `links[0]` has `icon: twitter`, in a second document `icon: GitHub`, in a third `icon: "../favicon"`, in a fourth `icon: Stackledger`, and in a fifth `icon: BrunoSouzas`
- **THEN** each gets an error on `spec.site.home.links[0].icon`

#### Scenario: Icon names match the design system
- **WHEN** the allowed `icon` values are compared with the design system's link icon names
- **THEN** they are the same six names
