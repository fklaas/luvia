# Test – v13.68.5 / Core 4.68.5

Primary regression: Café Berry must no longer select `utilisateur@domaine.com`.

Expected after migration/resolver:
- placeholder candidate: `verification_status=rejected`, `auto_usable=false`, rejection reason `PLACEHOLDER_EMAIL`
- `bonjour@cafeberryparis.fr`: remains verified/public/official/auto_usable
- booking `contact.email`: repaired to `bonjour@cafeberryparis.fr`
- Email V2 readiness: `READY` for `bonjour@cafeberryparis.fr`

Run: `node tests/v13.68.5-placeholder-email-ranking.test.cjs`
