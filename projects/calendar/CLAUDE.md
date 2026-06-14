# calendar remote
Port 4202. Exposes `./Routes` (`src/app/app.routes.ts` -> `Calendar` feature in `src/app/calendar.ts`).
Month grid + agenda. Imports `<lib-panel>` from `shared`. Zoneless; use signals.
Registered in the shell via `projects/shell/public/federation.manifest.json`.
