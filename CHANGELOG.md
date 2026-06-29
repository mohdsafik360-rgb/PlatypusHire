# Changelog

## v0.3.0 - Consistent UI optimization pass

### Added
- Added a **Resume Settings** accordion using the same card/accordion UI pattern as the existing editor.
- Added layout density modes: Auto, Compact, Normal, and Spacious.
- Added a one-page fit toggle so users can decide whether dense resumes should be forced into one A4 page.
- Added a live top-bar fit status indicator showing whether the resume is balanced, dense, critical, spacious, or overflowing.
- Added a local-only **Resume Check** panel with non-AI checks for contact details, skills, measurable bullets, action verbs, and section completeness.
- Added resume JSON import/export backup controls in the top bar.

### Improved
- Improved the dynamic one-page scaler so it responds to user-selected density settings instead of using only hard-coded automatic spacing.
- Improved the cropper with direct drag-to-position support, a reset crop action, and clearer crop guidance.
- Reduced cropped photo storage size by exporting a smaller compressed JPEG, lowering localStorage quota risk.
- Kept the UI visually consistent: existing buttons, accordions, muted cards, border radius, spacing, typography, and neutral color treatment are preserved.

### Optimized
- Removed unused package dependencies that were not imported by the source tree, reducing install size and dependency surface.
- Corrected Tailwind content paths to scan the `src/` project tree.
- Hardened the production build script so it does not fail when `public/` is absent.

### Notes
- The sandbox still has no installed `node_modules`, so full dependency-backed validation must be run locally with `npm install && npm run typecheck && npm run lint && npm run build`.

## v0.2.3 - Dynamic one-page PDF and image controls

### Fixed
- Replaced the PDF button's print-dialog behavior with client-side PDF file generation/download.
- Added one-page auto-fit logic that scales dense resume content down inside the A4 canvas instead of spilling into a second page.
- Kept short resumes visually cleaner by increasing spacing density when content is sparse.
- Made the photo column width follow the selected photo size so resized photos cannot collide with text.

### Added
- Added a passport photo crop confirmation modal with two clear actions: **Edit again** and **Confirm**.
- Added crop controls for zoom, horizontal position, and vertical position before applying the uploaded photo.
- Added an include/exclude photo toggle independent from deleting the uploaded image.
- Added a live photo-size slider so the user can resize the image directly in the resume preview/PDF.
- Added automatic URL linkification across preview text fields, bullets, project URLs, certification URLs, and contact links.
- Added PDF link annotations so generated PDF URLs remain clickable where supported by the PDF viewer.

### Dependencies
- Added `html2canvas` and `jspdf` for direct browser-side PDF downloads.

## v0.2.2 - Resume photo overlap fix

### Fixed
- Reworked the resume preview header from an absolutely positioned photo to a two-column grid layout so uploaded passport photos cannot overlap name, title, contact details, or exported PDF text.
- Preserved the fixed 35×45mm photo dimensions in print/PDF while reserving a dedicated text-safe column.
- Added aggressive wrapping for long names, job titles, emails, URLs, LinkedIn, and GitHub handles so header text stays inside its own column.


## v0.2.1 - Overall flaw fixes and hardening

### Fixed
- Corrected drag-and-drop wiring in sortable resume sections by binding draggable props and refs to the draggable wrapper instead of relying on child-card refs.
- Fixed hidden bullet index corruption when deleting bullets from Work Experience, Education, and Projects.
- Added bounds checking to section reordering so invalid drag indices cannot insert undefined entries.
- Added a browser-safe fallback ID generator for environments where `crypto.randomUUID()` is unavailable.
- Hardened localStorage resume hydration with normalization and type-safe fallbacks so malformed/stale saved data does not poison the store.
- Removed production build masking by disabling `typescript.ignoreBuildErrors` in `next.config.ts`.

### Improved
- Re-enabled React Strict Mode for better development diagnostics.
- Tightened TypeScript configuration by enabling `noImplicitAny`.
- Added a `typecheck` script for explicit TypeScript validation.
- Added `@types/node` to development dependencies for server/runtime type coverage.
- Improved accessibility labels for bullet visibility, bullet deletion, item deletion, and drag handles.

### Notes
- This pass was completed without installed dependencies in the sandbox, so dependency-backed `next build`/`eslint` could not be fully executed here. Run `npm install && npm run typecheck && npm run lint && npm run build` locally after extraction.

## v0.3.3 — Build Fix Pass

- Fixed production build failures caused by remote Google Font fetching by switching to local system font fallbacks.
- Fixed Framer Motion variant typing errors under strict TypeScript.
- Fixed draggable item style typing in the sortable list.
- Narrowed typecheck/lint scope to active application files so unused shadcn scaffold files do not break builds.
- Reduced package dependencies to the modules currently required by the active app.
- Verified `npm run typecheck`, `npm run lint`, and `npm run build` pass locally in the sandbox.
