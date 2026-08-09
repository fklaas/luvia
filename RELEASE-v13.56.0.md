# Luvia v13.56.0 / Core 4.56.0
## Provider Connection Runtime + Places Category Reliability

- Adds provider connection/readiness runtime without storing or exposing credential values.
- Adds authenticated health diagnostics for all booking providers.
- Keeps partner-gated providers blocked until credentials/contracts are actually available.
- Removes the document-capture quick-filter interceptor that blocked existing module-root category handlers.
- Restores category interactions across all canonical Places modules after re-renders.
