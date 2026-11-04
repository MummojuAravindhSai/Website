# Project Audit

## Scope and evidence

This was the initial Phase One audit before the standalone conversion. Current
runtime and verification details are maintained in `ARCHITECTURE.md` and
`MIGRATION_TEST_REPORT.md`.

The local `.env` file was not opened, and no secret values were read or copied. The `.figma/content-inputs/` files were inventoried but not treated as verified business content. Binary assets and platform-owned internals were not independently validated. Findings about deployed Payload defaults, authentication, uploads, and production behavior still need runtime confirmation.

## Current architecture

- **Framework:** Next.js 16.4.2 App Router, React 19.3.1, TypeScript 6.0.3, Tailwind CSS 4.
- **CMS (at time of this audit):** Payload 4.0.0-beta.4 using the Figma-managed config. The app has since been converted to standard Payload `buildConfig` with PostgreSQL and configurable local/S3 media storage.
- **Public routes:** `/`, `/about`, `/services`, `/projects`, `/projects/[slug]`, `/journal`, `/journal/[slug]`, and `/contact`, under `src/app/(frontend)/`.
- **CMS routes:** Payload-generated `/admin` and `/api/*` handlers under `src/app/(payload)/`. These generated files should remain platform/Payload managed.
- **Content model:** Admins, media, folders, tags, projects, services, journal articles, testimonials, enquiries, and website settings.
- **Content access:** Server-side queries use the Payload Local API with `overrideAccess: false`. Project, service, article, and testimonial collections define public published-content filters. Enquiries allow public create and restrict read/update/delete to admins.
- **Frontend content lifecycle:** Homepage, listing pages, services, contact, and about pages opt into static rendering. Project and article detail pages enumerate static params and set `dynamicParams = false`. No collection hooks or on-write revalidation are present.
- **Styling and media:** Tailwind v4 utilities plus shared CSS tokens; Next Image uses the built-in loader. The visual system uses ivory, beige, taupe, charcoal, serif headings, and large image blocks.
- **Environment (at time of this audit):** Figma Make injected platform variables. The standalone runtime now uses documented server-side environment variables, with `.env.local` ignored by Git.
- **Build tooling:** Package scripts provide `dev`, `build`, `start`, `format`, and Payload generation commands. There is no `lint`, `test`, or `typecheck` script.

## Existing features

- Premium editorial-style layout and responsive navigation.
- Public project browsing with client-side category filtering and search, project detail pages, project image galleries, and simple related-project links.
- Journal listing and detail pages with category/excerpt/body and cover images.
- CMS-driven services, project, journal, testimonial, and global settings reads.
- Consultation form with server-side field checks for Indian mobile format, email syntax, city, property type, selected service, budget, and contact method; the action creates a Payload enquiry.
- Enquiry status and admin-only internal-notes fields.
- Draft/published workflows for projects, services, journal articles, and testimonials.
- Empty states for several public listings, a frontend not-found page, reduced-motion CSS, and image alt text from media records.
- Sample-content flags and labels on projects, services, and journal entries.

## Findings

Severity reflects likely impact if the current configuration is deployed as-is. Confidence reflects the strength of the source evidence, not production exploitability.

### Critical / high priority

1. **Access rules are missing on operational media collections.** `Tags` and `Folders` have no collection access configuration. `Media` explicitly makes reads public but does not explicitly define create/update/delete access. Payload collections are permissive unless access is restricted; confirm the effective behavior for this beta and explicitly restrict every operation to admins except intentionally public media reads. Public writes could enable unauthorized content changes or uploads.  
   Evidence: `src/collections/Tags.ts`, `src/collections/Folders.ts`, `src/collections/Media.ts`.  
   Confidence: **high** for missing rules; **medium-high** for effective deployed exposure pending a direct API test.

2. **Admin role metadata does not implement role-based permissions.** The Admins collection has a `role` field, but collection access checks only whether `req.user.collection === 'admins'`. Every authenticated admin therefore receives the same capabilities; the administrator/editor/enquiry-manager distinctions are not enforced.  
   Evidence: `src/collections/Admins.ts`, all collection `access` definitions.  
   Confidence: **high**.

3. **Published sample testimonials can be displayed as genuine testimonials.** The homepage queries all published testimonials and renders the first quote without checking `isSample` or labelling it as sample content. This conflicts with the requirement not to fabricate or misrepresent testimonials.  
   Evidence: `src/lib/content.ts`, `src/app/(frontend)/page.tsx`, `src/collections/Testimonials.ts`.  
   Confidence: **high**.

4. **Enquiry action errors are swallowed and public submission has no abuse controls.** `submitEnquiry` catches all failures without logging or distinguishing validation, permission, and backend errors. The collection permits anonymous creation, and there is no visible rate limit, duplicate-submit guard, or spam control. The server action validates its own inputs, but direct REST/GraphQL callers do not pass through those action-specific checks.  
   Evidence: `src/app/(frontend)/actions.ts`, `src/collections/Enquiries.ts`, generated `/api/*` handlers.  
   Confidence: **high** for missing controls and swallowed errors; **medium** for production abuse impact pending endpoint/runtime tests.

### Medium priority

5. **Static pages can become stale after CMS edits or publish.** The public pages are force-static, and dynamic project/article routes use `dynamicParams = false`. There are no revalidation hooks. Existing edits remain snapshots until a new deployment, and newly added slugs are not routable until they are included in a subsequent build. This lifecycle needs to be deliberately documented or changed before promising immediate publish visibility.  
   Evidence: frontend page modules, `src/lib/content.ts`, detail routes.  
   Confidence: **high**.

