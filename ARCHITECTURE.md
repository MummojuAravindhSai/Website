# Application Architecture

## Runtime and platform

This is a standalone Next.js App Router application using React Server Components by default, with Client Components for interactive UI such as the mobile navigation, project browser, video-card sample control, and consultation form.

Payload uses PostgreSQL through `@payloadcms/db-postgres`, a server-only `PAYLOAD_SECRET`, and configurable local or S3 media storage. Production credentials are injected by AWS Secrets Manager through the ECS task definition; the application does not retrieve secrets itself.

## Route groups

- `src/app/(frontend)/` contains the public site:
  - `/` — editorial landing page and featured content
  - `/about` — studio information (currently mostly source-authored copy)
  - `/services` — Payload-backed service list
  - `/projects` and `/projects/[slug]` — Payload-backed portfolio
  - `/journal` and `/journal/[slug]` — Payload-backed articles
  - `/contact` — public consultation form
- `src/app/(payload)/` contains Payload-generated Admin, REST, and GraphQL wrappers. Do not edit generated files directly unless recovering a documented generator failure.

## Data model

`src/payload.config.ts` registers:

- `admins`: authenticated Payload CMS users.
- `media`: uploaded assets, with alt text, folders, and tags.
- `folders` and `tags`: Payload organization collections.
- `projects`: slugged portfolio documents with status, location, project type, metadata, cover image, and ordered gallery.
- `services`: slugged service content with enabled/sample flags and sort order.
- `journal-articles`: slugged article content with category, excerpt, body, cover image, publication date, and sample flag.
- `testimonials`: quote, client label, project label, and sample flag.
- `enquiries`: user-submitted contact/project requirements, workflow status, and internal notes.
- `website-settings`: public studio/contact settings.

Payload generates `src/payload-types.ts`; it should not be edited manually.

## Data access and rendering

`src/lib/payload.ts` constructs a Payload instance and provides slug/field helpers. `src/lib/content.ts` exposes server-only queries for public-facing lists and settings. Queries set `overrideAccess: false`; published-content visibility is enforced by collection access rules as well as `draft: false`.

Most public pages declare `dynamic = 'force-static'`. Project and article detail routes generate params from existing content and set `dynamicParams = false`. No write-triggered cache invalidation hooks are present, so the current architecture behaves as a build-time content snapshot; CMS changes require a subsequent build/deploy for dependable public updates and new slugs.

## Mutations and API surface

The contact form submits to `submitEnquiry`, a Next.js Server Action. It validates selected fields and creates an enquiry through the Payload Local API with `overrideAccess: false`. Payload-generated REST and GraphQL endpoints are also present and governed by collection access rules; action-only validation is not a substitute for collection-boundary validation.

## UI and assets

Tailwind CSS v4 is loaded from `src/app/(frontend)/styles.css`, with shared editorial design styles and reduced-motion support. CMS media is rendered through `MediaImage` and Next Image, using the built-in Next.js image loader. Static sample images live under `public/assets/`.

The root layout defines shared fonts, navigation, footer, an accessibility skip link, and global metadata. Public studio and contact information is managed through the Payload `website-settings` global.

## Configuration and build

- Dependencies are pinned by `pnpm-lock.yaml`; toolchain versions are specified in `.mise.toml`.
- `next.config.ts` wraps the app with `withPayload`, emits standalone output for ECS containers, and allows configured S3/CloudFront media URLs for Next Image. Production uploads use a private S3 bucket and CloudFront Origin Access Control; `ASSET_CDN_URL` switches public site images to the CDN.
- `scripts/start.mjs` supports local loopback binding and container binding via `APP_HOST`.
- Local/AWS environment variables are documented in `.env.example` and `LOCAL_SETUP.md`; never expose secrets in client bundles.
- [AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md) documents the ECS Fargate, private RDS, S3, CloudFront, and Secrets Manager deployment contract.

## Architecture decisions for follow-up

1. Select either an intentional build-time snapshot or a complete publish-fresh cache invalidation design.
2. Use explicit collection access rules as the authorization boundary for every public API path.
3. Keep CMS content in Payload and use Payload's supported data tools for document CRUD/seeding.
4. Preserve source-authored content only where it is genuinely static UI; move verified business-managed facts into CMS settings/content as scope requires.
