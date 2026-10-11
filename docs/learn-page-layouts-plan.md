# Configurable Learn-Page Layout — Implementation Plan

> **Goal:** Give site owners control over how the learn page (the student's
> lesson/topic/quiz consumption screen) is laid out, so courses present the best
> possible learning experience.
>
> **Approach:** Instead of a fixed list of named layouts, expose **3 composable
> options**. Their combinations reproduce every layout we prototyped — and more —
> with far less code.
>
> **Status:** Plan / not yet implemented. Visual prototypes live outside the
> plugin at `/Users/tusharimran/Herd/dev/lms-learn-layouts/`.

---

## 1. Decisions baked into this plan

| Decision | Choice | Consequence |
|----------|--------|-------------|
| **Who configures** | **Admin only, site-wide** | One global config in `academy_settings`. No per-course meta, no per-student preference. Lives in the existing (admin-only) Learn Page settings tab. |
| **Model** | **3 composable option axes** (not N named layouts) | Build primitives once; CSS composes them. |
| **Rendering** | One shared CSS engine for both render paths | No new render path. Do not fork rendering. |
| **Presentation** | Option controls + live preview in the settings tab | Admin sees segmented controls and a thumbnail that updates live. |

---

## 2. The 3 option axes (the model)

| Axis | Setting values | Default |
|------|----------------|---------|
| **① Curriculum placement** | `left` · `right` · `top` (stepper) · `hidden` (drawer) | `left` |
| **② Content width** | `standard` · `wide` (theater) · `focused` (narrow) | `standard` |
| **③ Side panel** (docked notes / Q&A / up-next) | `off` · `on` | `off` |

### These 3 axes reproduce all 7 prototyped layouts

| Prototype layout | ① Curriculum | ② Width | ③ Panel |
|------------------|-------------|---------|---------|
| Sidebar (classic) | `left` | `standard` | `off` |
| Right rail | `right` | `standard` | `off` |
| 3-column | `left` | `standard` | `on` |
| Study split | `hidden` | `standard` | `on` |
| Stepper | `top` | `standard` | `off` |
| Focus | `hidden` | `focused` | `off` |
| Theater | `hidden` | `wide` | `off` |

…and unlocks new blends for free (e.g. `left + wide + on` = a rich 3-column
theater) with no extra code.

---

## 3. The architectural finding that drives the design

Academy renders the learn page through **two paths**, selected by the global
boolean `is_enabled_lessons_php_render`
(`templates/single-course-curriculums.php:40-44`):

- **React path** — `templates/curriculums/js-render.php` prints
  `#academyLessonsWrap` (with ~30 `data-*` attributes) → React container
  `dev_academy/containers/frontend-curriculums/index.js` (`Curriculums`).
- **PHP / Gutenberg path** — `templates/curriculums/php-render.php` renders the
  Gutenberg page in the `lessons_page` setting, whose blocks call
  `[academy_course_learnpage]`
  (`includes/shortcode/academy-course-learnpage.php` →
  `templates/curriculums/course-learnpage.php`), composed from
  `templates/curriculums/*.php`.

**Both paths emit the same `.academy-*` BEM markup and consume the same
`--academy-*` CSS variables** — proven by the WP Customizer, whose learn-page
color CSS is scoped to `.academy-lessons ...` and works on both
(`includes/customizer/style/learn-page.php`).

### ➡️ Design consequence

Build the options as **one shared CSS layout engine** keyed by data attributes on
the learn wrapper — reused by both render paths. This mirrors the prototype and
means we write the layout system **once**.

> **Note:** `academy-intake` styling is **SCSS + BEM** with `--academy-*` CSS
> custom properties (`assets/scss/common/_global.scss:2-14`) — **not Tailwind**.
> The prototype is CSS-var + grid driven, so it ports directly.

---

## 4. Data model — admin global settings

The three axes are stored as three keys in the existing global settings option
`academy_settings` (read via `Academy\Helper::get_settings()`):

