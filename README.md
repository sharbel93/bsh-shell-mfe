# BSH Shell + Micro-Frontends

Outlook-style host shell loading independently deployable Angular remotes at
runtime with Native Federation (esbuild, import maps). Angular 22, standalone,
zoneless.

## Run
```bash
npm install
npm start
# shell    http://localhost:4200  (redirects to /mail)
# mail     http://localhost:4201
# calendar http://localhost:4202
```

## Build
```bash
npm run build:all   # dist/<project>/browser/ ; remotes emit remoteEntry.json
```

## Structure
- `projects/shell` host, owns the frame and routing only.
- `projects/mail`, `projects/calendar` remotes, each exposes `./Routes`.
- `projects/shared` shared UI/util library.
- `projects/shell/public/federation.manifest.json` remote URLs per environment.

Architecture rationale: `docs/adr/0001-federation-choice.md`.
Working notes for Claude Code: `CLAUDE.md`.
