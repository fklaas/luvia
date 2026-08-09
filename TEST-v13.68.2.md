# Test v13.68.2

- Static regression: `node tests/v13.68.2-email-send-expected-state-early-audit-fix.test.cjs`
- JS syntax: browser client, app shell, service worker.
- Verify early audit ordering precedes recipient verification.
- Verify Resend key lookup and Resend fetch occur only after recipient verification.
- Runtime smoke target: `logo-le-point@2x.jpg` must be blocked by both readiness and send, with a persisted blocked audit row and no provider message id.