| Setting key | Type | Values | Default |
|-------------|------|--------|---------|
| `learn_page_nav_placement` | string | `left` \| `right` \| `top` \| `hidden` | `left` |
| `learn_page_content_width` | string | `standard` \| `wide` \| `focused` | `standard` |
| `learn_page_show_side_panel` | boolean | — | `false` |

Adding each global setting is the standard **4-touch** change in this codebase:

1. **Default** → `includes/admin/settings/base.php` (`get_default_data()`, Learn
   Page block ~lines 34-47).
2. **Sanitize whitelist** → `includes/ajax/settings.php`
   (`Settings::update_base_settings()`, ~lines 24-130) — e.g.
   `'learn_page_nav_placement' => 'string'`,
   `'learn_page_content_width' => 'string'`,
   `'learn_page_show_side_panel' => 'boolean'`. **A key not listed here will not
   persist.**
3. **Fields** → `dev_academy/containers/backend-dashboard/pages/settings/LearnPage/index.js`.
4. **Payload** → `dev_academy/.../settings/index.js` (destructure into the
   `updateSettings` payload, ~lines 407-441 / 640-660).

Save is admin-only (ajax `academy/update_base_settings`, capability
`manage_options`). Read is exposed via `GET academy/v1/settings`.

Backward compatibility: defaults (`left` / `standard` / `off`) reproduce today's
sidebar layout exactly, so existing sites are visually unchanged after upgrade.

---

## 5. The shared layout engine (CSS)

New partial `assets/scss/frontend/_learn-layouts.scss`, imported into **both**
frontend style bundles (producing `frontendCurriculums.css` and
`frontendPhpCurriculums.css`). It keys off three attributes on the learn wrapper:

```
data-academy-nav="left|right|top|hidden"
data-academy-width="standard|wide|focused"
data-academy-panel="on|off"
```

…and switches `grid-template-areas` / column tracks accordingly (same technique
as the prototype).

### Implementation cost per axis value

| Axis value | Cost | Mechanism |
|------------|------|-----------|
| nav `left` (default) | CSS only | baseline grid `nav main` |
| nav `right` | CSS only | swap columns `main nav` |
| nav `hidden` | CSS only | nav → slide-in drawer (drawer markup shared) |
| nav `top` | **+markup** | horizontal stepper strip replaces the sidebar |
| width `standard` / `wide` / `focused` | CSS only | max-width / full-bleed video |
| panel `off` (default) | CSS only | no aside column |
| panel `on` | **+markup** | docked aside (notes / Q&A / up-next) |

**Only two things need new markup:** the **stepper strip** (nav `top`) and the
**side panel** (panel `on`). Everything else is pure CSS on today's markup and
works in both paths immediately.

Responsive & a11y rules (from the prototype):
- Under ~820px every configuration collapses to single-column + curriculum drawer.
- Layout is a **visual arrangement only** — DOM/reading order, keyboard focus,
  and the mark-complete flow stay identical across all option combinations.

---

## 6. Wiring into both render paths

**Resolve once, emit as attributes** (in `single-course-curriculums.php` before
the render fork, or where each wrapper is printed):

```php
$nav   = Academy\Helper::get_settings( 'learn_page_nav_placement', 'left' );
$width = Academy\Helper::get_settings( 'learn_page_content_width', 'standard' );
$panel = Academy\Helper::get_settings( 'learn_page_show_side_panel', false ) ? 'on' : 'off';
// whitelist-validate each, then:
//  data-academy-nav="$nav" data-academy-width="$width" data-academy-panel="$panel"
```

**React path**
- `js-render.php`: add the three `data-academy-*` attributes to
  `#academyLessonsWrap`.
- `frontend-curriculums/index.js`: read them, set on the root wrapper, and
  **conditionally render**:
  - `frontend-curriculums/Aside/` when panel `on` (reuses Q&A / announcements /
    notes data already in the container),
  - `frontend-curriculums/StepperStrip/` when nav `top` (from the same topics
    data as `TopicsSidebar`).
- `Topbar/`, `TopicsSidebar/`, `NextPrev/`, `LessonContent/` reused unchanged.

