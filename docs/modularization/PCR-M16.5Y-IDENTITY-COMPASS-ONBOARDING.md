# PCR M16.5Y — Identity Compass Profile Onboarding

Date: 2026-08-28

Target: Integration only

App/Core candidate: 13.82.98 / 4.82.98
Main and Production: locked and unchanged

## Outcome and binding reference

This slice implements Gate 3 of the binding M16.5 Productization Plan: the
post-authentication Profile onboarding from the accepted
`m16.5-design-foundation/prototype-rq/profile-onboarding.html`, `.css` and `.js`
reference. It is one continuous seven-stage journey: Ankommen, Konto,
Reisegefühl, Rhythmus, Bedürfnisse, Kontrolle and the completed personal
Reisekompass.

The Profile/Trip split from `PCR-M16.5D-PROFILE-TRIP-ONBOARDING-SPLIT.md` is
binding. This flow may write account-profile fields and explicit global travel
preferences. It may not create, activate or mutate a Trip, membership or Trip
onboarding draft. The First-Trip Composer remains the next independent gate.

## Owner boundary and persistence

- `identity.v1.commands.completeOnboarding` is the sole committing command.
- The command sanitizes Profile and preference fields through the browserless
  Identity Domain Contract and commits one merged patch through the existing
  Profile provider.
- The UI imports no Supabase client, Profile store, User Preferences service,
  Trip contract or Trip creator.
- Session-scoped draft/defer state uses `StoragePort`; auth identity is read
  through `AuthSessionPort`.
- Observed Intelligence signals never become explicit preferences without a
  later user confirmation.

## Product behavior

- First authenticated use gates before an empty-Trip state or the signed-in
  shell when `preferencesCompletedAt` is absent.
- The user can defer, resume after reload, go back through completed stages and
  reopen the complete flow from Profile or Identity Center.
- Account email is provider-owned and read-only in this surface.
- Interests, travel styles, mobility, activities, entertainment, dietary,
  family, accessibility/sensory needs, pace and budget use the canonical
  Preference Schema vocabulary.
- Consent controls are explicit and editable. Saving returns an Identity owner
  receipt; no Trip is created as a side effect.
- The full-screen composition uses the accepted Luvia Compass and real existing
  travel imagery, responsive staging, hidden internal scrollbars and a
  deterministic Reduced Motion mode.

## Local evidence

- JavaScript syntax: PASS for onboarding, App Shell, Navigation and Identity
  adapter.
- Identity adapter command and forbidden-field tests: PASS.
- Navigation fullscreen Identity ownership test: PASS.
- Visible browser sequence with real clicks through all seven stages and the
  owner-backed save receipt: PASS.
- Desktop 1440 × 900: no document overflow; all stages remain within the fixed
  product frame.
- Wide/short Desktop 1702 × 683: the Reisekompass information card and all
  three promise chips remain completely above the fixed footer.
- Short landscape 958 × 506 with eight selected preference cards: copy,
  selected values and save action remain completely inside the stage; document
  overflow is 0 px.
- Mobile 390 × 844: responsive single-column composition, no document overflow,
  internal scrolling without visible scrollbars.
- Reload/resume with the selected canonical preferences retained: PASS.
- Native-button keyboard reachability, Back/step history contract and the
  deterministic Reduced Motion/static-animation guards: PASS.
- Safe Regression: 115 / 115 PASS; NFR-0: 3 / 3 PASS; regenerated visual
  inventory: 2,850 tracked files / 722 visual candidates, unclassified 0.

## Explicitly open

- Real production-account creation, password mutation and physical-handset
  acceptance remain separate user gates.
- The next Trip-owned First-Trip Composer is not part of this slice.
- The broader M16.5 Design Freeze is not inferred from this release.

## Rollback

Rollback returns Stable Integration to App/Core 13.82.97 / 4.82.97, version
`a9309030-3045-4964-aa9e-4078a9ecc3cf`, deployment
`793af37b-08f7-4b6e-88b7-edc12dd88b90`. No database migration, Supabase
configuration, Main or Production mutation is part of M16.5Y.
