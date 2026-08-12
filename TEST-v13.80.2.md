# Tests – v13.80.2

## Automated release gate
```bash
node tests/v13.80.2-reply-verification-mobile-inbox.test.cjs
```

## Regression gates
```bash
node tests/v13.80.0-reply-safety-contract.test.cjs
node tests/v13.80.0-booking-actions-intelligence.test.cjs
node tests/v13.79.0-booking-core-conversation-seam.test.cjs
node tests/v13.78.0-booking-control-center-foundation.test.cjs
node tests/v13.78.0-product-module-regression.test.cjs
node tests/v13.77.0-control-center-home-travel-identity.test.cjs
```

## Manual mobile acceptance
1. Open Control → Inbox at <=780px viewport.
2. Verify the full conversation list appears before any thread.
3. Tap a conversation.
4. Verify `← Inbox` appears.
5. Tap it and confirm all conversations are visible again.
6. Open an existing verified email-thread booking and send a harmless reply.
7. Verify progress appears and the reply either succeeds or shows a concrete backend reason.
