# Tests – v13.76.0

## Local release test
```bash
node tests/v13.76.0-control-center-global-product-module-foundation.test.cjs
```

## Existing provider regressions
Run the TheFork, Quandoo, OpenTable, SevenRooms, Resy and Tock adapter regression tests shipped with the project.

## Browser checks
```js
LuviaKernelVersion
LuviaProductModuleRegistry.diagnostics()
LuviaCapabilityRegistry.diagnostics()
LuviaGlobalContracts.diagnostics()
LuviaProductModuleDiagnostics.run()
```

### Isolation check
```js
LuviaProductModuleRegistry.disable('control-center')
LuviaProductModuleRegistry.state('consumer')
LuviaProductModuleRegistry.enable('control-center')
```
Consumer must remain enabled throughout.
