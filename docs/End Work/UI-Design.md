# UI-Design.md — Premium Animated UI Prompts (DocuMentor AI)

**Owner:** Kaustubh. **Folder:** `frontend/` (plus two small shared-file edits in U0, via PR).

## What this file does

`Kaustubh.md` builds all the **functionality**, but its design brief is only "clean modern, indigo". That will not reproduce your reference image. This file replaces that brief with a precise design system taken from the reference (soft lilac gradient, cream surfaces, black pill buttons with an arrow circle, large rounded cards, orange accents, a dark feature section, stats row, bento cards, dark footer) and adds animation.

> The reference is used as a **style guide only**. Do not copy its brand name, text, photos or avatars. Everything here uses original text, icons and CSS/SVG art.

## Setup (do this once)

1. Save your reference image as `frontend/design/reference.webp` in the repo.
2. **Attach the same image to every prompt below** in Antigravity, in addition to the file path. The prompts reference it.

## How it fits with Kaustubh.md

| Kaustubh.md chunk | What to do |
|---|---|
| 1, 2 | Run as written |
| — | Run **U0**, then **U1** |
| 3 | **Skip**, replaced by U1 |
| 4, 5 | Run as written (logic), then run **U2** and **U3** |
| 6, 7 | Run as written (logic), then run **U4** |
| 8 | Run as written (logic), then run **U5** |
| — | Run **U6** (motion polish) |
| 9 | Run as written, then run `Integration.md` INT-2 |
| 10 | Run **steps 3-5 only** (Docker, README, build). Steps 1-2 (dark mode, accessibility) are done in **U7** |
| — | Run **U8** (final visual QA) |

## Design tokens (reference for every prompt)

| Token | Value |
|---|---|
| Ink (black) | `#0B0B0F`, soft ink `#17171C` |
| Cream surface | `#FBF8F2` |
| Lilac scale | 50 `#FAF5FF`, 100 `#F3E8FF`, 200 `#E9D5FF`, 300 `#D8B4FE`, 400 `#C084FC`, 500 `#A855F7`, 600 `#9333EA` |
| Orange accent | `#FF7A3D`, deep `#F2612A` |
| Status | success `#16A34A`, warning `#F59E0B`, danger `#EF4444` |
| Radius | pill `9999px`, card `28px`, big section `36px`, input `20px` |
| Shadows | soft card `0 8px 30px -12px rgba(15,15,30,.12)`, lilac glow `0 20px 60px -20px rgba(147,51,234,.35)` |
| Font | Plus Jakarta Sans, headings 700 with `-0.03em` tracking, hero 56-72px / line-height 1.05 |
| Motion | easing `[0.22, 1, 0.36, 1]`, durations 0.4-0.7 s, stagger 0.08 s, scroll-reveal once, hover lift `y: -4`, tap scale `0.97` |

---

## CHUNK U0 — Reference, design-system doc and context update

**Prompt**
```text
Read antigravitycontext.md fully first, then study the reference image attached (also at frontend/design/reference.webp).

Task: Prepare the repo for the new UI direction. This touches shared files, so keep the edits minimal.
1. Create docs/design-system.md describing: the visual style of the reference image (page = large rounded cream card inset on a lilac gradient background; floating pill navbar with a black circular logo; huge centered bold headline; pill input/CTA with a black button that ends in a white arrow circle; a dark rounded feature section with a floating light card; a three-column stats row with dividers; a bento row with an orange card, a lilac card and a white card; testimonial-style cards on a lilac gradient; orange circular "next" arrow buttons; dark rounded footer with a CTA pill and link columns), the design tokens table below, the component list (Button, IconButton, Card, Badge, Skeleton, Reveal, CountUp, ConfirmDialog, PageTransition) and the motion rules.
   Tokens: ink #0B0B0F / #17171C, cream #FBF8F2, lilac 50-600 (#FAF5FF #F3E8FF #E9D5FF #D8B4FE #C084FC #A855F7 #9333EA), orange #FF7A3D / #F2612A, status green #16A34A, amber #F59E0B, red #EF4444, radii pill / 28px / 36px / 20px, soft shadows, font Plus Jakarta Sans, easing [0.22,1,0.36,1], durations 0.4-0.7s, stagger 0.08s, hover lift -4px, tap scale 0.97, respect prefers-reduced-motion.
2. Update antigravitycontext.md: in section 3 Frontend add "framer-motion" and "@fontsource-variable/plus-jakarta-sans"; in section 4 add frontend/design/reference.webp and the extra common components; in section 7 Frontend rules add "Follow docs/design-system.md for every visual decision" and "Use framer-motion for animation and always respect prefers-reduced-motion".
3. Do not change any code in frontend/src yet.
```

