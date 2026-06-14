# ADR 0001: Single Angular workspace + Native Federation (not Nx, not multi-repo)

Status: Accepted

## Context
Goal: an Outlook-style shell that loads independent, separately deployable
Angular applications. Two options were on the table: Native Federation on a
plain workspace, or an Nx monorepo plus Native Federation.

## Decision
Use a single Angular CLI multi-project workspace with
`@angular-architects/native-federation`. Do not adopt Nx. Do not split remotes
into separate repositories.

## Rationale
1. **Repo boundary != deploy boundary.** Independent deployability is achieved by
   building and shipping each project separately and resolving remotes at runtime
   from a manifest. One workspace already gives `ng build <project>` and
   per-project deploy. Neither Nx nor polyrepo is required for it.
2. **Native Federation fits the default builder.** Angular's default is the
   esbuild Application Builder. Native Federation is a thin wrapper over it and
   uses web standards (ES modules, import maps).
3. **Nx's paved federation path is webpack.** Nx's first-class `host`/`remote`
   generators emit webpack Module Federation. Choosing Nx means either reverting
   to webpack or hand-wiring Native Federation into Nx's layout: glue to maintain
   across every Nx + Angular + NF upgrade. Not justified at this scale.
4. **Polyrepo tax.** Separate repos per remote create version-skew on shared
   singletons and block atomic cross-cutting changes, for one team under one
   lead. A single workspace with a shared library is the lower-coordination choice.

## When to revisit
- 10+ apps/libs, enforced module boundaries, or distributed task execution:
  evaluate `nx init` over this workspace (reversible).
- A squad needs a hard repository/security boundary or external ownership of a
  remote: extract that one project to its own repo; the runtime contract
  (remoteEntry.json + manifest) is unchanged.

## Consequences
- Shared Angular deps are configured as singletons per remote; upgrades are
  coordinated across all projects.
- The shell stays feature-free; remotes expose route definitions and are
  registered only in `federation.manifest.json` and the shell routes.
