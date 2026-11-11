## MODIFIED Requirements

### Requirement: Home link icon setting
A home link's `icon` SHALL be one of `github`, `website`, `linkedin`, `email` and `stackledger`, the link icon names of `@brunosouzas/design-system`; any other value SHALL be an error on its path.

#### Scenario: Link icon
- **WHEN** `links[0]` has `icon: github`, `links[1]` has `icon: website` and `links[2]` has `icon: stackledger`
- **THEN** it has no problem

#### Scenario: Unknown link icon
- **WHEN** `links[0]` has `icon: twitter`, in a second document `icon: GitHub`, in a third `icon: "../favicon"`, and in a fourth `icon: Stackledger`
- **THEN** each gets an error on `spec.site.home.links[0].icon`

#### Scenario: Icon names match the design system
- **WHEN** the allowed `icon` values are compared with the design system's link icon names
- **THEN** they are the same five names