**Commit**
```bash
git checkout -b docs/design-system
git add docs/design-system.md antigravitycontext.md frontend/design/reference.webp
git commit -m "docs: add design system and reference image for the new UI direction"
git push origin docs/design-system
```
> Open a PR and ask Yash to approve (shared files).

---

## CHUNK U1 — Design foundation, layout shell and core components (replaces Kaustubh Chunk 3)

**Prompt**
```text
Read antigravitycontext.md and docs/design-system.md first. Study the reference image attached (frontend/design/reference.webp). Work only inside frontend/.

Goal: recreate the visual language of the reference for DocuMentor AI. Do not copy its brand name, text, photos or avatars.

1. Install framer-motion and @fontsource-variable/plus-jakarta-sans. Import the font in main.jsx and set it as the default font. Wrap the app in <MotionConfig reducedMotion="user">.
2. src/styles/index.css: Tailwind import, all tokens from docs/design-system.md as theme variables (use @theme if Tailwind v4, or tailwind.config.js if v3), class-based dark mode (for Tailwind v4 add: @custom-variant dark (&:where(.dark, .dark *));), cream body background, and reusable utilities: .bg-hero-gradient (radial lilac-200 at the top centre fading into cream by ~520px), .glass (white/70 + backdrop-blur + subtle white border), .shimmer (skeleton shimmer), and keyframes float, blob and marquee.
3. src/components/common (one file each, small):
   - Button.jsx: variants "primary" (black pill, white text, ends with a 36px white circle containing a black ArrowRight; on hover the circle nudges right and the pill lifts), "secondary" (white pill, subtle border), "accent" (orange pill), "ghost", "danger"; sizes sm/md/lg; loading spinner; optional leading icon; hideArrow prop; framer-motion whileHover and whileTap. Must render as <button> or react-router <Link> through an "as" or "to" prop.
   - IconButton.jsx: round button (orange / white / dark variants) with required aria-label.
   - Card.jsx: variants "white", "lilac" (soft lilac gradient), "dark" (ink), "orange"; 28px radius; optional hoverable lift.
   - Badge.jsx (status pill: ready green, processing amber with pulse, failed red), Skeleton.jsx (shimmer), Loader.jsx (spinner), EmptyState.jsx (floating animated icon, title, text, optional action), SectionHeading.jsx (small lilac eyebrow label + big heading + optional subtitle).
   - Reveal.jsx (fade-up wrapper using whileInView, once, with optional delay), CountUp.jsx (animates a number from 0 when it scrolls into view), PageTransition.jsx (fade + 12px rise).
4. src/components/layout:
   - Layout.jsx / AppShell: the page background is a lilac gradient; the content sits inside a large rounded-[40px] cream container inset from the edges (smaller inset on mobile). Include two blurred, slowly floating lilac and orange blobs behind the content (aria-hidden, pointer-events-none).
   - Navbar.jsx: a floating glass pill: black circular logo with a lucide icon (BookOpenText) + "DocuMentor AI" on the left; centered links Home / Chat / Study with a sliding black pill indicator behind the active link (framer-motion layoutId); on the right a round dark-mode button placeholder (wired in U7) and a black pill "Upload" button linking to /#upload. Becomes sticky with a stronger shadow after scrolling. On mobile: hamburger that opens an animated slide-down menu.
   - Footer.jsx: placeholder component for now (filled in U3).
5. Wrap all routes in Layout in App.jsx with AnimatePresence page transitions keyed by location.
Use lucide-react icons only. Keep every component small and reusable.
```

