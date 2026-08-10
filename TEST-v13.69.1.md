# Runtime tests v13.69.1

## A — provider profile
`official_website` must be `unavailable / none / none` and `commercial_signal_can_confirm_reservation=false`.

## B — repaired Chez Funda correlation
The existing v13.69.0 Chez Funda monetization snapshot must be normalized to `unavailable / none / none`.

## C — fresh external handoff
Click Reserve for Chez Funda again. New correlation must contain:
- provider `official_website`
- commercialStatus `unavailable`
- monetizationMode `none`
- trackingStrategy `none`
- commercialSignalCanConfirmReservation `false`

## D — known partner regression
A SevenRooms handoff remains `partner_required / unknown / contract_defined` until a real commercial agreement is activated.
