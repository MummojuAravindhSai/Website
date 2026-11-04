# Testing Report

## Phase One validation

| Check | Result | Notes |
|---|---|---|
| Source/config audit | Completed | Frontend routes, Payload schemas/config, server action, generated route wrappers, styles, package manifest, and Make scripts inspected. |
| Toolchain | Installed | Activated the repository-pinned Node `24.22.1` with the installed fnm version manager and installed pnpm `10.34.3`. |
| Dependencies | Installed | `pnpm install --frozen-lockfile` completed successfully; the lockfile did not need changes. |
| TypeScript check | Not run | Dependency installation is now complete, but a direct type check has not yet been run. |
| Lint | Not run | No lint script or lint configuration was found in the project inventory. |
| Automated tests | Not run | No test script or test/spec files were found in the project inventory. |
| Development server | Started | The VS Code task `Run Next.js development server` starts Next.js 16.4.2 on port 3000 using Node `24.22.1`. |
| Homepage request | Blocked (HTTP 500) | Runtime logs report `Environment ID could not be resolved. Set FIGMA_EID or initialize the project.` The connected Figma Make/Payload backend is not provisioned in this shell context. No dummy values or app-level fallback were added. |
| Production build | Not run | Figma Make backend configuration is platform-owned and the Environment ID is unavailable in this shell. |
| Browser/route verification | Blocked | The homepage returns HTTP 500 before rendering because Payload config cannot initialize. Admin, other public routes, persistence, publishing, and responsive views were not verified. |

## Follow-up verification required

After connecting/provisioning this app through its supported Figma Make lifecycle:

1. Restart the dev task inside the provisioned environment and confirm `/` returns successfully.
2. Run a direct TypeScript check independently of the Next build.
3. Add and run lint and targeted tests for collection access, enquiry validation, draft visibility, and sample-content filtering.
4. Run the production build and inspect the generated route table.
5. Visit every public route in preview/production and test mobile and keyboard interactions.
6. Test anonymous and authenticated REST/GraphQL access, admin CRUD, media upload/replacement, draft privacy, publish freshness, and enquiry persistence.

Do not treat `next.config.ts`'s `typescript.ignoreBuildErrors` setting as validation.
