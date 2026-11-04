# AWS Production Deployment

## Target architecture

- ECS Fargate service behind an Application Load Balancer.
- Private RDS for PostgreSQL, reachable only from the ECS service and the
  controlled build/migration environment.
- Private S3 media bucket. The ECS task role grants Payload only the required
  bucket/object access; do not put static AWS keys in task environment variables.
- CloudFront for the public site and media. Use an S3 Origin Access Control
  (OAC) for the private media bucket and HTTPS-only viewer access.
- AWS Secrets Manager values injected into ECS task definitions as secrets.
  The application reads `DATABASE_URL` and `PAYLOAD_SECRET` from its environment;
  it does not call Secrets Manager itself.
- AWS WAF rate limiting on public form/API requests and protection for the
  admin/API paths.

## Build and migration

The public pages are intentionally built as a CMS content snapshot. A build
requires access to the production database and reads the content available at
that time. After publishing content or adding a new article/project slug, build
and deploy a new application image. The build job must run in a network location
that can connect to private RDS; do not make RDS public to accommodate builds.

BuildKit secrets are used for build-time database access. Inject these values
from the build environment's Secrets Manager integration; do not put them in
Docker build arguments, `.env` files in the build context, or image layers.
`AWS_REGION`, `S3_BUCKET`, `S3_PREFIX`, `S3_ENDPOINT`,
`ASSET_CDN_URL`, and `NEXT_PUBLIC_SITE_URL` are non-secret build configuration
and must match the ECS runtime configuration.

The first image is a dedicated migration runner and does not need database
credentials at image-build time. Build and push it first:

```sh
docker buildx build \
  --target migration-runner \
  --tag <account>.dkr.ecr.<region>.amazonaws.com/interior-design-migrate:<commit> \
  --push .
```

Run that image once as an ECS task with the private database and S3 environment
and Secrets Manager references, and wait for `pnpm payload migrate` to succeed.
The first S3 deployment must apply the checked-in Media storage metadata
migration before the production build, because static generation loads the S3
schema and reads media relationships from PostgreSQL.

After migrations succeed, build and push the normal app image. The build job
must use BuildKit secrets for the database and Payload secret and have access
to the production database:

```sh
docker buildx build \
  --secret id=DATABASE_URL,env=DATABASE_URL \
  --secret id=PAYLOAD_SECRET,env=PAYLOAD_SECRET \
  --build-arg AWS_REGION \
  --build-arg S3_BUCKET \
  --build-arg S3_PREFIX \
  --build-arg S3_ENDPOINT \
  --build-arg ASSET_CDN_URL \
  --build-arg NEXT_PUBLIC_SITE_URL \
  --tag <account>.dkr.ecr.<region>.amazonaws.com/interior-design:<commit> \
  --push .
```

Then deploy the app image. Do not run migrations concurrently from every
application task or during each app startup.

## ECS task configuration

Set the app container to listen on port `3000`; the image runs as a non-root
user and includes a `/healthz` container health check. Configure the ALB health
check path to `/healthz`, use HTTPS at the public edge, and allow inbound traffic
to the task only from the ALB security group.

Inject these secrets using ECS `secrets` references to Secrets Manager:

- `DATABASE_URL` — RDS connection string; use TLS (for example, PostgreSQL
  `sslmode=require`) and a least-privilege application database user.
- `PAYLOAD_SECRET` — a long, stable random secret. Keep it unchanged across
  task replacements.

For a JSON secret-value example, exact ECS `valueFrom` key mapping, and the
current application data model, see
[AWS_SECRETS_AND_SCHEMA.md](./AWS_SECRETS_AND_SCHEMA.md).

Set these non-secret task environment variables:

- `NODE_ENV=production`
- `PAYLOAD_STORAGE=s3`
- `AWS_REGION`
- `S3_BUCKET`
- `S3_PREFIX` (if configured)
- `S3_ENDPOINT` (only when using a non-default S3 endpoint)
- `ASSET_CDN_URL`
- `NEXT_PUBLIC_SITE_URL`

Attach an ECS task role with least-privilege S3 permissions. Do not set
`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, or `AWS_SESSION_TOKEN` in ECS;
the AWS SDK uses the task role.

## S3 and CloudFront

Keep S3 Block Public Access enabled and use bucket-owner-enforced object
ownership. Grant the ECS task role only the required list/read/write/delete
permissions under the selected prefix. Grant CloudFront OAC read access to
objects under that prefix; never make the bucket public to make website images
load.

Set `ASSET_CDN_URL` to the HTTPS CloudFront distribution origin only, for
example `https://d1234567890.cloudfront.net` (no path, query, or credentials).
Configure the CloudFront S3 origin with no origin path. The app maps Payload's
S3 object URLs to that CDN origin for public website images; the Payload S3
endpoint itself remains the upload API endpoint.

For a CloudFront distribution in front of the ALB, do not cache `/admin/*`,
`/api/*`, or Server Action requests. Forward the required cookies, headers, and
query strings for those routes. Cache fingerprinted `/_next/static/*` assets
for a long duration. Add WAF rate limits for public enquiry submissions and
protect admin/API routes.

## Before public launch

- Apply migrations to the production database and confirm the app and migration
  task use the same schema and environment configuration.
- Create the initial Payload admin account through the first-user flow, then
  verify anonymous admin/account creation is denied.
- Replace or explicitly approve all sample portfolio, service, testimonial, and
  journal content. The UI labels sample content; it is not verified business
  copy.
- Configure and verify a Payload email adapter and sender identity. No email
  adapter is currently configured, so Payload's default email output is logged
  by the server rather than delivered (including password-reset mail).
- Verify public routes, enquiry submission, media upload/replacement, CloudFront
  image dimensions, admin sign-in, and database/S3 persistence against the
  deployed environment.
- Configure RDS backups, encryption, retention, recovery testing, CloudWatch
  alarms/log retention, ECS rolling deployment health checks, and an incident
  rollback procedure.
- Review the Payload and Next.js dependency versions and complete a dependency
  vulnerability review before launch. Payload is currently pinned to a beta
  release, so upgrading to a supported stable release should be treated as a
  separate compatibility and migration task, not an untested last-minute bump.
- The latest production audit leaves one low-severity `deepmerge` advisory with
  no patched release available. Recheck `pnpm audit --prod` immediately before
  launch; the transitive override patching current high-severity advisories is
  recorded in `package.json`.
- The public Enquiries collection allows anonymous create operations. Keep AWS
  WAF rate limiting enabled for enquiry/API writes, and verify request-size
  limits and abuse monitoring before exposing the endpoint.

This repository does not create AWS resources or deploy to an AWS account. The
CloudFront distributions, WAF, ALB, VPC, RDS, S3, Secrets Manager entries, ECS
task definitions, and IAM roles must be provisioned and tested separately.