**PHP / Gutenberg path**
- `templates/curriculums/course-learnpage.php`: print the three `data-academy-*`
  attributes on the `.academy-lessons` wrapper and **conditionally include**
  `templates/curriculums/aside.php` (panel `on`) and
  `templates/curriculums/stepper.php` (nav `top`).
- Full-width configs (`wide` / `focused` / nav `hidden`) coordinate with the
  existing `is_enabled_lessons_theme_header_footer` flag so theme chrome doesn't
  cap width.

**Customizer stays as-is** — it owns learn-page **colors** (cosmetic). Layout is a
**structural** plugin setting. No Customizer control, no conflict.

---

## 7. Admin settings UI

In the Learn Page settings sub-tab
(`dev_academy/.../settings/LearnPage/index.js`), add a **"Layout"** group:

- **Curriculum placement** — segmented control / `AcademySelect`
  (Left · Right · Top · Hidden).
- **Content width** — segmented control (Standard · Wide · Focused).
- **Side panel** — `@Components/Formik/Checkbox/SwitchControl` (off/on).
- **Live preview** — a single inline-SVG thumbnail beside the controls that
  updates as the options change (no image assets to pipeline; theme-aware).
- Reuse `@Components/Formik/*`, `@Components/AcademySelect`, `@Components/Button`,
  and `--academy-*` tokens.

---

## 8. File-by-file change map

**New files**
- `assets/scss/frontend/_learn-layouts.scss` — the layout engine.
- `dev_academy/containers/frontend-curriculums/Aside/` — React aside (panel `on`).
- `dev_academy/containers/frontend-curriculums/StepperStrip/` — React stepper (nav `top`).
- `templates/curriculums/aside.php` — PHP aside partial.
- `templates/curriculums/stepper.php` — PHP stepper partial.

**Edited files**
- `includes/admin/settings/base.php` — defaults for the 3 keys.
- `includes/ajax/settings.php` — sanitize whitelist for the 3 keys.
- `dev_academy/.../settings/LearnPage/index.js` — the Layout controls + preview.
- `dev_academy/.../settings/index.js` — include the 3 keys in the save payload.
- `templates/single-course-curriculums.php` — resolve options (Section 6).
- `templates/curriculums/js-render.php` — emit `data-academy-*` on the wrapper.
- `dev_academy/containers/frontend-curriculums/index.js` — read attrs, set
  wrapper, conditional `Aside`/`StepperStrip`.
- `templates/curriculums/course-learnpage.php` — emit attrs + conditional partials.
- SCSS entry(ies) for `frontendCurriculums` + `frontendPhpCurriculums` —
  `@import 'frontend/learn-layouts';`

**Build:** `wp-scripts build` (webpack) → `assets/build/[name].<version>.js/.css`.
Free-plugin feature; Pro integrates via JS filters and is unaffected.

---

## 9. Phasing

- **Phase A — Foundation + instant win**
  Layout engine SCSS · 3 settings + resolver · settings UI with live preview ·
  ship every **CSS-only combination**: nav `left`/`right`/`hidden` × width
  `standard`/`wide`/`focused`. (Covers Classic, Right-rail, Focus, Theater, and
  drawer — both paths.)
- **Phase B — Side panel**
  `Aside` component + `aside.php` → enables panel `on` (3-column, study-split
  blends).
- **Phase C — Top stepper**
  `StepperStrip` component + `stepper.php` → enables nav `top`.
- **Phase D — Polish**
  Preview thumbnail refinements, docs & screenshots, QA across themes.

---

## 10. Risks / watch-items

- **Gutenberg page width** — `wide`/`focused`/nav `hidden` need full width; verify
  against `is_enabled_lessons_theme_header_footer` and the `lessons_page` block
  wrapper.
- **Mobile** — all combinations must degrade to single-column + drawer.
- **Accessibility** — keep DOM/reading order and focus management constant; never
  change tab order or hide the mark-complete control.
- **No third render path** — the shared-CSS approach keeps this maintainable;
  resist per-combination PHP/React forks.
- **Settings persistence gotcha** — every new key MUST be added to the sanitize
  whitelist in `includes/ajax/settings.php` or it silently won't save.
