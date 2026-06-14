# BSH Shell + Micro-Frontends (Angular Native Federation)

Runtime-composed micro-frontend workspace that mimics the Outlook web shell: a
host shell renders a top bar and a left icon rail, and loads independently
deployable Angular remotes at runtime via import maps.

## Architecture decision (summary)
- **Single Angular CLI workspace + Native Federation. No Nx. No separate repos.**
- "Independently deployable" is a *deploy* property, not a *repo* property. Each
  project builds and deploys on its own; the shell discovers remotes at runtime
  from `federation.manifest.json`, so promoting an environment is a manifest
  swap, not a shell rebuild.
- Native Federation (not webpack Module Federation) because Angular's default is
  the esbuild Application Builder. Nx's first-class federation generators emit
  webpack MF, which is why Nx was rejected here. See `docs/adr/0001-federation-choice.md`.

## Stack
- Angular 22, standalone components, **zoneless** (no zone.js). Use signals /
  `computed` for state. Do not add `zone.js` or `provideZoneChangeDetection`.
- `@angular-architects/native-federation` 22 (esbuild Application Builder).
- Node 24 (CLI 22 requires Node >= 22.22.3 or >= 24.15).

## Layout
```
projects/
  shell/      host (dynamic-host), port 4200, owns NO feature code
  mail/       remote, port 4201, exposes ./Routes
  calendar/   remote, port 4202, exposes ./Routes
  shared/     library: <lib-panel>, shortTime(), WORKSPACE_NAME
```
- `projects/shell/public/federation.manifest.json` maps remote name -> remoteEntry.json URL.
- `tsconfig.json` paths map `shared` to `./projects/shared/src/public-api.ts` (source, no separate lib build in dev).

## Commands
- `npm start` runs all three (shell 4200, mail 4201, calendar 4202) concurrently.
- `npm run start:mail` / `:calendar` / `:shell` run one.
- `npm run build:all` builds every project. Output: `dist/<project>/browser/`.
  Each remote emits `dist/<project>/browser/remoteEntry.json`.
- Open http://localhost:4200 . The shell redirects to /mail.

## Hard rules (do not break federation)
1. **Shared singletons.** Angular packages are shared as singletons in each
   `federation.config.mjs` via `shareAll`. Never bump a shared dependency in one
   remote only; version skew breaks runtime sharing. Update all projects together.
2. **Remotes expose route definitions**, not components: `exposes: { './Routes': '.../app.routes.ts' }`.
   The shell mounts them with `loadRemoteModule({ remoteName, exposedModule: './Routes' })` in `loadChildren`.
3. **Shell owns no feature logic.** It only renders the frame and routes to remotes.
4. **Manifest is the source of truth for remote URLs.** Per-environment URLs are a
   manifest change, never a code change in the shell.
5. Remote dev ports are fixed: mail 4201, calendar 4202. The manifest must match.

## Add a new remote (e.g. `todo`)
```bash
npx ng generate application todo --style=scss --ssr=false --skip-tests
npx ng g @angular-architects/native-federation:init --project todo --type remote --port 4203
# expose routes:
#   projects/todo/federation.config.mjs -> exposes: { './Routes': './projects/todo/src/app/app.routes.ts' }
#   projects/todo/src/app/app.routes.ts -> export const routes = [{ path: '', component: Todo }]
# register in shell:
#   projects/shell/public/federation.manifest.json -> "todo": "http://localhost:4203/remoteEntry.json"
#   projects/shell/src/app/app.routes.ts -> add a loadChildren route for 'todo'
#   projects/shell/src/app/app.html -> add a rail item linking to /todo
```

## Conventions
- Component classes use Angular 22 naming: `Mail`, `Calendar`, `App` (no `.component` suffix).
- Feature components live at `projects/<remote>/src/app/<feature>.ts` with inline template/styles.
- Theme tokens are CSS custom properties in each `src/styles.scss` (`--bg --surface --stroke --text --muted`).
