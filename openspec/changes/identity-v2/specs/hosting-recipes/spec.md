## ADDED Requirements

### Requirement: Proxy security headers
`examples/hosting/Caddyfile` and `docs/hosting.md` SHALL set `Content-Security-Policy: frame-ancestors 'none'` with the other security headers and SHALL NOT repeat the pages' policy: two policies apply together, so a fixed copy in the proxy would block the hashed font styles. The `meta` policy of each page and the generated `_headers` carry the full policy.

#### Scenario: Proxy sets only frame-ancestors
- **WHEN** `examples/hosting/Caddyfile` and `docs/hosting.md` are read
- **THEN** every `Content-Security-Policy` header they set is exactly `frame-ancestors 'none'`, and neither holds `style-src`, `default-src` or `script-src`

#### Scenario: Page behind the proxy keeps its policy
- **GIVEN** Caddy with `examples/hosting/Caddyfile` in front of oauth2-proxy and a built site
- **WHEN** a finance identity asks for `/full/`
- **THEN** the response's `Content-Security-Policy` header is `frame-ancestors 'none'` and the page's CSP `meta` is the full policy with its hashes
