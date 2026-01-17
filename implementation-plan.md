# Email Signature Generator Implementation Plan

## Overview

Build a minimal, professional email signature generator in React + Next.js at the repo root. The app provides a live signature preview, copy-as-HTML for email clients, a how-to-import modal, light/dark preview toggle, and logo upload that embeds as a data URL for Gmail compatibility.

## Current State Analysis

The repository does not contain application code yet. Only the Claude starter pack exists. This is a greenfield Next.js build.

## Desired End State

A single-page Next.js app with a warm, minimal UI inspired by the provided reference, fully responsive, and with a live HTML signature preview that can be copied to clipboard as HTML. The signature includes an uploaded logo (embedded as data URL), name, title, company, and phone/Twitter separated by a bullet when both exist. The preview supports a light/dark toggle that only affects the preview rendering.

### Key Discoveries:
- No existing UI or app structure; full scaffolding needed at repo root.

## What We're NOT Doing

- No backend or persistence (all state in memory).
- No account system or saved signatures.
- No hosted logo URLs or external image storage.
- No integration with email APIs.
- No advanced accessibility audit beyond baseline semantics and focus states.

## Implementation Approach

Use Next.js App Router with a single page, minimal component structure, and a small amount of client-side state. Generate signature HTML with inline styles and data URL image so Gmail can paste it as rich HTML. Clipboard copy will use `navigator.clipboard.write` with `text/html` and fallback to `text/plain` if needed.

## Phase 1: Project Scaffolding and Global Styling

### Overview
Create the Next.js app at repo root and set up the base layout, typography, and theme tokens for a warm minimal look.

### Changes Required:

#### 1. Next.js scaffold
**File**: `package.json` (new)
**Changes**: Initialize Next.js app with React 18, App Router.
- [x] Added root `package.json` with Next.js scripts and dependencies.

#### 2. Global styles
**File**: `app/globals.css` (new)
**Changes**: Define CSS variables for warm neutral palette, border radius, shadows, and base typography. Add subtle background gradient and fade-up animation.
- [x] Added warm palette tokens, layout styles, and fade-up animation in `app/globals.css`.

#### 3. Root layout
**File**: `app/layout.tsx` (new)
**Changes**: Basic HTML skeleton, font imports (non-default stack), and global layout container.
- [x] Added `app/layout.tsx` with display/body fonts and metadata.

### Success Criteria:

#### Automated Verification:
- [ ] App builds: `npm run build`
- [ ] Lint passes: `npm run lint`

#### Manual Verification:
- [ ] Home page renders with warm background, centered layout, and visible animation on load.
- [ ] Layout is readable on mobile width (~375px).

**Implementation Note**: Pause after Phase 1 for manual confirmation before continuing.

---

## Phase 2: Form Inputs and Live Preview State

### Overview
Implement the input form (Name, Title, Phone, Twitter/X), preview layout, and light/dark toggle for the preview.

### Changes Required:

#### 1. Main page UI
**File**: `app/page.tsx` (new)
**Changes**: Build the layout with form section, preview card, action buttons, and toggle. Use controlled inputs with clear buttons.
- [x] Implemented main page layout, form inputs, action buttons, and preview theme toggle.

#### 2. Components (optional, if needed)
**File**: `components/SignaturePreview.tsx` (new)
**Changes**: Render preview box with styles that switch for light/dark.
- [x] Added `components/SignaturePreview.tsx` and connected it to preview theme.

### Success Criteria:

#### Automated Verification:
- [ ] Typecheck passes: `npm run typecheck` (if configured) or `npm run build`

#### Manual Verification:
- [ ] Typing in any input immediately updates the preview.
- [ ] Clear (X) buttons reset each input.
- [ ] Preview toggle switches the card theme without altering the rest of the page.

**Implementation Note**: Pause after Phase 2 for manual confirmation before continuing.

---

## Phase 3: Signature HTML Generation and Copy

### Overview
Generate pure HTML with inline styles for the signature and implement copy-as-HTML.

### Changes Required:

#### 1. HTML generator utility
**File**: `lib/signatureHtml.ts` (new)
**Changes**: Build a function that takes form data and returns an HTML string with inline styles and data URL logo.
- [x] Added `lib/signatureHtml.ts` with HTML generator and helpers.

#### 2. Copy button logic
**File**: `app/page.tsx`
**Changes**: On click, copy HTML to clipboard using `navigator.clipboard.write` with `text/html`, fallback to `text/plain` if write fails.
- [x] Implemented HTML clipboard copy with rich HTML + text fallback.

#### 3. Data URL logo handling
**File**: `app/page.tsx`
**Changes**: Read uploaded image via FileReader and store data URL in state for preview + HTML output.
- [x] Implemented logo upload with FileReader and size/type validation.

### Success Criteria:

#### Automated Verification:
- [ ] Unit tests (if added) pass: `npm run test`
- [ ] Lint passes: `npm run lint`

#### Manual Verification:
- [ ] Copy button pastes a rich signature into Gmail compose with logo displayed.
- [ ] If no logo is uploaded, signature still renders without empty spacing.
- [ ] Phone and Twitter are separated by a bullet only when both exist.

**Implementation Note**: Pause after Phase 3 for manual confirmation before continuing.

---

## Phase 4: How-to-Import Modal and Responsive Polish

### Overview
Add modal with steps for Gmail, macOS Mail, and iOS Mail. Finalize responsive spacing and animations.

### Changes Required:

#### 1. Modal component
**File**: `components/ImportModal.tsx` (new)
**Changes**: Accessible modal with steps and close behavior.
- [x] Added `components/ImportModal.tsx` with Gmail/macOS/iOS steps and ESC close.

#### 2. Page integration
**File**: `app/page.tsx`
**Changes**: Hook modal open/close to "How to import?" button.
- [x] Wired modal open/close to the "How to import?" button.

#### 3. Responsive tuning
**File**: `app/globals.css`
**Changes**: Adjust grid stacking, input sizing, and preview card spacing for small screens.
- [x] Added responsive grid and spacing adjustments in `app/globals.css`.

### Success Criteria:

#### Automated Verification:
- [ ] App builds: `npm run build`
- [ ] Lint passes: `npm run lint`

#### Manual Verification:
- [ ] Modal opens/closes correctly and is keyboard accessible.
- [ ] Steps are clear and readable on mobile.
- [ ] Layout remains centered and comfortable on desktop and mobile.

**Implementation Note**: Pause after Phase 4 for manual confirmation before finishing.

---

## Testing Strategy

### Unit Tests:
- HTML generator output matches expected structure for key combinations:
  - No logo
  - Logo + name/title/company
  - Phone only, Twitter only, both with bullet

### Integration Tests:
- None required for MVP; manual testing is sufficient.

### Manual Testing Steps:
1. Enter all fields, upload logo, copy, paste into Gmail compose.
2. Toggle preview to dark and confirm it only affects preview card.
3. Use clear buttons on each field and ensure preview updates.
4. Test on mobile width for layout stacking.

## Performance Considerations

- Data URL images can be large; keep uploads reasonable with client-side validation (e.g., 1-2 MB).
- Avoid heavy animations; only subtle fade-up on page load.

## Migration Notes

Not applicable (greenfield build).

## References

- Screenshot inspiration: provided Image #1.
