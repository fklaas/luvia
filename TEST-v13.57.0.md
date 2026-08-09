# Test plan — v13.57.0 / Core 4.57.0

## Static/release
- Build/Core version consistency.
- JS syntax checks.
- Contact resolver provider-domain denylist present.
- Provider email candidates cannot be auto_usable.
- booking_provider_connection_readiness_v3 created.
- Activation state never becomes connected merely from credentials.

## Production smoke after deploy
1. Invoke booking-provider-connection-health while authenticated.
2. Confirm no secrets are returned.
3. Confirm providers without credentials stay partner_required/waiting_credentials or blocked.
4. Confirm configured credentials may only yield ready_to_connect/ready_to_activate until a real provider probe exists.
5. Re-test a venue whose provider page exposes contact@zenchef.com: it must not be accepted as restaurant email.
6. Re-test a venue with an explicitly published venue Gmail/custom-domain email: it may be accepted.
