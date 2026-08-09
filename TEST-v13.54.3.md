# Test v13.54.3 / Core 4.54.3

Primary regression case:
1. Existing verified Quandoo receipt has an existing `booking_status_signals` row with `resolution_state=ignored`, `applied_status_update_id IS NULL`, and reason from the formerly invalid `ready -> confirmed` transition.
2. Reprocess the receipt.
3. The original signal row must be reused, not duplicated.
4. The trusted provider transition is re-evaluated under Core 4.54.3.
5. Booking becomes `confirmed`; receipt and signal become `applied`; both reference one status update.
6. Reprocessing again must be idempotent and create no second status update.
