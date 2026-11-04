# Standalone Payload Configuration

## Runtime configuration

The app uses Payload's standard `buildConfig` with the version-matched
PostgreSQL adapter. `DATABASE_URL` and `PAYLOAD_SECRET` are required and read
only by server-side configuration.

Local media is stored in the ignored `uploads/` directory. Database schema
changes use checked-in Payload migrations; app startup does not create or reset
the database.

## Local environment

Copy `.env.local.example` to `.env.local` and set:

- `DATABASE_URL`: a local PostgreSQL connection string bound to `127.0.0.1`.
- `PAYLOAD_SECRET`: a unique random secret kept out of Git.
- `NEXT_PUBLIC_SITE_URL`: the public site URL; defaults to localhost for local
  development.

Do not add credentials to Next.js's `env` config or a `NEXT_PUBLIC_*` variable.

## Database and content

- Use the checked-in migrations on an empty local PostgreSQL database.
- Do not use `migrate:fresh` when the database contains needed content.
- Existing hosted content and uploads are not imported by the local setup. A
  separate export/import plan is required before moving existing data.
- Local uploads persist under `uploads/`, outside build output.

## Admin authentication

The existing `admins` auth collection remains the Payload admin-user collection.
Payload's first-user registration operation is only available while that
collection is empty; it uses the authenticated first-user flow and subsequent
anonymous registrations are rejected. Admin access stays separate from public
app accounts.

## Production follow-up

The local PostgreSQL adapter is not a production hosting plan. For deployment,
provide a private production database, durable media storage, backups, and
server-side secret management. `PAYLOAD_STORAGE=s3` enables the official
version-matched Payload S3 adapter; configure `AWS_REGION` and `S3_BUCKET`.
Credentials may be injected through AWS environment variables or supplied by an
AWS runtime role. The app does not retrieve secrets from a vault directly.
Enable S3 only after applying the checked-in Media storage metadata migration.
Existing local uploads are not copied automatically and must be transferred
before switching a populated deployment to S3. Keep the S3 mode and bucket
settings consistent during migrations, build, and runtime. The production
build also requires database access because frontend pages are statically
generated from Payload content.
