# Application Architecture

## Runtime and platform

This application is a Next.js App Router project using React Server Components by default, with Client Components for interactive UI such as the mobile navigation, project browser, video-card sample control, and consultation form. The app is designed to run in Figma Make.

Figma Make owns the database, authentication integration for Payload Admin, file storage, deployment runtime, and platform secrets. `src/payload.config.ts` uses `buildFigmaConfig()`; the app does not configure a database adapter, Payload secret, or standalone storage provider.

## Route groups

- `src/app/(frontend)/` contains the public site:
  - `/` — editorial landing page and featured content
  - `/about` — studio information (currently mostly source-authored copy)
  - `/services` — Payload-backed service list
  - `/projects` and `/projects/[slug]` — Payload-backed portfolio
  - `/journal` and `/journal/[slug]` — Payload-backed articles
  - `/contact` — public consultation form
- `src/app/(payload)/` contains Payload-generated Admin, REST, and GraphQL wrappers. Do not edit generated files directly unless recovering a documented generator failure.
- `src/app/(frontend)/.figma/make/[asset]/route.ts` serves the Make favicon and social image by an explicit allowlist.

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

Tailwind CSS v4 is loaded from `src/app/(frontend)/styles.css`, with shared editorial design styles and reduced-motion support. CMS media is rendered through `MediaImage` and Next Image, using the existing Figma custom loader in `figma-image-loader.ts`. Static sample images live under `public/assets/`.

The root layout defines shared fonts, navigation, footer, and global metadata. Make site settings are imported from `.figma/make/site.json`; custom HTML can be inserted by `src/lib/make-custom-code.tsx`, including a `dangerouslySetInnerHTML` body fragment, so that configuration must remain trusted and reviewed.

## Configuration and build

- Dependencies are pinned by `pnpm-lock.yaml`; toolchain versions are specified in `.mise.toml`.
- `next.config.ts` wraps the app with `withPayload`, configures the preview origin, standalone output, and custom image loader.
- `typescript.ignoreBuildErrors` is currently enabled and must not be interpreted as a passing type check.
- `.figma/make/*` provides the platform install, dev, deploy, and deploy-preview lifecycle.
- Figma platform variables and Payload backend values are platform-owned; do not add local dummy values or expose secrets in client bundles.

## Architecture decisions for follow-up

1. Select either an intentional build-time snapshot or a complete publish-fresh cache invalidation design.
2. Use explicit collection access rules as the authorization boundary for every public API path.
3. Keep CMS content in Payload and use the provided Figma data tooling for document CRUD/seeding when available.
4. Preserve source-authored content only where it is genuinely static UI; move verified business-managed facts into CMS settings/content as scope requires.
