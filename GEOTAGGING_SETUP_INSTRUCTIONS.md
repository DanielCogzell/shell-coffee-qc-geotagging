# Shell Coffee QC Prototype - Geotagging Version

This is the second version of the Shell garage coffee quality-control prototype.

The original QR-code version is preserved in:

```text
../shell-coffee-qc
```

This version removes branch-specific QR codes. Customer feedback is submitted through one generic survey link, then mapped to the nearest Shell branch using GPS coordinates.

## Core behaviour

1. Customer answers the survey.
2. Customer clicks `Submit feedback`.
3. The app requests browser location permission.
4. If permission is allowed, the app captures latitude and longitude.
5. The app calculates distance to every Shell branch using the Haversine formula.
6. The nearest branch is assigned only if the customer is within that branch's `geofence_radius_m`.
7. If permission is denied, unavailable, timed out, or outside the branch radius, the response is still saved as unmapped feedback.

Location permission is not requested on page load. It is requested only after submit.

## Run locally

From this folder:

```powershell
npm.cmd install
npm.cmd run dev -- --port 5174
```

Open:

```text
http://127.0.0.1:5174
```

Generic survey link:

```text
http://127.0.0.1:5174/?view=survey
```

Cup QR concept link:

```text
http://127.0.0.1:5174/?view=qr
```

## Testing geotagging on localhost

The survey starts with a blank branch selection. The customer can:

- Select the Shell branch manually.
- Tick the location checkbox to allow the browser to find the nearest branch and auto-select it.
- Leave both blank and still submit, which saves the response as unmapped feedback.

The survey includes a development test mode. It lets you simulate coordinates near a selected Shell branch without relying on real browser GPS.

Use:

- `Inside geofence radius` to create a mapped response.
- `Outside branch radius` to create an unmapped outside-radius response.

To test real browser geolocation, turn off development test mode and tick the location checkbox. The browser will request location permission at that point.

The dashboard also includes seeded mock survey responses so the mapping-quality cards are populated immediately:

- Permission denied
- Location timed out
- Location unavailable
- Outside branch radius
- Mapped sample response

Hover over the `?` badges on the mapping-quality cards to see a brief explanation of each field.

## Build

```powershell
npm.cmd run build
```

The production build is created in:

```text
dist/
```

## Notes

- Branch scoring uses mapped responses only.
- Unmapped responses remain visible in the dashboard under `Unmapped Feedback`.
- Fake data is kept directly in `src/main.jsx`.
- The original QR version is untouched.
