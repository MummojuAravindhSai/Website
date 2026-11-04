# Standalone Migration Plan

## Goal and current status

Goal: preserve the existing public website and Payload content model while making the exported application runnable without Figma Make.

**Current status: standalone runtime implemented and locally verified.** Payload now uses `buildConfig` with PostgreSQL and optional S3 storage. The former Figma runtime configuration is no longer imported by the application.

The `standalone-migration` branch is based on a Git baseline commit created from the current source. `.env`, `node_modules`, `.next`, and `.figma/content-inputs/` are excluded from that baseline.

## Milestones

### 0. Preserve and characterize

- [x] Initialize Git and create baseline commit.
- [x] Create `standalone-migration`.
- [x] Inspect app config, dependency manifest, generated import map, environment references, collections, public routes, and existing reports.
- [x] Verify that the currently installed Payload/PostgreSQL/S3 package versions are available from the registry.
- [ ] Snapshot expected public route and CMS behavior before changing integration.

### 1. Standard Payload runtime

1. Install exact-version `@payloadcms/db-postgres` matching current Payload, after compatibility is validated.
2. Replace `buildFigmaConfig` with standard `buildConfig` and PostgreSQL adapter while preserving collections/globals and supported options.
3. Add a locally generated `PAYLOAD_SECRET` and a `DATABASE_URL` read from `.env.local`; never commit values.
4. Confirm the standard `@payloadcms/next` route/layout integration and admin auth behavior for the installed Payload version.
5. Remove unsupported/unused Figma admin UI imports by regenerating the import map, not by guessing replacement symbols.
6. Configure the Payload Admin user collection and provide documented first-admin bootstrap instructions.

**Exit criteria:** Payload config imports without Figma variables; admin login and collection operations work against local PostgreSQL.

### 2. Local persistence and media

1. Add PostgreSQL Compose service bound to localhost, with credentials supplied by ignored `.env.local`.
2. Choose migration-only schema management for reproducibility. Do not enable automatic destructive schema sync on app startup.
3. Generate an initial migration from the current schema and review it before running. Existing Figma Cloud documents and media are not migrated by this step.
4. Keep local uploads on Payload's built-in local storage and confirm upload size/MIME constraints.
5. Add S3 storage adapter configuration only for production environment; use task/IAM roles and a private bucket policy, not AWS keys in browser code.
6. Document separate file/data migration if existing hosted data must be retained.

**Exit criteria:** local media upload persists across app restarts (host directory/volume), relates to projects/articles, and S3 remains disabled without AWS configuration.

### 3. Platform integration cleanup

1. Replace the former Figma-derived site origin with a standard public URL variable. **Complete.**
2. Remove unused platform variables, preview-origin configuration, MCP integration, and custom image loader. **Complete.**
3. Remove the Figma-only asset route and custom-code injection helpers. **Complete.**
4. Preserve standard Payload REST/GraphQL/admin route wrappers and regenerate the import map. **Complete.**
5. Retain required `.figma/make` lifecycle scripts and preserve `.figma/content-inputs/` as unverified starter/import data; neither is imported by the runtime.

**Exit criteria:** no Figma package or required Figma environment setting in the app runtime. Platform-owned lifecycle files and one generated legacy admin logout handler remain outside the app integration path.

### 4. Data security and publishing

1. Write and test explicit collection/global access policy; keep enquiry data private and public creates narrow.
2. Filter sample testimonials out of public views and keep sample projects explicitly badged.
3. Choose and implement publish-fresh cache invalidation for lists, details, old/new slugs, and media replacements.
4. Validate REST/GraphQL access directly, not only Server Actions.

**Exit criteria:** unauthenticated users cannot access drafts, staff data, or unauthorized write operations; publishing/removal reflects on public pages without a full redeploy.

### 5. Validation and local acceptance

- TypeScript check independently; remove `ignoreBuildErrors`.
- Add lint and tests for key access and enquiry cases.
- Run production build.
- Verify homepage, About, Services, Projects/list/detail, Journal/list/detail, Contact, and admin login.
- Test project/journal CRUD, media uploads, enquiry submission, and publish/unpublish behavior against disposable local data.
- Record every command and result in `MIGRATION_TEST_REPORT.md`.

### 6. AWS readiness (not yet provisioned)

Document Docker/ECS/RDS/S3/CloudFront/Secrets Manager/CI deployment. Do not provision resources before explicit approval and a successful local milestone.

## Rollback

The pre-migration implementation is recorded in the initial Git commit. Roll back source by checking out that baseline or reverting migration commits; do not assume database content rolls back with source. Keep all schema changes additive where possible and back up any real data before migration.
