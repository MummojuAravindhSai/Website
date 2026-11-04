# Implementation Plan

This is the prioritized follow-up to the initial audit. It is a proposal, not a claim that the listed implementation or runtime verification has already happened.

## Phase 1 — Close access-control and content-trust gaps

1. Confirm Payload 4 beta's effective access defaults, then add explicit collection-level access rules for Media, Tags, and Folders. Keep public reads only where the public site requires them; keep writes admin-only.
2. Review every collection and global for anonymous read/create/update/delete behavior, including the generated REST and GraphQL routes.
3. Decide whether all Admins are equivalent. If editor/enquiry-manager roles are intended, implement and test operation-specific authorization; otherwise remove misleading role distinctions from the admin UI after confirming this behavior change.
4. Prevent `isSample` testimonials from appearing as real client endorsements. Treat all existing sample content as unverified until the business confirms it.
5. Confirm whether uploaded media can contain draft/private material and align its API access with that policy.

**Exit checks:** Access matrix documented; anonymous REST and GraphQL requests cannot mutate staff-managed collections; draft/private records and sample testimonials do not leak into public views.

## Phase 2 — Build integrity and repeatable validation

1. Remove or narrowly justify `typescript.ignoreBuildErrors`; add a dedicated type-check command.
2. Add lint and test commands only with the chosen repository-standard tools and minimal required dependencies.
3. Add focused tests for collection access, enquiry field validation, draft visibility, sample-content filtering, and slug routes.
4. Add a route error boundary and structured server-side logging for failed public mutations.

**Exit checks:** Type check, lint, focused tests, and production build are repeatable in the standalone deployment workflow.

## Phase 3 — Define the content lifecycle

Choose one lifecycle before changing page/data behavior:

- **Build-time snapshot:** Keep fixed pages and generated slugs static, document that CMS edits require another Publish/deploy, and verify newly published slugs after redeploy; or
- **Fresh after Publish:** Add Payload collection hooks and cached reads, invalidate listing pages and old/current slug keys on every write, and invalidate content pages when related media changes. Verify fresh production requests after publishing.

Do not mix periodic revalidation with incomplete on-write invalidation.

**Exit checks:** The production route table matches the selected lifecycle; published edits and slug changes behave as documented.

## Phase 4 — Enquiry workflow and privacy

1. Align collection-boundary validation with the server action's allowlist and value checks.
2. Add a proportionate anti-abuse strategy and decide how accidental duplicate submissions should be handled.
3. Add clear privacy/consent copy and avoid exposing enquiry details through public API responses.
4. Log failures without logging enquiry PII or secrets; return structured user-visible errors.
5. Test server-side mobile/email validation, invalid enum values, direct API access, duplicate behavior, and admin-only enquiry fields.

**Exit checks:** Valid requests persist once; malformed and abusive requests are rejected; anonymous users cannot read or change enquiries or internal fields.

## Phase 5 — CMS and public content completeness

1. Confirm verified studio information and content; do not invent facts or retain sample entries as genuine claims.
2. Complete project/media management only after checking existing records and the platform's upload behavior.
3. Add publication date display and decide whether journal/project related items are editor-selected relationships or derived by category.
4. Decide if journal categories need a managed taxonomy and if services need CMS-managed images/visibility controls.
5. Scope the requested operational dashboard and recent activity with Payload-supported data rather than hardcoded counts.

**Exit checks:** Editors can manage approved content without public draft leakage; representative published documents render correctly.

## Phase 6 — Responsive, accessibility, and SEO verification

1. Associate form errors and validation state with controls; announce selected project filters and active navigation; verify keyboard operation and mobile menu focus behavior.
2. Verify actual alt text and nonzero image dimensions for all relevant published content.
3. Add page-level metadata, sitemap, and robots behavior consistent with the final public domain and indexing policy.
4. Check tablet/mobile breakpoints, empty/error/loading states, and reduced-motion behavior in a browser.

**Exit checks:** Every requested route works on desktop and mobile, keyboard flows work, and metadata/robots outputs match the launch requirements.

## Phase 7 — Production acceptance

Run the Make deployment verifier, inspect its route table, visit every generated public route, and test the production-like CMS path: authentication, CRUD, media replacement, draft privacy, publishing, and enquiry persistence. Keep secrets in platform-managed environment configuration and document any blocked platform operation.

## Dependency and schema safety

Before any required/unique/type/cardinality change, data migration, content bulk update, or deletion, inspect existing documents and obtain the required confirmation. Do not edit Payload-managed route files or hand-edit generated `payload-types.ts`.