**Check:** All three routes show the lilac shell, the floating navbar with the sliding indicator, and page transitions. Resize to 390 px: the hamburger menu works.

**Commit**
```bash
git checkout -b feat/frontend-ui-design
git add frontend/
git commit -m "feat(frontend): add design system, animated layout shell and core UI components"
```

---

## CHUNK U2 — Hero, pill upload and animated document library (run after Kaustubh Chunks 4 and 5)

**Prompt**
```text
Read antigravitycontext.md and docs/design-system.md first. Study the reference image (hero area and the cards). Work only inside frontend/. Keep all existing logic from Chunks 4 and 5 (validation, progress, toasts, useDocuments, delete) and only change the presentation.

1. HomePage hero (id="hero"), restyled like the top of the reference:
   - .bg-hero-gradient section, a small glass eyebrow chip ("RAG-powered study assistant" with a sparkle icon), then a huge centered headline "Study smarter from your own notes." (the words "your own notes" with a lilac-to-purple gradient text), a subtitle "Upload your PDFs, notes or textbooks. Ask questions and get answers with the exact page they came from.", staggered fade-up entrance.
   - Below it the UploadBox restyled as the wide pill from the reference's email field (id="upload"): white pill with soft shadow, a file icon and the text "Drop a file here or browse", ending with a black "Upload" pill button with the arrow circle. While dragging over it, the pill scales up slightly, gets a lilac glow and the text changes to "Release to upload". During upload the pill turns into a progress bar with the percentage, then "Processing document..." with an animated shimmer. Success: a short check-mark animation, then it resets. Under it, small muted chips: PDF, DOCX, TXT, MD, "up to 20 MB".
2. DocumentCard restyled: lilac gradient Card; a white rounded-2xl square holding the file-type icon; filename truncated with a tooltip; meta row (pages, chunks, date); status Badge; a footer with a black "Chat" pill, a white "Study" pill and a round danger icon button for delete. Hover lift plus a lilac glow. Replace the browser confirm with a ConfirmDialog component (common/ConfirmDialog.jsx): centered card, backdrop blur, framer-motion scale-in, focus trapped, Escape closes, clear "Delete" and "Cancel" buttons.
3. DocumentList: SectionHeading "Your library" with the document count, a responsive grid (1/2/3 columns) with staggered card entrance and layout animation when a card is removed (AnimatePresence + layout), Skeleton cards while loading, EmptyState ("Upload your first document to get started") with a floating illustration made from lucide icons.
```

**Check:** The hero looks like the top of the reference. Dragging a file over the pill animates it. Cards animate in and out.

**Commit**
```bash
git add frontend/
git commit -m "feat(frontend): add animated hero, pill upload and lilac document library"
```

---

## CHUNK U3 — Landing sections: dark feature, stats, bento cards, how-it-works, footer

