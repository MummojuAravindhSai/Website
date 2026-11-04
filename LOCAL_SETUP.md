# Local Development

## Requirements

- Node.js `24.22.1`
- pnpm `10.34.3`
- PostgreSQL `17`

The app uses a standard Payload PostgreSQL adapter and does not require
platform-specific runtime variables. Local environment values belong in the
ignored `.env.local`; never copy production credentials or data into it.

## First-time setup

1. In PowerShell, activate the pinned Node version:

   ```powershell
   fnm env --use-on-cd --shell power-shell | Out-String | Invoke-Expression
   fnm use 24.22.1
   ```

2. Copy `.env.local.example` to `.env.local` if it does not already exist. Set a
   random `PAYLOAD_SECRET` and a local-only `DATABASE_URL` for the PostgreSQL
   instance. `PAYLOAD_STORAGE=local` keeps uploads on disk. Do not overwrite
   an existing `.env.local`.
3. Start PostgreSQL on `127.0.0.1:5432` and create the `interior_design`
   database. To use the portable instance installed on the setup machine:

   ```powershell
   $pgBin = Join-Path $env:LOCALAPPDATA 'Programs\InteriorDesignWebsite\PostgreSQL-17.11\pgsql\bin'
   $pgData = Join-Path $env:LOCALAPPDATA 'InteriorDesignWebsite\postgres-data'
   $pgLog = Join-Path $env:LOCALAPPDATA 'InteriorDesignWebsite\postgres.log'
   & (Join-Path $pgBin 'pg_ctl.exe') -D $pgData -l $pgLog start
   ```

4. Install dependencies from the lockfile:

   ```powershell
   pnpm.cmd install --frozen-lockfile
   ```

5. Apply the checked-in Payload migrations:

   ```powershell
   pnpm.cmd payload migrate
   ```

6. Start the website:

   ```powershell
   pnpm.cmd dev
   ```

   Open `http://localhost:3000`. The Payload admin is at
   `http://localhost:3000/admin`. Create the first admin account using the
   one-time first-user setup screen; subsequent anonymous account creation is
   denied.

## Local PostgreSQL on Windows

The local development setup keeps PostgreSQL binaries and its database outside
the repository. The server should listen only on `127.0.0.1`; do not expose the
database port to the network. The development database is separate from any
hosted Payload instance and starts empty. Existing hosted content and uploads
are not copied.

If PostgreSQL is already installed, use that instance and set its connection
string in `.env.local`. For the portable user-local installation used on the
setup machine, the binaries are under
`%LOCALAPPDATA%\Programs\InteriorDesignWebsite\PostgreSQL-17.11\pgsql\bin`
and the persistent data directory is
`%LOCALAPPDATA%\InteriorDesignWebsite\postgres-data`.
Stop that server when finished with
`& (Join-Path $pgBin 'pg_ctl.exe') -D $pgData stop`.

Uploaded files are stored in the repository's ignored `uploads/` directory and
persist across app restarts.

## Useful commands

```powershell
pnpm.cmd typecheck
pnpm.cmd format:check
pnpm.cmd build
pnpm.cmd start
```

To add schema changes, generate and review a migration with
`pnpm.cmd payload migrate:create`, then apply it using `pnpm.cmd payload migrate`. Do
not run `migrate:fresh` against a database with data you need.

## Data and credentials

- `.env.local` and uploaded files are ignored by Git.
- `PAYLOAD_SECRET` and the database password are local-only secrets. Never put
  them in `NEXT_PUBLIC_*`, source code, or committed files.
- This local database is separate from any prior hosted CMS and starts without
  imported documents or media. Plan and verify a separate export/import before
  transferring existing content.

## AWS / managed secrets configuration

The same runtime variables can be set directly in `.env.local` for development,
or injected by AWS ECS/Secrets Manager, HashiCorp Vault, or another secret
manager at deploy time. The app does not fetch secrets from a vault itself and
never needs secrets added to source code or `next.config.ts`.

- `DATABASE_URL`: PostgreSQL connection URI; in AWS, point it at private RDS.
- `PAYLOAD_SECRET`: long random Payload signing/encryption secret.
- `NEXT_PUBLIC_SITE_URL`: deployed public HTTPS origin.
- `APP_HOST`: optional process/container environment variable for the Next.js
  bind host; defaults to `127.0.0.1`. Set it to `0.0.0.0` in a container behind
  an AWS load balancer.
- `PAYLOAD_STORAGE=s3`: opt in to S3 uploads; defaults to `local`.
- `AWS_REGION` and `S3_BUCKET`: required when S3 storage is enabled.
- `S3_PREFIX`: optional prefix for uploaded media objects.
- `S3_ENDPOINT`: optional S3 API endpoint; defaults to the regional AWS S3
  endpoint.
- `ASSET_CDN_URL`: optional HTTPS CloudFront origin for public website media.
  Configure CloudFront with the private S3 bucket as an OAC-protected origin
  and no origin path. This is separate from the S3 API endpoint.
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`: optional, but must be set as
  a pair. `AWS_SESSION_TOKEN` can be used with temporary credentials. On ECS,
  prefer a task role and leave all three unset.

Keep `PAYLOAD_STORAGE`, `AWS_REGION`, and `S3_BUCKET` consistent when running
Payload migrations, building, and starting the production app. The production
build also needs access to `DATABASE_URL` and `PAYLOAD_SECRET`, because static
site generation reads Payload content from the database.

When using S3, configure the task role for Payload to upload, read, and delete
objects under the selected prefix. Keep the bucket private and use CloudFront
Origin Access Control for public website image delivery. Keep the database,
Payload secret, and AWS credentials private and server-side.

Switching storage to S3 does not copy files already present in `uploads/`.
Before production cutover, transfer existing media objects to the configured
bucket/prefix and verify the corresponding Payload media records and public
image URLs. Do not switch a populated production database to S3 until that
transfer plan is complete.

For the production ECS deployment, use the container, migration, CloudFront,
and Secrets Manager checklist in [AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md).
