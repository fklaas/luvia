begin;

-- The browser presence owner has persisted confirmation candidates since v4.3,
-- but the original 2026-07 constraint only admitted the early GPS states. Keep
-- every explicit user decision representable and retain removed visits as
-- restorable owner records instead of deleting their evidence.
alter table public.place_visits
  drop constraint if exists place_visits_state_check;

alter table public.place_visits
  add constraint place_visits_state_check
  check (state in (
    'nearby',
    'arrived',
    'stay_detected',
    'pending_confirmation',
    'discarded_unconfirmed',
    'visited',
    'left',
    'rejected',
    'removed'
  ));

comment on column public.place_visits.correction is
  'Places-owner correction and recovery evidence. May contain revision-checked visitManagementHistory, visitRemovalRecovery, and visitRemovalLastRestore receipts.';

commit;