**Prompt**
```text
Read antigravitycontext.md and docs/design-system.md first. Study the reference image carefully: the black rounded feature section with a floating light card, the three-column stats row, the bento row (orange / lilac / white cards), the carousel with orange circular arrows, and the dark footer. Work only inside frontend/. Use only original text and CSS/SVG/lucide art, no photos.

Add these sections to HomePage.jsx between the hero and the library (or after it where noted), each wrapped in Reveal:
1. Dark feature section (Card "dark", rounded-[36px], subtle diagonal lighter stripes in the corner like the reference). Left: a floating light "ChatPreviewCard" component (components/chat/ChatPreviewCard.jsx, aria-hidden, labelled "Example") showing a sample question "What is a deadlock?", an assistant answer that types itself out in a loop, and a small floating chip below it "os-notes.pdf · Page 4 · 82% match" that gently floats. Right: heading "Ask anything. Get answers with sources.", a short paragraph about grounded answers, and a white pill button "Start chatting" (arrow circle) linking to /chat.
2. Stats row: three columns separated by thin vertical dividers, using CountUp: the real number of documents from useDocuments, the real total chunk_count of all documents ("knowledge chunks indexed"), and "4" file formats supported. Each with a small file-icon avatar stack, big number and a one-line description. Do not invent fake user numbers.
3. Bento row of three cards: (a) orange Card "Study tools" listing three rows (Summary, Flashcards, Quiz) each with a lucide icon and a chevron linking to /study, rows slide on hover; (b) lilac Card "Chat with your notes" with an SVG/CSS illustration of two floating chat bubbles and a white "Try now" pill linking to /chat; (c) white Card "Your library" with the document count, a stack of file-type icons and a muted caption. Staggered entrance and hover lift.
4. "How it works" carousel: heading plus two round arrow IconButtons (one orange, one white, labelled "Click to next" like the reference). Three step cards on lilac gradient (1 Upload and index, 2 Ask and get sources, 3 Practise with flashcards and quizzes), each with a number, icon and two lines of text; horizontal scroll-snap row that the arrows scroll smoothly; on desktop all three are visible.
5. Footer.jsx: dark rounded-[36px] section with the heading "Ready to boost your grades?", a pill-shaped CTA (white pill with a black button "Upload now" that scrolls to #upload), and three link columns (Home: Library, Chat, Study; Project: GitHub (placeholder link), API docs (http://localhost:8000/docs, opens in a new tab), README; Team: Yash (Backend), Kaustubh (Frontend)). Use it in Layout so it shows on every page, with a smaller version on Chat and Study if the full footer feels heavy there.
Order on HomePage: hero -> library -> dark feature -> stats -> bento -> how it works -> footer (so the app's main action stays on top).
```

**Check:** Scroll the home page: sections reveal one after another; the typing loop runs; the arrows scroll the cards.

**Commit**
```bash
git add frontend/
git commit -m "feat(frontend): add landing sections with dark feature, live stats, bento cards and footer"
```
> Open a PR for U0-U3 and Kaustubh Chunks 1-5, and ask Yash to review.

---

## CHUNK U4 — Chat UI redesign (run after Kaustubh Chunks 6 and 7)

**Prompt**
```text
Read antigravitycontext.md and docs/design-system.md first and keep the reference image's style in mind. Work only inside frontend/. Keep all logic from Chunks 6 and 7 (useChat, document selection, markdown, sources) and change the presentation.

1. ChatPage layout: a full-height two-column layout. Left panel: lilac Card "Your documents" with custom animated checkboxes (check icon scales in), an "All documents" option, status badges, a "New chat" pill button; collapses into an animated drawer on mobile with a floating round orange button to open it. Right: a large white rounded-[32px] card with a soft shadow that contains the ChatWindow.
2. MessageBubble: user messages right-aligned in an ink (black) rounded-3xl bubble with white text; assistant messages left with a small round black avatar (BookOpenText icon) and a white card with a thin border and soft shadow; both enter with a spring (slide up 12px + fade). Copy button appears on hover with a check-mark confirmation animation.
3. SourceCard and the collapsible "Sources (N)" row: a lilac pill header with a file icon and a rotating chevron; cards inside animate open with height auto; the score badge is orange text on a light orange background; page number in a small black pill; snippet clamped to 3 lines with "Show more".
4. Typing indicator: three bouncing dots in an assistant-style bubble with the text "DocuMentor is thinking...".
5. Empty state: centered floating icon, the title "Ask your documents anything", and four starter-question chips (light lilac pills with a hover lift) that send the question when clicked; when no document is ready show an EmptyState with a link back to Home.
6. ChatInput: a large pill input bar docked at the bottom of the card, auto-growing up to 5 lines, with a black round send button (ArrowUp icon) that scales on hover and turns into a spinner while sending; character counter appears near the 2000 limit.
7. Smooth auto-scroll to the newest message and a floating "scroll to latest" round button when the user has scrolled up.
```

**Check:** Chat looks consistent with the home page; bubbles animate in; sources expand smoothly.

**Commit**
```bash
git add frontend/
git commit -m "feat(frontend): redesign chat with animated bubbles, source chips and pill input"
```