6. **TypeScript errors are ignored during production build.** `next.config.ts` sets `typescript.ignoreBuildErrors: true`, so a successful build does not prove the project type-checks. The attempted standalone type check did not run because pnpm and `node_modules` were unavailable in this environment.  
   Evidence: `next.config.ts`, `package.json`, validation attempt recorded in `TESTING_REPORT.md`.  
   Confidence: **high**.

7. **CMS media is readable publicly irrespective of whether it is used by published content.** The Media collection permits public reads. This can expose uploaded assets associated only with drafts or otherwise intended to remain private. Confirm whether that is the intended media policy and constrain access or asset placement if not.  
   Evidence: `src/collections/Media.ts`.  
   Confidence: **high** for public read configuration; **medium** for confidentiality impact because the intended upload policy is not specified.

8. **Contact data validation and persistence are split across the form action and collection.** The action checks several formats, but the collection schema does not repeat those validations. Direct API submissions can bypass action-only checks, and no submission size, duplicate, or rate policy is defined. The form has no visible consent/privacy notice.  
   Evidence: `src/app/(frontend)/actions.ts`, `src/collections/Enquiries.ts`, `src/app/(frontend)/components/consultation-form.tsx`.  
   Confidence: **high**.

9. **Business-facing content is a mixture of hardcoded copy and CMS data.** About-page story/process claims, homepage process/service positioning, and some location/experience statements are authored in source rather than Website Settings. Many CMS entries are explicitly sample content. Confirm all business claims and replace or retain them intentionally before launch. The About page correctly warns that credentials and biography are placeholders.  
   Evidence: `src/app/(frontend)/page.tsx`, `src/app/(frontend)/about/page.tsx`, `src/collections/*`.  
   Confidence: **high**.

10. **Journal requirements are only partially represented.** The article detail page does not display its `publishedOn` value, there are no related articles, and categories are free text rather than a managed category relationship. Project related items are simply the first two other projects, not based on a relationship or shared category.  
    Evidence: journal and project routes, `src/collections/JournalArticles.ts`, `src/collections/Projects.ts`.  
    Confidence: **high**.

11. **SEO and production metadata are incomplete.** The root layout defines site-wide metadata, but there is no page-level metadata for project/article detail routes and no `sitemap.ts` or `robots.ts` in the inventory. No evidence of production route verification or canonical URL behavior was available.  
    Evidence: `src/app/(frontend)/layout.tsx`, detail routes, project inventory.  
    Confidence: **high** for absent source modules; **medium** for deployment impact.

12. **No dedicated error boundary or structured server logging is visible.** The frontend has a `not-found.tsx` but no `error.tsx` boundary in the inventoried routes. The enquiry action's blanket catch provides neither operational logs nor a specific user-recoverable error path.  
    Evidence: frontend route inventory and `src/app/(frontend)/actions.ts`.  
    Confidence: **high**.

### Lower priority / follow-up

13. **Accessibility is partly implemented but incomplete.** Shared focus outlines and reduced-motion behavior exist, and the navigation button has an accessible name and expanded state. The navigation does not set `aria-current`, filter buttons do not announce the selected filter state, and form error messages are not associated with individual controls via `aria-describedby`/`aria-invalid`. Focus management and Escape handling for the mobile menu are absent. The skip link depends on a Make setting and is not guaranteed on.  
    Evidence: `src/app/(frontend)/components/site-header.tsx`, `project-browser.tsx`, `consultation-form.tsx`, layout, styles.  
    Confidence: **high**.

14. **Admin dashboard is Payload's default dashboard, not the requested operational dashboard.** Configuration lists default activity/collection widgets and no custom widgets for project, enquiry, or recent-activity metrics.  
    Evidence: `src/payload.config.ts`.  
    Confidence: **high**.

15. **Some installed dependencies may be unused.** The package manifest lists `monaco-editor` and `@payloadcms/plugin-cloud-storage`; no application-level imports/configuration were found in the source checked. Confirm whether generated/platform code requires them before removal.  
    Evidence: `package.json` and source search.  
    Confidence: **medium**.

## Incomplete requirements

- Admin metrics dashboard and role-specific access.
- Explicit authorization on every collection and media write operation.
- Complete project/media lifecycle review and validation, including file restrictions and replacement behavior.
- Immediate or clearly documented publish lifecycle for CMS content.
- Reliable enquiry workflow with abuse mitigation, deduplication policy, auditability, and operational error reporting.
- Publication dates and related-article/project semantics.
- Verified business identity, project data, testimonials, and contact details.
- Sitemap/robots and per-detail SEO metadata.
- Automated tests, linting, and CI/build checks.
- Browser verification of public routes, admin access, media uploads, drafts, publishing, and mobile layouts.

## Audit conclusion

The project has a coherent visual direction and a usable first-pass CMS-backed public site. It is not yet demonstrated production-ready. Resolve collection access exposure and sample testimonial publication first; then establish a documented content lifecycle and make the build/type-check gate meaningful. The audit does not claim that authentication, media, database persistence, publish updates, or production routes were tested.

## Related documents

- [Implementation plan](./IMPLEMENTATION_PLAN.md)
- [Architecture](./ARCHITECTURE.md)
- [API documentation](./API_DOCUMENTATION.md)
- [Environment template](./.env.example)
- [Testing report](./TESTING_REPORT.md)
