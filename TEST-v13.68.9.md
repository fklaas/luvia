# Test v13.68.9

## Regression case: existing GMX smoke reply

Inbound message:
`578a1189-19d8-474d-a537-39c2d613600a`

Because its sender is not the verified Café Berry venue candidate, reprocessing under service-role context must classify it but must not create an auto-applied `email_reply` status signal.

```sql
begin;
set local request.jwt.claim.role = 'service_role';
select public.luvia_booking_process_inbound_intelligence_v2(
  '578a1189-19d8-474d-a537-39c2d613600a'::uuid
);
commit;
```

Expected decision includes:
- `intent = confirmed`
- `classifierAutoApply = true`
- `autoApply = false`
- `senderTrusted = false`
- `reviewRequired = true`
- `autoApplyBlockedReason = UNTRUSTED_EMAIL_SENDER`
- `applied = false`

Then verify `booking_message_intelligence` contains the message with `auto_apply=false`, `review_required=true`, `applied=false` and no `email_reply` status signal is created for the untrusted sender.

A real future reply from the exact verified venue candidate may auto-apply through the canonical status-provenance core if the classifier decision is high-confidence and the status core accepts the transition.
