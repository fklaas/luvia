# Test Plan v13.81.1

## Modify action
1. Control -> Buchungen.
2. Open a booking.
3. Choose Ändern.
4. Change a safe field or add a normal note.
5. Tap Änderung verbindlich anfragen.
6. The button must immediately enter busy state / show action status.
7. On success timeline refreshes. On failure a concrete error is visible.

## Cancel action
Only test on a booking you genuinely intend to cancel when using a real provider.
1. Open booking.
2. Stornieren.
3. Confirm.
4. The button must immediately react.
5. Booking must not jump to final cancelled solely because of the click.

## Mobile drilldown
1. Open Control -> Buchungen on <=780px viewport.
2. Initially see the complete booking list, not an auto-opened detail.
3. Tap a booking.
4. Detail opens as the primary mobile surface.
5. Tap `← Alle Buchungen`.
6. Full list returns.

## Desktop regression
Desktop remains list + detail side-by-side.
