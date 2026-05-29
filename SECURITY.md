## Known vulnerabilities

### npm audit — moderate severity findings (2026-05-29)

- postcss < 8.5.10 — XSS via unescaped </style> in CSS stringify output
- Affects: next and next-auth internal dependencies
- Fix requires downgrading next back to 9.3.3 — not acceptable
- Runtime impact: Low — only triggered in specific CSS stringify edge cases,
  not exposed in production request handling
- Status: Monitor for a next/next-auth patch release
