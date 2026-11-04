# AWS Secrets Manager Mapping and Application Schema

This project is a Next.js application backed by Payload CMS and PostgreSQL. It
does not use Java `application.properties`; ECS injects configuration into the
Node.js process as environment variables. The application reads
`process.env.DATABASE_URL` and `process.env.PAYLOAD_SECRET`.

## Secrets Manager secret

Create a Secrets Manager secret such as
`interior-design/production/app-config` with a JSON secret value:

```json
{
  "DATABASE_URL": "postgresql://<db-user>:<url-encoded-password>@<rds-endpoint>:5432/<database-name>?sslmode=require",
  "PAYLOAD_SECRET": "<long-random-stable-secret>"
}
```

Replace every placeholder with the values for your environment. Use a
least-privilege PostgreSQL application user, keep RDS private, and URL-encode
reserved characters in the username or password. Do not commit the real secret
value or put it in Docker build arguments.

## ECS environment mapping

In the app and migration task definitions, map each JSON key from that secret
to the environment variable Payload expects. Replace the example region,
account, secret name, and generated Secrets Manager suffix:

```json
{
  "secrets": [
    {
      "name": "DATABASE_URL",
      "valueFrom": "arn:aws:secretsmanager:ap-south-1:123456789012:secret:interior-design/production/app-config-AbCdEf:DATABASE_URL::"
    },
    {
      "name": "PAYLOAD_SECRET",
      "valueFrom": "arn:aws:secretsmanager:ap-south-1:123456789012:secret:interior-design/production/app-config-AbCdEf:PAYLOAD_SECRET::"
    }
  ],
  "environment": [
    { "name": "NODE_ENV", "value": "production" },
    { "name": "PAYLOAD_STORAGE", "value": "s3" },
    { "name": "AWS_REGION", "value": "ap-south-1" },
    { "name": "S3_BUCKET", "value": "<private-media-bucket>" },
    { "name": "S3_PREFIX", "value": "media" },
    { "name": "ASSET_CDN_URL", "value": "https://<cloudfront-domain>" },
    { "name": "NEXT_PUBLIC_SITE_URL", "value": "https://<site-domain>" }
  ]
}
```

The JSON-key suffix in `valueFrom` follows this format:
`<secret-arn>:<json-key>::`. ECS resolves it when starting the task; the
application itself does not call Secrets Manager. Add `S3_ENDPOINT` only for a
non-default endpoint. Do not set static AWS access keys on ECS: grant S3 access
to the ECS **task role**. Grant the ECS **task execution role** permission to
read the secret (`secretsmanager:GetSecretValue`) and, if applicable, decrypt
its customer-managed KMS key.

Use the same database and Payload secret for the migration task and application
task. The build pipeline also needs database access for the current
build-time CMS snapshot. Retrieve those values in the protected build
environment and pass them to Docker BuildKit using `--secret`; do not bake them
into the image, Docker arguments, or a checked-in file. See
[AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md) for the build and migration sequence.

## Current application data model

Payload owns the PostgreSQL schema. The checked-in Payload migrations create
and evolve it; do not create or alter the database tables separately with
handwritten DDL. The following is the current application-level schema from
the registered collection and global definitions:

| Payload collection/global | Fields and relationships |
|---|---|
| `admins` (auth) | Payload-managed email/password authentication; `name` (text), `role` (`administrator`, `editor`, or `enquiry-manager`). CMS access only; not public app accounts. |
| `media` (uploads) | Required `alt` text; Payload-managed upload metadata and file URL; optional Payload folder and tag organization. |
| `folders` | Required `name`; Payload folder-management fields. |
| `tags` | Required `name`; Payload tag-management fields. |
| `projects` | Required `title`, unique indexed `slug`, `projectType`, and `summary`; `isSample`, `recordStatus`, `location`, `scope`, `designApproach`, `materials[]`; optional `coverImage → media`; `gallery[]` rows with required `image → media` and optional `caption`; `featured`, `sortOrder`. Draft/version support is enabled. |
| `services` | Required `title`, unique indexed `slug`, and `summary`; optional `deliverables`; `enabled`, `isSample`, `sortOrder`. Draft/version support is enabled. |
| `journal-articles` | Required `title`, unique indexed `slug`, `excerpt`, and `body`; optional `category`, `coverImage → media`, `publishedOn`; `isSample`. Drafts, autosave, and scheduled publishing are enabled. |
| `testimonials` | Required `quote` and privacy-safe `clientLabel`; optional `projectLabel`; `isSample`. Draft/version support is enabled. |
| `enquiries` | Required `name`, `mobile`, `email`, `city`, `propertyType`, `requiredServices[]`, and `preferredContact`; optional `propertySize`, `preferredStartDate`, `budgetRange`, `description`; staff-managed `status` and `internalNotes`. Public create is enabled; reads, updates, and deletes are admin-only. |
| `website-settings` (global) | `studioName`, `studioDescriptor`, `primaryCity`, `email`, `mobile`, `whatsapp`, `address`, `instagramURL`, `consultationNote`. Public read; admin-only update. |

Payload also creates its internal tables for authentication, migrations,
relationships, uploads, globals, and enabled draft/version history. Exact SQL
table and column names are generated by the installed Payload/PostgreSQL
adapter and migrations, so the migration files and live database schema are
the authority if a SQL-level schema export is required. Apply migrations with
the dedicated migration task before building or deploying the application.

### Production data notes

- `enquiries` contains personal contact details. Keep its database private and
  retain the explicit admin-only read/update/delete rules. Public create
  requires WAF rate limiting and abuse monitoring.
- `admins` is exclusively for CMS editors. It is not a public customer account
  collection.
- `coverImage`, `gallery.image`, and `coverImage` on journal articles are
  relationships to `media`; uploaded files live in S3 in production.
- Several content collections use drafts/versions. Public access filters are
  enforced by the collection configuration.
