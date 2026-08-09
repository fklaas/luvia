# Test – v13.61.2 / Core 4.61.2

Browser smoke after full web deploy:

```js
console.log(window.LuviaBookingAvailability);
console.log(typeof window.LuviaBookingAvailability?.check);
console.log(typeof window.LuviaBookingAvailability?.readiness);
```

Expected: object / function / function.

Then call Quandoo while not connected. Expected controlled `PARTNER_REQUIRED` and `slots: []`; no invented availability.
