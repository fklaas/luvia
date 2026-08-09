# Test v13.65.0 / Core 4.65.0

## Ziel
Nachweis, dass offene/ambige Modify-/Cancel-Mutationen sicher wiedergefunden und ohne Mutation-Replay reconciled werden können.

## Smoke-Reihenfolge nach Deployment
1. neue Request-Spalten, Attempts-Tabelle und Queue-View prüfen.
2. Browser Global `window.LuviaBookingReservationRecovery` sowie `get/list/reconcile/history` prüfen.
3. einen kontrollierten Request auf `unknown + reconciliation_required=true` setzen bzw. vorhandenen ambigen Request verwenden.
4. `list()` muss den Request in der Recovery-Queue liefern.
5. `reconcile()` bei nicht verbundenem Provider muss `PARTNER_REQUIRED` liefern und einen Audit-Attempt schreiben; es darf kein Provider-Mutationscall stattfinden.
6. Attempt-History prüfen: Strategy, State, Expected State, Error und Timestamp müssen vorhanden sein.
7. kontrollierten terminalen Lifecycle-Event (`provider_polling/accepted` oder `cancelled`) einspeisen: Request muss `reconciled`, `reconciliation_required=false`, `provider_outcome_known=true` werden.
8. erneutes `reconcile()` auf demselben Request muss idempotent `resolved=true` zurückgeben und keinen neuen Provider-Call ausführen.
9. erneuter ursprünglicher Modify-/Cancel-Aufruf mit identischem Idempotency-Key darf bei `reconciled` die Mutation nicht replayen.
10. Regression: Lifecycle History, Status Provenance, Places, Availability, Create, Modify/Cancel Guards.

## Sicherheitsnachweis
Die Reconciliation Edge Function enthält ausschließlich den Provider-Read-Action `get_reservation`; `create_reservation`, `update_reservation` und `cancel_reservation` sind dort nicht erlaubt.
