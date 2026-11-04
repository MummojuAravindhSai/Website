# Local Payload Setup Verification

## Status

The project now uses a standalone PostgreSQL/Payload runtime. The local database
and migrations were set up on this machine; no pre-existing hosted content or
uploads were copied.

## Verified

| Check                     | Result     | Evidence                                                                                                                                                                             |
| ------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| TypeScript                | Passed     | `pnpm.cmd typecheck`                                                                                                                                                                 |
| Production build          | Passed     | `pnpm.cmd build`; no Windows standalone-output symlink warning                                                                                                                       |
| Local route table         | Passed     | Static routes: `/`, `/about`, `/contact`, `/journal`, `/projects`, `/services`; SSG details: `/journal/[slug]`, `/projects/[slug]`; admin and Payload API routes are server-rendered |
| Public HTTP routes        | Passed     | `/`, `/about`, `/contact`, `/journal`, `/projects`, `/services` returned HTTP 200                                                                                                    |
| Empty detail routes       | Passed     | Unknown journal and project slugs returned HTTP 404                                                                                                                                  |
| Payload admin             | Passed     | `/admin`, `/admin/login`, and `/admin/create-first-user` returned HTTP 200; initial-user UI rendered                                                                                 |
| Payload API               | Passed     | `/api/globals/website-settings` returned HTTP 200; anonymous `/api/admins` returned HTTP 403 as expected                                                                             |
| Database migration        | Passed     | Initial Payload migration was applied to the local PostgreSQL database                                                                                                               |
| Local upload storage      | Configured | Media uploads use the ignored local `uploads/` directory                                                                                                                             |
| S3 configuration          | Passed     | `PAYLOAD_STORAGE=s3` selects the official version-matched Payload S3 adapter; bucket/region and image URL allowlisting are environment-configurable                                  |
| S3 metadata migration     | Passed     | Backed up the local database outside the repository, then applied `20261104_163042_add_media_storage_fields`                                                                         |
| S3-mode production build  | Passed     | `pnpm.cmd build` completed with S3 mode enabled using validation-only bucket settings and no AWS credentials                                                                         |
| Configurable host binding | Passed     | Production start responded HTTP 200 on a temporary port with `APP_HOST=0.0.0.0`                                                                                                      |

## Not exercised

- No admin account was created and no additional content was seeded.
- Project/journal CRUD, enquiry submission, media upload/restart persistence,
  and draft/publish lifecycle behavior were not tested.
- S3 connectivity and uploads were not tested because no AWS account, bucket, or
  deployment credentials were supplied. Production must provide the matching
  region, bucket, IAM task role or credential pair, and public media read policy.
- Existing local uploads were not copied to S3; plan and verify that transfer
  before enabling S3 for any populated deployment.
- This report verifies the local runtime, not a production AWS deployment.
- The database is local-only and starts without copied hosted documents/media.

## ECS/CloudFront production follow-up

- The standalone Next.js build completed in local-storage mode. TypeScript,
  targeted formatting, and HTTP smoke tests for `/healthz` and the static public
  routes passed.
- The current S3/CloudFront build did not complete against the local database:
  Payload's migration status reports the media-storage migration as applied,
  but a read-only schema check found `media.prefix` and
  `_media_v.version_prefix` absent. Static generation then failed on the
  missing `media.prefix` column. Reconcile this database state before treating
  S3-mode builds as verified. On AWS, run the migration task before the first
  S3-mode app build and verify the columns exist.
- A container image build could not be run because Docker/Podman/buildah are not
  installed in this environment.
- Production dependency audit initially found four high-severity transitive
  advisories. Overrides were added for patched DOMPurify, Zod, Happy DOM, and
  esbuild releases. The latest `pnpm audit --prod` reports only one low-severity
  `deepmerge` advisory with no patched version currently available; Payload
  remains on a beta release.