---

## CHUNK U5 — Study UI redesign (run after Kaustubh Chunk 8)

**Prompt**
```text
Read antigravitycontext.md and docs/design-system.md first and keep the reference image's style in mind. Work only inside frontend/. Keep all logic from Chunk 8 and change the presentation.

1. StudyPage: SectionHeading "Study tools"; a pill-shaped document select (white pill, chevron) and a segmented tab control (Summary / Flashcards / Quiz) in a glass pill with a sliding black indicator (framer-motion layoutId); tab content cross-fades. Count selectors (5/10/15 and 5/10) as small pill toggles. The "Generate" button is the black pill with the arrow circle; "Regenerate" is a secondary pill.
2. Generation loading state: a lilac Card with an animated gradient shimmer, a rotating sparkle icon and rotating friendly messages every 3 s ("Reading your document...", "Finding the key ideas...", "Almost there..."). Error state: a card with a retry button.
3. SummaryPanel: a large white card with a lilac header strip, react-markdown styled with comfortable typography (headings in bold ink with a small lilac bar, bullet points with lilac dots, definitions in subtle callout boxes), a Copy button with a check animation, and the content revealing with a stagger.
4. FlashcardDeck: a real 3D flip (perspective, rotateY 180 with backface hidden, spring transition) on click or Space/Enter; front is a lilac gradient card with the question and a "Tap to flip" hint, back is an ink (dark) card with the answer; Previous/Next round buttons (next is orange), a thin animated progress bar with "3 / 10", a shuffle button that animates the deck, and swipe/arrow-key navigation (Left/Right).
5. QuizPanel: one question per screen with a progress bar and the question number; options as large rounded cards with a letter badge (A-D); on selection the correct option turns green with a check, a wrong pick turns red with a short shake, the others fade; the explanation slides down in a lilac callout; a "Next" pill appears. Result screen: an animated SVG circular score ring that fills up, a count-up percentage, a message based on the score, "Try again" and "Review answers" buttons, and a lightweight CSS confetti burst (no extra dependency) when the score is at least 80%.
6. EmptyState when no document is ready, linking to Home.
```

**Check:** The flip, shake, score ring and tab indicator all animate smoothly at 60 fps.

**Commit**
```bash
git add frontend/
git commit -m "feat(frontend): redesign study tools with 3D flashcards, animated quiz and score ring"
```

---

## CHUNK U6 — Motion and micro-interaction polish

**Prompt**
```text
Read antigravitycontext.md and docs/design-system.md first. Work only inside frontend/.

Task: Add the final layer of motion without hurting performance.
1. Audit every page and make sure the motion rules in docs/design-system.md are applied consistently: same easing, durations 0.4-0.7 s, stagger 0.08 s, hover lift on interactive cards, tap scale on buttons, and every list or grid enters with a stagger.
2. Add subtle extras: hero blobs drift slowly (CSS, transform only); the navbar logo rotates slightly on hover; the primary button's arrow circle slides on hover; toasts (react-hot-toast) are restyled to match (pill shape, ink background, white text, lilac accent icon); a thin lilac-to-orange scroll progress bar at the very top of the page; a custom focus ring (2px lilac-500 with offset) that matches the style.
3. Performance rules: animate only transform and opacity, use will-change sparingly, avoid animating layout in long lists except when removing a card, lazy-load the Chat and Study pages with React.lazy and Suspense (using the Loader as the fallback), and keep the main bundle small.
4. Respect prefers-reduced-motion: with it enabled, disable the blobs, typing loop, confetti and parallax and keep only simple fades. Test it with the OS setting.
5. Remove console warnings and unused code. Run npm run build and report the bundle size.
```

**Check:** No jank when scrolling; with reduced motion enabled the UI is calm; the build passes.

**Commit**
```bash
git add frontend/
git commit -m "feat(frontend): add motion polish, lazy-loaded pages and reduced-motion support"
```

---

## CHUNK U7 — Dark mode, accessibility and responsive pass (replaces Kaustubh Chunk 10 steps 1-2)

