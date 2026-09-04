# Cuisine filters and shared map interaction

User-authorized correction from Integration 9c534c17 / runtime .29: cuisine
multi-selection must retain provider categories, empty map areas must accept drag
and zoom, selected pins must stack above peers, and matching pins must carry a
subtle Passt label and animated full Compass outline. Applies to the shared
Places/Stays consumer. No domain-truth owner changes, database or billing changes.

Confirmed live: canvas inherits pointer-events:none; Italian alone returns 4,
German alone 2, but their combination requests the broad 50-row catering cohort.
The provider selection must represent the cuisine union before the result limit.
Canonical reference: https://apidocs.geoapify.com/docs/places/ and its category
and condition lists. Structured cuisine is documented in Place Details API.

Verification: executable real provider-parameter and composition tests, safe
regression, visible browser cuisine/viewport/pin checks on Integration only.
