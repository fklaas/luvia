# Luvia v13.68.10 / Core 4.68.10

## Multilingual Reply Decision Classification & Review-State Fix

This release expands deterministic Email Booking V2 reply classification from a narrow DE/EN/FR ruleset to 29 language/locale groups while preserving the trusted-sender provenance boundary introduced in v13.68.9.

Decision precedence is intentionally safety-first: explicit decline/negation → alternative proposal → explicit confirmation → action required → informational → ambiguous booking-language review. A phrase such as “nicht bestätigt” therefore cannot be promoted to confirmation merely because it contains a confirmation stem.

Representative coverage includes German, English, French, Spanish, Italian, Portuguese, Dutch, Danish, Swedish, Norwegian, Finnish, Polish, Czech, Slovak, Hungarian, Romanian, Croatian/Bosnian/Serbian, Slovenian, Bulgarian, Greek, Turkish, Russian, Ukrainian, Arabic, Hebrew, Chinese, Japanese and Korean.

The classifier now recognizes the live smoke-test phrase “Wir bestätigen Ihre Reservierung …” as `confirmed` with a proposed `confirmed` booking state. If the sender is not the exact verified/public/official/auto-usable venue candidate, v13.68.9 sender provenance still forces `auto_apply=false`, `review_required=true` and no `email_reply` status signal.

Ambiguous booking-related replies now consistently require review rather than producing `requires_user_action=true` with `review_required=false`.
