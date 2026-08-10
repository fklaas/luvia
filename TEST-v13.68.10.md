# Test v13.68.10

## Primary live regression

```sql
begin;
set local request.jwt.claim.role = 'service_role';
select public.luvia_booking_process_inbound_intelligence_v2(
  '578a1189-19d8-474d-a537-39c2d613600a'::uuid
);
commit;
```

Expected for the existing GMX smoke-test reply:

- `intent = confirmed`
- classifier confidence approximately `0.98`
- classifier proposed state `confirmed`
- `senderTrusted = false`
- `classifierAutoApply = true`
- effective `autoApply = false`
- `reviewRequired = true`
- `applied = false`
- `autoApplyBlockedReason = UNTRUSTED_EMAIL_SENDER`

Then verify `booking_message_intelligence` and ensure no `booking_status_signals` row with `source='email_reply'` is emitted for this untrusted sender.

## Representative language regression classes

Confirmation/decline/alternative/action/informational rules cover 29 language/locale groups: DE, EN, FR, ES, IT, PT, NL, DA, SV, NO, FI, PL, CS, SK, HU, RO, HR/BS/SR, SL, BG, EL, TR, RU, UK, AR, HE, ZH, JA, KO.

Decline/negation patterns are evaluated before confirmation patterns.
