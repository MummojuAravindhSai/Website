# API and Data Contracts

## Scope

This document records the API surfaces visible in the current source. Payload's generated route handlers provide the REST and GraphQL endpoint implementations; their full generated schema is version-dependent. Verify effective access rules in the target deployment environment before launch.

## Public website reads

These are called from server components via `src/lib/content.ts`, not from browser-side fetches:

| Data             | Payload collection/global  | Current behavior                                                                                     |
| ---------------- | -------------------------- | ---------------------------------------------------------------------------------------------------- |
| Website settings | `website-settings` global  | Public read; used for studio/contact details and footer.                                             |
| Project listing  | `projects`                 | Published and active records are intended public; optional featured filter, sort order, maximum 100. |
| Project detail   | `projects` by slug         | Published document lookup through `findBySlug`; missing result calls `notFound()`.                   |
| Services         | `services`                 | Published and enabled records are intended public; sorted by `sortOrder`.                            |
| Journal listing  | `journal-articles`         | Published documents sorted by `publishedOn`; default maximum 100.                                    |
| Journal detail   | `journal-articles` by slug | Published document lookup through `findBySlug`; missing result calls `notFound()`.                   |
| Testimonials     | `testimonials`             | Published documents sorted by creation date; current homepage does not filter `isSample`.            |

Collection access rules, not UI filtering, must remain authoritative for public visibility.

## Consultation submission

### Client contract

The contact form invokes `submitEnquiry(previousState, formData)` as a Server Action.

Accepted form fields:

| Field                | Current validation                                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `name`               | Trimmed, max 100 characters; at least 2 characters.                                                                   |
| `mobile`             | Trimmed, max 20; whitespace removed; must match `+91` followed by a valid 10-digit Indian mobile number starting 6–9. |
| `email`              | Trimmed, max 200; basic `local@domain.tld` syntax.                                                                    |
| `city`               | Trimmed, max 100; at least 2 characters.                                                                              |
| `propertyType`       | One of Apartment, Villa, Independent home, Commercial space, Other.                                                   |
| `propertySize`       | Trimmed, max 60; optional.                                                                                            |
| `requiredServices`   | Repeated values allowlisted against the current service options; at least one valid value required.                   |
| `preferredStartDate` | Trimmed, max 40; optional; Payload date validation is relied on for persistence.                                      |
| `budgetRange`        | Optional; if supplied, must match one of the configured INR ranges.                                                   |
| `description`        | Trimmed, max 2,000; optional.                                                                                         |
| `preferredContact`   | One of Phone, WhatsApp, Email.                                                                                        |

On success, the action returns `{ status: 'success', message }`. On invalid input, it returns `{ status: 'error', message, errors }`, where `errors` maps field names to user-facing validation text. Persistence failures currently return a generic error and are not logged.

### Persistence contract

The action creates a record in `enquiries` using the Payload Local API with `overrideAccess: false`. The collection allows anonymous create, restricts collection read/update/delete to admins, protects `status` from anonymous create/update, and protects `internalNotes` from anonymous create/read/update.

These collection fields are stored:

- Customer: `name`, `mobile`, `email`, `city`
- Project request: `propertyType`, `propertySize`, `requiredServices`, `preferredStartDate`, `budgetRange`, `description`
- Follow-up preference: `preferredContact`
- Staff workflow: `status`, `internalNotes`

The action's validation does not automatically apply to direct REST/GraphQL creates. Collection-level validation and request-abuse controls remain follow-up work.

## Payload endpoints

Generated handlers are mounted under `/api`:

- `GET/POST/PUT/PATCH/DELETE/OPTIONS /api/*` — Payload REST API.
- `POST/OPTIONS /api/graphql` — Payload GraphQL API.
- `GET /api/graphql-playground` — GraphQL playground endpoint.
- `/admin/*` — Payload Admin.
- Admin logout is handled by the Payload Admin route configured in `src/payload.config.ts`.

Expected authorization from current source:

- Projects: admins can manage all records; public reads are constrained to published and active.
- Services: admins can manage; public reads are constrained to published and enabled.
- Journal articles and testimonials: admins can manage; public reads are constrained to published.
- Enquiries: public create; admin-only read/update/delete, with staff-only workflow fields.
- Website settings: public read and admin update.
- Admins: create is explicitly denied; read/update/delete require an authenticated admin.
- Media: public read is explicitly allowed; other operations are not explicitly declared.
- Tags and Folders: no access rules are explicitly declared.

Payload's effective default behavior for omitted operations must be verified; explicitly deny all unintended anonymous operations before production. Consider disabling the GraphQL playground if it is not needed in production.

## Error behavior and gaps

- Missing detail records render the frontend not-found page.
- Invalid form values return structured field errors.
- Persistence errors are caught and returned generically, with no server logging or error categorization.
- No request rate limit, duplicate-submission policy, or spam protection is visible.
- No custom API error envelope is defined; REST/GraphQL behavior is Payload-version dependent.
- Public reads of Media may expose assets not referenced by published content.