- **Backward compatibility** — defaults reproduce today's sidebar layout.

---

# Part 2 — Global Course-Activity Drawers (Announcements + Q&A)

> **Status: IMPLEMENTED (React path) — Phases 1+2+3.** Backend topic-scoping,
> `LearnDrawer` shell, top-bar bell + Q&A buttons, context-aware Q&A scope
> toggle, sidebar tabs removed, SCSS + build all landed on `feat/learn-page-layouts`.
> Shipped files: `includes/api/question-answer.php` (topic meta + `topic` filter),
> `redux/Slices/questionAndAnswerSlice` (`getCourseQA({ID,topic})`),
> `frontend-curriculums/LearnDrawer/`, `Topbar/index.js`,
> `TopicsTabsNavigation/{index,frontendqa,Announcements}`,
> `assets/scss/frontend/_learn-drawers.scss`. PHP-render path still uses its own
> `templates/curriculums/*` tabs (not yet migrated).
>
> Added after prototyping. The learn-page mockups introduced a pattern the team
> wants shipped: **Announcements and Q&A as global, always-available entry
> points** — top-bar icons that open right-side slide-in drawers — working on
> every content type (lesson / quiz / assignment / meeting) and every layout
> combination, instead of being buried as sidebar tabs.
>
> **Key finding:** both features are already fully built and surfaced as **tabs**
> inside `TopicsTabsNavigation`. A first version is mostly *relocation + a new
> drawer shell* — **no backend change**. Only the "scope to current item" detail
> (§14) needs a small server addition.

## 11. What already exists (reuse, don't rebuild)

| Piece | Location | Notes |
|---|---|---|
| Q&A component | `frontend-curriculums/TopicsTabsNavigation/frontendqa/` (`FrontendQA`) | Self-fetches from redux; ask + answer Formik forms |
| Q&A data | slice `questionAndAnswer`; `getCourseQA(courseID)` → `GET academy/v1/question_answer?post={courseID}`; ajax `academy/insert_qa\|update_qa\|delete_qa` | Q&A = WP comments (`comment_type=academy_qa`, `comment_post_ID=courseID`). Question `parent=0`, answer `parent>0`; `status=waiting_for_answer\|answered`. **No votes; course-scoped only.** |
| Announcements component | `.../TopicsTabsNavigation/Announcements/` (`Announcements`) | Self-fetches; renders `post_title`+`post_content` |
| Announcements data | `fetchCourseAnnouncements(courseID)` (curriculumSlice) → `GET academy/v1/academy_courses/{id}/announcements` → `state.frontendCurriculums.announcements` | CPT `academy_announcement`, linked via meta `academy_announcements_course_ids`. Returns raw posts (has `post_date`, author). **No pinned/unread modeled.** |
| Enable flags | `isEnabledCourseQA`, `isEnabledCourseAnnouncements` (course meta `academy_is_enabled_course_qa` / `_announcements`) | Reuse as drawer-visibility gates. Announcements also allow guests on public courses. |
| Topbar insert point | `Topbar/index.js:78-89` (`__right`) | Add two icon buttons before `<MenuOptions/>`; or via `applyFilters('academy.course-active-timer.widget')` seam |
| Drawer shell pattern | `ShareCourse`→`ShareModal` (`ReactModal`); outside-click ref in `MenuOptions/index.js:19-28` | Reuse for slide-in + close-on-scrim |
| Layout stub | `data-academy-panel` (from `learn_page_show_side_panel`) is **emitted but unconsumed** | See §13 |

## 12. The design

**Two top-bar entry points** in `__right`, each gated on its enable flag:
- 🔔 **Announcements** — bell + unread dot → announcements drawer.
- 💬 **Q&A** — bubble + question count → Q&A drawer.

Each opens a **right-side slide-in drawer** (shared `LearnDrawer` shell: fixed
panel `translateX(100%)`→`0`, scrim, close on outside-click / Esc). The drawer
**body reuses the existing `FrontendQA` / `Announcements` components unchanged** —
they already self-fetch. Available identically on every content type and layout
because the Topbar is layout-independent. This **replaces the two sidebar tabs**.

