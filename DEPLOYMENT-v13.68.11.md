# Deployment v13.68.11
1. Deploy the complete web build.
2. Run `npx supabase db push` from the linked project directory.
3. Run `npx supabase functions deploy booking-email-inbound`.
4. In Resend replay the previously failing `email.sent` event once.
5. Verify one row appears in `booking_email_delivery_events`; replay the same event again and verify the row count does not increase.
No new secrets are required.
