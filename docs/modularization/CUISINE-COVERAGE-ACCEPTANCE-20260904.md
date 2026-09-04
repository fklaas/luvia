# Cuisine coverage — 2026-09-04

App 13.82.168.31, source 1d4a2c53d71149a0faf58c9d0915009b579d670f.
Integration Worker c56d03ac-a502-488e-b642-a27e0aa11353; gateway v150 ACTIVE.
Feature branch codex/cuisine-coverage-20260904 merged FF into integration and
pushed. Main unchanged. No DB, secrets, billing or booking writes.

## Root cause and bounded correction

The existing 3 km destination circle excludes Sai Gon, Strandallee 22,
Scharbeutz/Haffkrug, at 54.0497067 / 10.7509787: 3034 m from the saved anchor.
Geoapify classifies it as catering.restaurant.asian, not Chinese or Vietnamese.
The UI previously had no Asian option. Official tourism lists the same business
as Vietnamese: https://www.ostsee-schleswig-holstein.de/poi-detail-ansicht/147538/.
This source disagreement remains visible evidence of incomplete cuisine coverage;
no external web classification was silently copied into Places truth.

The shared consumer now offers an explicit 5 km search on an empty destination
result, displays the search scope and provides a broader Asian cuisine option.
The exact kitchen remains unchanged until the user chooses a broader category.
Asian includes provider-evidenced Asian children but never implies Chinese or
vegetarian suitability. No automatic fallback fanout or radius expansion.
Empty results describe source coverage and geographic scope, never nonexistence.

## Measured checks

- Safe regression 208/208 passed; final scope-caption addition subsequently passed
  runtime bundle syntax, shared Stays/Places behavior and visual inventory gates.
- Filter matrix 72 category/subtype cases, now 19 cuisine choices; asymmetric Asian
  parent/Chinese child regression and explicit radius/viewport/empty-state checks.
- Real provider: Asian at 5 km = Sai Gon, Hay-Cheng, Samoa Timmendorf; Chinese at
  5 km = Hay-Cheng. Hay-Cheng and Samoa are in Timmendorfer Strand, not Scharbeutz.
- Public assets 16/16 SHA-256 matches to the immutable release-31-clean archive.
- Visible browser: Chinese at default 3 km is empty with scoped explanation and
  actionable 5 km / broader Asian choices; clicking 5 km returns Hay-Cheng.
- Separate visible test: only Asian selected, default 3 km empty; clicking 5 km
  returns exactly Sai Gon, Hay-Cheng, Samoa Timmendorf. Heading shows 5 km around
  Scharbeutz including surroundings. Sai Gon is the selected pin/preview.
- Passend returns zero verified matches for the current profile and stays selected;
  Alle restores all three. No automatic vegetarian suitability claim.

Artifacts: C:/Users/fabia/Documents/ChatGPT/Luvia/outputs/places-stays-quality/.
Gateway initial archive deploy was rejected because extraction was still incomplete;
no failed deployment is recorded as success. Gateway was then deployed from the
committed source. Static deployment uses a separate, completed clean Git archive.

## Remaining limitation

These controls repair the demonstrated taxonomy/scope omissions. They do not prove
complete coverage for every cuisine or every local business. Geographic municipality
boundaries and additional licensed cuisine sources are not implemented in this slice.