**Prompt**
```text
Read antigravitycontext.md and docs/design-system.md first. Work only inside frontend/.

1. Dark mode: wire the navbar round button (Sun/Moon icon with a rotate-morph animation). Save the choice in localStorage ("documentor.theme"), default to the OS preference, and set the class on <html> before React renders (inline script in index.html) to avoid a flash. Dark palette: page background #0B0B0F, shell card #111116, surfaces #15151B, borders white/10, lilac tones become deeper (lilac-900/40 gradients) with lilac-300 text accents, the "dark" Card variant becomes lighter than the page (#1B1B22) so it stays visible, and the hero gradient becomes a deep violet glow. Check every component: Navbar, Buttons, Cards, Upload pill, DocumentCard, Chat, Study, Footer, Toasts, ConfirmDialog.
2. Accessibility: aria-labels on all icon buttons; visible focus states everywhere; correct heading order (one h1 per page); alt/aria-hidden on decorative art; tabs use role="tablist"/"tab"/"tabpanel" with arrow-key navigation; the flashcard is a button with aria-live feedback; quiz options are a radio group; the ConfirmDialog traps focus and restores it on close; a "Skip to content" link; colour contrast of at least 4.5:1 for body text in both themes (adjust the muted colours if needed).
3. Responsive pass at 390, 768 and 1440 px: no horizontal scroll, touch targets at least 44 px, readable font sizes (hero scales from 40 px on mobile to 72 px on desktop), grids collapse correctly, chat input stays above the mobile keyboard (use dvh units).
4. Run Lighthouse (or axe) and fix everything it reports as an accessibility error. Report the scores.
```

**Check:** Dark mode persists after a refresh with no flash; keyboard-only navigation works across all pages; Lighthouse accessibility is at least 90.

**Commit**
```bash
git add frontend/
git commit -m "feat(frontend): add persistent dark mode, accessibility improvements and responsive polish"
```

---

## CHUNK U8 — Final visual QA against the reference

**Prompt**
```text
Read antigravitycontext.md and docs/design-system.md first. Compare the running app (npm run dev) with the reference image attached and fix every difference inside frontend/.

Checklist (report PASS/FIX for each, then fix the FIX items):
1. Page is a large rounded cream card inset on a lilac gradient background.
2. Floating pill navbar with a black circular logo, centered links with an active black pill, and a black pill CTA.
3. Hero: huge centered bold headline, one-line subtitle, wide white pill input-style upload with a black arrow button.
4. Dark rounded feature section with a floating light card and a white pill CTA.
5. Three-column stats row with dividers.
6. Bento row with orange, lilac and white cards.
7. Orange circular "next" arrow buttons on the carousel.
8. Dark rounded footer with a pill CTA and link columns.
9. Consistent radii (28/36 px), soft shadows, Plus Jakarta Sans typography.
10. Every page at 390, 768 and 1440 px in light and dark mode, with no overflow and no console errors.
11. Every async action has loading, error and empty states.
12. Take screenshots (home, library with documents, chat with sources, flashcards, quiz result, dark mode, mobile) and save them to docs/screenshots/ for the README.
Also record a 30-second screen capture of the full flow (upload -> chat -> sources -> flashcards -> quiz) for the demo.
```

**Check:** Side by side with the reference, the structure and style match; the screenshots exist.

**Commit**
```bash
git add frontend/ docs/screenshots/
git commit -m "style(frontend): final visual QA pass against the design reference"
git push origin feat/frontend-ui-design
```
> Open the PR, ask Yash to review, then continue with Kaustubh Chunk 9 and `Integration.md`.

---

## FINAL UI CHECKLIST
- [ ] The look matches the reference (structure, colours, pills, rounded cards, dark sections)
- [ ] Animations are smooth and respect reduced motion
- [ ] Dark mode persists and every component works in both themes
- [ ] Lighthouse accessibility is at least 90
- [ ] 390 / 768 / 1440 px all look good
- [ ] Screenshots saved in `docs/screenshots/`