## 13. Reconciliation: docked side panel (panel=on) vs global drawers

Different concerns — keep them separate:
- **Global drawers (this part)** = course-level, cross-item, on-demand overlays →
  **Announcements + Q&A**. Always available via the top bar, **not** gated on the
  panel axis.
- **Docked side panel (panel=on, Phase B)** = item-contextual always-visible
  column → **notes / up-next / lesson comments** for the current lesson.

So `data-academy-panel` stays owned by the docked side panel; the drawers are
gated only by the course Q&A / announcement enable flags.

## 14. Context-aware Q&A scope ("On this lesson" vs "All course") — signature detail

The mockup's standout was Q&A auto-scoped to the current item. **This is the one
part needing a backend change** (Q&A carries only a course id today):
1. **Store topic on ask** — in `insert_qa` (`includes/api/question-answer.php:~213`)
   and `insert_question` (`includes/post/course.php:~79`), save `academy_qa_topic_id`
   + `academy_qa_topic_type` comment meta from a new request param.
2. **Filter on read** — extend `get_items` to accept `topic` and add a `meta_query`.
3. **Pass context from React** — `FrontendQA` reads the current play topic
   (id/type) from `state.frontendCurriculums`, tags new questions, and offers the
   scope toggle ("On this {kind}" / "All course").

Backward compatible: legacy questions have no topic meta → shown under "All course".

**Deferred (new backend):** Q&A **votes** (no field), announcement **pinning** and
server **read/unread** — the bell's unread dot can run purely client-side
(`localStorage` last-seen vs newest `post_date`).

## 15. Phasing (drawers)

- **Drawer Phase 1 — Global shell + relocation (no backend):** `LearnDrawer`
  shell; two top-bar buttons gated on enable flags; host existing
  `FrontendQA`/`Announcements`; remove the two sidebar tabs; `localStorage` unread
  dot; mobile full-width; SCSS with `--academy-*` tokens. Ships the pattern.
- **Drawer Phase 2 — Context-aware Q&A:** topic meta on insert + `topic` read
  filter + scope toggle & auto-tagged composer (§14).
- **Drawer Phase 3 — Polish:** answered/awaiting badges from `status`, author +
  relative date, empty states, a11y (focus trap, Esc, aria), theme/RTL parity.
- **Later / optional:** votes, server pins, per-course drawer enable, campus SIS
  notices as a third drawer.

## 16. File map (Drawer Phase 1)

**New**
- `frontend-curriculums/LearnDrawer/index.js` + `styles.scss` — reusable right
  slide-in (`open`, `onClose`, `title`, `icon`, children).
- `frontend-curriculums/Topbar/ActivityButtons/index.js` — bell + Q&A buttons and
  their open state (or inline in Topbar).

**Edited**
- `Topbar/index.js` (`__right`) — mount buttons + drawers; gate on enable flags.
- `TopicsTabsNavigation/index.js` — drop Q&A + Announcements tabs (keep lesson
  comments).
- SCSS `_learn-drawers.scss` imported into both frontend bundles.

**Build:** `npm run build` → versioned `frontendCurriculums.*`. Free feature; Pro
unaffected (it only hooks the insert actions).

---

## Appendix A — Axis values & where each combination shines

| Curriculum | Width | Panel | Feels like | Good for |
|-----------|-------|-------|-----------|----------|
| left | standard | off | Classic sidebar | General courses (default) |
| right | standard | off | Right rail | RTL locales, content-first |
| left | standard | on | 3-column | Power learners; notes/Q&A always visible |
| hidden | standard | on | Study split | Watch + take notes together |
| top | standard | off | Stepper | Short/linear courses, onboarding, quizzes |
| hidden | focused | off | Focus | Reading-heavy / text lessons |
| hidden | wide | off | Theater | Video-first lessons |

## Appendix B — Reference prototypes

Standalone HTML mockups of all layouts:
`/Users/tusharimran/Herd/dev/lms-learn-layouts/` (open `index.html`). These are the
visual source of truth for the SCSS engine and the settings preview thumbnail.
