# CLAUDE.md — Clays CoverSpec Studio

## Project overview

**Clays CoverSpec Studio** — *Production-Ready Cover Specs* — is a multi-tool browser microsite consisting of four tools:

1. **Standard Sizes** — reference table of UK and European standard book trim sizes (A-Format through A4, with binding types and use cases)
2. **Cover Templates** — calculates cover artwork dimensions for four binding types and generates to-scale PDF template files for use in DTP software
3. **Micron → Volume** — converts paper thickness in microns to paper volume (bulk factor)
4. **ISBN Barcode** — generates a print-ready EAN-13 ISBN barcode as a vector PDF

Originally reverse-engineered from a suite of Acrobat PDF calculator forms. All JavaScript was extracted from compressed PDF field action streams and reimplemented in vanilla JS.

---

## File structure

Plain files — no build step, no framework, deployable from any static server or filesystem:

| File | Purpose |
|---|---|
| `index.html` | Markup, CSS, tab navigation, all HTML for every tool tab |
| `script.js` | All application logic — calculations, barcode encoding, micron converter, TXT/save; calls the PDF builders |
| `pdfTemplates.js` | Cover template PDF layouts (Clays artwork-guide style) — `pdfBuildLimp/Flaps/Jacket/CFC(state)` return a jsPDF doc |
| `config.js` | Central configuration — brand, cover type rules, spine formulas, board options, alert messages, PDF draw constants |

Root assets expected alongside these files:

| File | Purpose |
|---|---|
| `logo-main.svg` | Clays logo (navy #003057) displayed in the white header at 36px height. `logo.png` is kept for the og:image tag. |
| `favicon-32x32.png` | Browser tab icon (32×32) |
| `favicon-16x16.png` | Browser tab icon (16×16) |
| `apple-touch-icon.png` | iOS home screen icon |

---

## Dependencies

| Dependency | Source | Purpose |
|---|---|---|
| Open Sans | Google Fonts CDN | UI typography (font.family.primary per DESIGN.md) |
| jsPDF 2.5.1 | cdnjs.cloudflare.com | Client-side PDF generation |

jsPDF loaded as UMD bundle: `window.jspdf.jsPDF`.

---

## Design system

The UI uses the Clays palette from DESIGN.md: a white header carrying the navy `logo-main.svg`, a navy tab bar, Clays blue for CTAs and active states, and cyan highlights on navy. All tokens live in `CONFIG.theme` (config.js) and are written to `:root` by `applyTheme()` in `index.html`.

### CSS custom properties

```css
/* Content surfaces — light */
--bg:          #f4f6f8;   /* page background */
--surface:     #ffffff;   /* card background — color.surface.raised */
--border:      #d5dce3;   /* card/input borders, header border */
--border-dark: #a9b4bf;   /* secondary button border */

/* Content text */
--text:        #212529;   /* primary body text — color.text.secondary */
--text-mid:    #4c525a;   /* labels, secondary text — color.text.primary */
--text-dim:    #636b73;   /* muted labels, hints, units */

/* Brand accent */
--accent:       #0e6ba8;  /* Clays blue — color.border.strong: CTAs, active states, section titles, links */
--accent-hover: #0a5a8f;  /* primary button hover */
--accent-dark:  #003057;  /* link hover */
--on-accent:    #ffffff;  /* text/icons on accent fills */
--highlight:    #06bee1;  /* Clays cyan — color.surface.muted: on navy only */

/* Header */
--header-bg:   #ffffff;   /* white so the navy logo reads */

/* Chrome — brand navy (tab bar, primary result card, table header) */
--chrome-bg:   #003057;   /* color.surface.strong */
--chrome-surf: #003057;   /* tab bar */
--chrome-bord: rgba(255,255,255,0.14);
--chrome-text:     #ffffff;
--chrome-text-mid: #ffffff;  /* tab hover */
--chrome-text-dim: #a9bccd;  /* inactive tabs, primary card labels */

/* Error */
--red:         #c0392b;
--red-bg:      #fdf0ee;
--red-border:  #e8b4ae;

--font: 'Open Sans', sans-serif;   /* font.family.primary */
--dur:  300ms;                     /* motion.duration.fast */
--r-xs: 4px;                       /* radius.md */
--r-sm: 10px;                      /* radius.lg */
```

### Contrast ratios (WCAG 2.2 AA — all pass ≥4.5:1)

| Foreground | Background | Ratio |
|---|---|---|
| `#0e6ba8` | `#ffffff` | 5.70:1 (and white on blue) |
| `#0e6ba8` | `#f4f6f8` | 5.26:1 |
| `#ffffff` | `#003057` | 13.46:1 |
| `#06bee1` | `#003057` | 6.06:1 |
| `#a9bccd` | `#003057` | 6.90:1 |
| `#212529` | `#f4f6f8` | 14.24:1 |
| `#4c525a` | `#f4f6f8` | 7.28:1 |
| `#636b73` | `#f4f6f8` | 4.99:1 |

Do not put cyan `#06bee1` on white — it fails contrast. Use it on navy only.

### Theme zones

| Zone | Surface | Text | Accent |
|---|---|---|---|
| Header | `--header-bg` #fff | — | Navy logo `logo-main.svg` |
| Tab bar | `--chrome-surf` #003057 | `--chrome-text-dim` (inactive) / `--chrome-text` (active) | `--highlight` underline |
| Cover type buttons (active) | `--accent` #0e6ba8 | `--on-accent` #fff | — |
| Download / Save buttons | `--accent` | `--on-accent` bold | — |
| Primary result card | `--chrome-bg` #003057 | `--highlight` (value) | — |
| Sizes table header | `--chrome-bg` | `--chrome-text` | — |
| Cards, inputs, body | `--surface` / `--bg` | `--text` #212529 | `--accent` |

### Typography

- Font: Open Sans (Google Fonts, weights 400/500/600/700)
- Base size: 14px, line-height 1.65
- Section titles: 10px, weight 700, letter-spacing 0.16em, uppercase, `--accent` colour
- Labels: 13px, weight 600, `--text-mid`
- Hints/notes: 11px, weight 500, `--text-dim`
- Tab labels: 12px, weight 600, letter-spacing 0.07em, uppercase

### Focus visible

Global `:focus-visible` rule applies `2px solid var(--accent)` outline (cyan `--highlight` on the navy tab bar) with `outline-offset: 2px` to all interactive elements (WCAG 2.2 AA keyboard requirement).

---

## config.js

All cover-type rules, board options, alert messages, and PDF draw constants live here. Change behaviour by editing config.js — never hard-code values in script.js.

**Enhanced documentation:** config.js includes a detailed customization guide at the top and inline comments explaining each constraint, when alerts trigger, and how to modify production rules. See the file itself for examples on changing dimension limits, alert messages, board sizes, and PPC subtypes.

### Structure

```js
CONFIG = {
  brand: { name, tagline },
  features: { enablePaperPresets, enableSaveHistory },
  paperStocks: [ { label, gsm, microns, method, type, sizes, formats, note? }, ... ],
  paperFormats: { A, B, Demy, Royal },           // { h, w: [min, max] } — stocked reel sizes
  paperFormatToleranceMm: 2,
  theme: { ... },                                 // CSS custom properties (see Design system)
  coverTypes: {
    limp:   { label, slug, spineBaseline, spineRoundMm, minBulkMm, maxBulkMm, hinge, safeZone, bleedNote, ... },
    flaps:  { label, slug, spineBaseline, spineRoundMm, minBulkMm, maxBulkMm, flapMin, flapSpineClear, hinge, safeZone, ... },
    jacket: { label, slug, spineBaseline, spineRoundMm, minBulk, maxBulkMm, boardOverhang, safeZone, turnIn, flapMin, flapMax, inlineMinSpineMm, heightAdd, ... },
    ppc:    { label, slug, spineBaseline, spineRoundMm, minBulk, maxBulkMm, wrap, boardInset, safeEdge, safeSpine, safeGutter, subtypes: { round, flatback } },
  },
  printMethods: { conventional, digital },        // cased printing method (indexes minBulk, groups paper stocks)
  boardThicknesses: [ { label, value }, ... ],  // populated into <select> at runtime
  defaultBoard: 4,                               // 2mm boards selected on load / reset
  bindingAdders: { '0': 0, '2': 2 },            // Perfect Bound / Sewn
  alerts: { bulkMax, bulkMin, bulkFlatBack, flapMin, flapMax, handJacket, jktFlapMin, jktFlapMax, boardReq, requiredFields, paperFormat, paperMethod },
  pdf: { ink, slate, white, flapTint, lineW, dotW, dotGap, arrowW, headL, ... },
}
```

### Board thickness options

Values represent the combined contribution of both boards to spine width (mm). The value also keys the CFC gutter (`ppc.subtypes[type].gutter`).

| Label | Value | Notes |
|---|---|---|
| Choose board size | 0 | Triggers `alert-board-req` |
| 2mm boards | 4 | Default (`CONFIG.defaultBoard`) — 2000mic |
| 3mm boards | 6 | 3000mic |

---

## Spine formulas

### Limp / Paperback

```
spine = round1dp((pages × gsm × vol) / 20000 + 0.65)
```

Rounded to **1 decimal place immediately** before any derived values are computed. Never use the raw float downstream — docW must agree with displayed spine.

```js
spine = Math.round(((pages * gsm * vol) / 20000 + 0.65) * 10) / 10;
```

If pages, gsm, or volume is zero, spine = 0 (no baseline applied).

### Limp with Flaps (8pp)

Same formula as limp. Bulk limits 5–50mm (`flaps.minBulkMm/maxBulkMm`).

### Dust Jacket

```
spine = roundMm((pages × gsm × vol) / 20000 + 0.50 + boardValue + bindingAdder)
```

- `boardValue` — from board thickness dropdown (both boards combined, e.g. 2mm boards = 4mm)
- `bindingAdder` — Perfect Bound = 0, Sewn = 2mm
- Rounded to nearest whole mm

### CFC (all back styles)

Same formula as jacket. Board thickness and binding adder required.

```
spine = roundMm((pages × gsm × vol) / 20000 + 0.50 + boardValue + bindingAdder)
```

---

## Terminology

Clays say **Paperback**, never "Limp". All user-facing text (UI, PDF templates, TXT specs, filenames) must say Paperback. The internal mode key stays `limp` (IDs such as `btn-limp`, `r-limp-*`, saved calculations); display names and filename prefixes come from `CONFIG.coverTypes[mode].label` and `.slug`.

Likewise Clays say **CFC**, not "PPC" / "Printed Paper Case". The internal mode key stays `ppc` (`btn-ppc`, `r-ppc-*`, `ppcType`, `ppcWrap`, `cvCalcPPC`, `pdfBuildCFC`); everything users see says CFC.

The product name is **Clays CoverSpec Studio**.

## Cover type geometry

### Limp / Paperback

```
docW = pW + spine + pW
docH = pH
hinge = 3mm each side of spine boundary
bulk: 4–60mm
```

### Limp with Flaps (8pp)

```
coverW = pW + 1          (+1mm manufacturing tolerance)
docW   = flapW + coverW + spine + coverW + flapW
docH   = pH
bulk: 5–50mm
flap min: 60mm, flap max: pW − 20mm  (folded flap stops 20mm short of the spine; CONFIG flaps.flapSpineClear)
score lines at flapW and flapW + coverW from each edge
```

### Dust Jacket

```
coverW = pW + 3          (front/back = trim + 3mm, e.g. 153 → 156; CONFIG jacket.boardOverhang)
TURN   = 10              (fixed turn-in, mm)
docW   = flapW + coverW + spine + coverW + flapW   (flapW as entered INCLUDES the 10mm turn-in)
docH   = pH + 6          (+6mm top/bottom board overhang)
bulk: max 60mm; min by printing × back style (see Alerts) — text bulk < 8mm must be Flat Back
spine (incl. boards) < 10mm → hand jacketing, not in-line (CONFIG jacket.inlineMinSpineMm)
flap min: 70mm, flap max: 100mm
fold at flapW from each edge; turn-in limit at flapW − TURN
safe zone: no type/border within 3mm of edges
```

### CFC (internal key `ppc`)

```
coverW = pW − 4          (front/back board = trim − 4mm, e.g. 153 → 149; CONFIG ppc.boardInset)
gutter = by back style × board caliper (CONFIG ppc.subtypes[type].gutter[boardValue]):
           Round Back  2000mic (2mm) = 8mm   3000mic (3mm) = 9mm
           Flat Back   2000mic (2mm) = 10mm  3000mic (3mm) = 11mm
WRAP   = 18mm turn-in default (CONFIG ppc.wrap — user-editable)
trimW  = round(coverW + gutter + spine + gutter + coverW)
trimH  = round(pH + 6)
docW   = WRAP + coverW + gutter + spine + gutter + coverW + WRAP
docH   = pH + WRAP + WRAP + 6
safe zones: 4mm from case edge, 2mm from spine edges, 4mm from gutter (front/back)
```

Paperback and Paperback with Flaps: no type/border within 3mm of edges (`safeZone`). Safe zones appear as dotted guides with notes in the PDF template and as a line in the spec box.

---

## Dimension convention

**Height × Width** throughout — all labels in the PDF and UI spec box follow `H × W mm`.

- BACK COVER / FRONT COVER sub-labels: `${fmt(docH)} × ${fmt(pW)} mm`
- Document Size info line: `Document Size: ${fmt(docH)} × ${fmt(docW)} mm`
- Page size: `Page: ${fmt(docH)} × ${fmt(pW)} mm`

Do not swap to W × H.

---

## PDF template specification

### Page geometry

| Property | Value |
|---|---|
| MediaBox | `docW × docH` mm (trim size — no bleed added to page) |
| TrimBox | Full page (= MediaBox), specified in points with Y-flip |
| BleedBox | Not set |
| Unit | mm |

### TrimBox coordinate conversion

jsPDF writes box values directly into the PDF stream without unit conversion. Values must be in **points**, using PDF's **bottom-left origin** (Y flipped from jsPDF's top-left):

```js
const SF = doc.internal.scaleFactor; // 2.8346 pts/mm
pageCtx.trimBox = {
  bottomLeftX: 0,
  bottomLeftY: 0,
  topRightX:   pageW * SF,
  topRightY:   pageH * SF,
};
```

For offset trim (if bleed is ever re-introduced as page padding):
```
bottomLeftY = (pageH − bleed − docH) × SF
topRightY   = (pageH − bleed) × SF
```

### PDF layout — Clays artwork-guide style (`pdfTemplates.js`)

Modelled on Clays' reference guides `jacket-wrapper.pdf`, `printed-cover-for-case-flat-back.pdf` and `printed-cover-for-case-rounded-and-backed.pdf` (kept in the project root). Values are job-specific, not generic examples.

- **Surfaces:** white panels, slate spine fill, light-slate flap tint (paperback flaps, jacket flaps). Thin slate page border.
- **Titles:** BACK / FRONT (and BACK FLAP / FRONT FLAP) in letter-spaced Helvetica Bold, slate; SPINE rotated in white inside the spine, sized to the spine width and omitted below 6mm.
- **Guides:** dotted (round-cap dots) for safe zones, jacket turn-in/fold/trim lines and CFC spine-lettering limits; dashed for paperback hinges and flap score lines.
- **Dimension arrows** with plain-English notes (Helvetica 8pt, ink `#231f20`); rotated notes in narrow strips (turn-in, case joint, hinge).
- **Job spec block** (title line + document/spine/board figures + bleed note) bottom-left of the back panel; for CFC in the bottom turn-in.
- **Per type:**
  - *Paperback:* hinge lines 3mm onto each cover; 3mm safe rect per cover (inner edge = hinge); trim width arrow on back; trim height arrow on front.
  - *Flaps:* as paperback plus score lines, flap safe rects, flap width arrows, cover panel (trim + 1mm) arrow.
  - *Jacket:* dotted lines at turn-in limit, fold (trim + 3mm) and trim width each side; flap arrows "including 10mm of colour turn-in"; rotated 10mm turn-in notes; jacket height arrow on back flap; three front-panel arrows (trim width / trim + 3 centring / trim + 13 extent); 3mm safe rect inset from the page edge.
  - *CFC:* slate board outlines; 4mm safe rects ("Non-bleed designs must be 4mm away from trim"); 18mm turn-in arrows on all four edges; joint arrows plus rotated joint-allowance note for the selected back style; board width/height arrows and notes; spine-lettering 2mm note with pointer; Round Back only: centring arrow across the front safe zone.
- **Style constants** live in `CONFIG.pdf` (colours, line weights, dot spacing, arrowheads, font sizes, title tracking).
- **No crop marks / slug.** The Clays references include a slug with crop marks, but the page must stay = document size because the Fit to Graphic scripts size the user's document to the placed PDF.

### Filename conventions

| Mode | Pattern | Example |
|---|---|---|
| Paperback | `paperback-template-{pW}x{docH}-sp{spine}.pdf` | `paperback-template-129x198-sp25.6.pdf` |
| Flaps | `flaps-template-{pW}x{docH}-sp{spine}.pdf` | `flaps-template-156x234-sp17.3.pdf` |
| Jacket | `jacket-template-{pW}x{pH}-sp{spine}.pdf` | `jacket-template-156x234-sp22.pdf` |
| CFC | `cfc-template-{pW}x{pH}-sp{spine}.pdf` | `cfc-template-156x234-sp20.pdf` |

Widths/heights use `fmt(n, 0)` (integer). Spine uses `fmt(n)` (1dp) for limp/flaps, `fmtInt(n)` (whole mm) for jacket/PPC.

---

## UI — inputs

| ID | Label | Unit | Modes | Notes |
|---|---|---|---|---|
| `pHeight` | Trim Height | mm | all | Page trim height |
| `pWidth` | Trim Width | mm | all | Single page trim width |
| `gsm` | Grammage | gsm | all | Paper weight |
| `volume` | Volume | — | all | Paper volume / bulk factor, step 0.1 |
| `numPages` | Number of Pages | pp | all | Total extent including plate sections |
| `flapWidth` | Flap Width | mm | flaps | Min 60mm, max pW−20mm (`flaps.flapMin` / `flapSpineClear`) |
| `jacketFlapWidth` | Flap Width | mm | jacket | Includes the 10mm turn-in. Min 70mm, max 100mm |
| `binding` | Binding Style | — | jacket, ppc | Select: Perfect Bound (0) / Sewn (+2mm) |
| `boardThickness` | Board Size | mm | jacket, ppc | Populated from `CONFIG.boardThicknesses`; defaults to 2mm boards (`CONFIG.defaultBoard`) |
| `ppcType` | Back Style | — | jacket, ppc | Select: round / flatback — sets cased min bulk; CFC gutter from board caliper |
| `printMethod` | Printing Method | — | jacket, ppc | Populated from `CONFIG.printMethods` (conventional / digital) — sets cased min bulk |
| `ppcWrap` | Wraparound Size | mm | ppc | Board overhang on all four sides (default 18mm from config, resets on tab switch) |
| `paperStockSelect` | Paper Stock Preset | — | all | Clays house papers grouped Conventional / Digital — fills gsm/volume and sets Printing Method |

All number inputs: `type="number"`, `min="0"`. Most hide spinner arrows for cleaner UI; `bcFontScale` (barcode font size) displays spinner arrows for easy adjustment. All fire `cvCalculate()` or `bcUpdatePreview()` on `input` event.

---

## UI — result displays

### Cover Templates

| ID | Mode | Label | Primary card |
|---|---|---|---|
| `r-limp-spine` / `r-limp-docW` / `r-limp-docH` | limp | Spine / Doc Width / Doc Height | docW |
| `r-flaps-spine` / `r-flaps-coverW` / `r-flaps-docW` / `r-flaps-docH` | flaps | Spine / Cover Width / Doc Width / Doc Height | docW |
| `r-jkt-spine` / `r-jkt-coverW` / `r-jkt-docW` / `r-jkt-docH` | jacket | Spine / Cover Width / Doc Width / Doc Height | docW |
| `r-ppc-spine` / `r-ppc-trimW` / `r-ppc-trimH` / `r-ppc-docW` / `r-ppc-docH` | ppc | Spine / Trim Width / Trim Height / Doc Width / Doc Height | docW |

All show `—` until pWidth and pHeight are both > 0.

### Alerts

| ID | Trigger |
|---|---|
| `alert-bulk-max` | Text-block bulk > 60mm (paperback, jacket, ppc); > 50mm (flaps) |
| `alert-bulk-min` | Text-block bulk < 4mm (paperback); < 5mm (flaps); cased (jacket, ppc): conventional Flat Back 4mm / Round Back 8mm, digital 10mm. Uses `bulkFlatBack` text ("must have a Flat Back board hollow") when Round Back is under its minimum but Flat Back would pass |
| `alert-flap-min` | flapW < 60mm (flaps) — flap alerts sit in their Flap section, under the input |
| `alert-flap-max` | flapW > pW−20mm (flaps) |
| `alert-jktflap-min` | flapW < 70mm (jacket) |
| `alert-jktflap-max` | flapW > 100mm (jacket) |
| `alert-hand-jacket` | Jacket spine (incl. boards) < 10mm — needs hand jacketing (advisory) |
| `alert-board-req` | boardThickness = 0 with hasCore (jacket, ppc) |
| `alert-paper` | Chosen paper stock not held for the trim size, or (cased) its printing method differs from Printing Method |
| `alert-required-fields` | Mode-specific required field is missing (flaps: flap width; jacket: flap width) — only shows after user enters trim dimensions |

**Bulk** = text-block thickness `(pages × gsm × vol) / 20000` (1dp) — no cover, board or binding allowance. Clays' limits apply to bulk, not spine: max 60mm (flaps 50mm); min 4mm paperback, 5mm flaps. Cased minimum depends on printing method and back style — Conventional: Flat Back 4mm, Round Back 8mm; Digital: both 10mm. Limits live in `CONFIG.coverTypes[mode].minBulkMm/maxBulkMm` (cased: `minBulk[printMethod][backStyle]`); alert text in `CONFIG.alerts.bulkMin/bulkMax` with `{bulk}`/`{min}`/`{max}`/`{type}` placeholders, written into the alert divs at runtime. The spine value turns red when either alert shows, and a Bulk line appears in the spec box. All alert messages are customizable in `config.js.alerts`.

---

## Micron to Volume calculator

Formula: `volume = (microns / gsm) × 10`

Result displayed to 1dp. Copy to clipboard button. Clear button.

IDs: `mv-micron`, `mv-gsm`, `mv-volume`, `mv-copy`, `mv-result-wrap`.

---

## ISBN Barcode generator

- **Input:** ISBN-13 (hyphens stripped, must start 978 or 979, check digit validated)
- **Add-on:** EAN-5 only (5 digits for price or edition number). Leave blank if not required.
- **Output:** single vector PDF, sized to user-specified width × height (mm)
- Barcode drawn as native jsPDF rectangles — not images — resolution independent
- Embedded Noto Sans font (base64 in script.js) for barcode text
- Live canvas preview updates on input
- No batch, no step-and-repeat, no ISSN — stripped from the original ISBN generator

### Text Customization

Users can customize barcode text elements via toggles and settings:

| Control | Type | Range | Default | Purpose |
|---|---|---|---|---|
| `bcShowLabel` | Checkbox | on/off | on | Show/hide ISBN label at top |
| `bcShowDigits` | Checkbox | on/off | on | Show/hide digit numbers below barcode |
| `bcShowAddonDigits` | Checkbox | on/off | on | Show/hide EAN-5 add-on numbers |
| `bcFontScale` | Number input | 50–150% | 100% | Scale all text elements proportionally |
| `bcIsbnFormat` | Select | "formatted" / "raw" | "formatted" | ISBN label format: `ISBN XXX-X-XXX-XXXXX-X` or `9780000000000` |

**Text Overflow Warning:**
- Displays if ISBN label width exceeds barcode width at current font size
- Message: "⚠ Text size exceeds barcode width. Reduce font size or increase barcode width."
- Checked in real-time; updates as user adjusts font scale or barcode width

**Layout & Alignment:**
- ISBN label at top left-aligns with visual barcode structure (indented 4 module widths from left edge)
- Font sizes scale proportionally with barcode height and font scale setting
- **Preview note:** Canvas preview renders at 96 DPI (screen resolution) for performance; text will appear larger in the final PDF at print resolution

**Clear Button:**
- Resets all barcode inputs to defaults
- Width/height reset to 38 × 27mm
- All text customization options reset to defaults

IDs: `bcIsbn`, `bcAddon`, `bcWidth`, `bcHeight`, `bcShowLabel`, `bcShowDigits`, `bcShowAddonDigits`, `bcFontScale`, `bcIsbnFormat`, `bc-canvas`, `bc-error`, `bc-preview-wrap`, `bc-download`.

---

## Standard Sizes Reference

Reference table of UK and European standard book trim sizes for both limp-bound (paperback) and case-bound (hardback) publishing:

**Included formats:**
- **A-Format** (178 × 111 mm) — Mass-market fiction paperbacks
- **B-Format** (198 × 129 mm) — Most common UK fiction & non-fiction
- **Demy Limp** (216 × 135 mm) — Premium trade paperbacks, literary fiction
- **Demy Case Bound** (216 × 138 mm) — Standard hardback fiction & non-fiction
- **American Royal** (229 × 152 mm) — US Trade (6×9"), print-on-demand standard
- **Royal Limp** (234 × 153 mm) — Premium paperbacks, biographies, travel editions
- **Royal Case Bound** (234 × 156 mm) — Commercial hardbacks & heavy non-fiction
- **Pinched Crown Quarto** (248 × 171 mm) — Specialized non-fiction, textbooks
- **Crown Quarto** (246 × 189 mm) — Children's books, art, photography, poetry anthologies
- **A5** (210 × 148 mm) — Academic publishing, journals, technical manuals
- **A4** (297 × 210 mm) — Illustrated art books, atlases, children's picture books

**Technical note:** For case-bound (hardback) books, the outer rigid boards typically extend 3–4mm beyond the page block on top, bottom, and fore-edge for protection.

All dimensions listed as Height × Width in millimetres. Data source: UK and European Standard Book Sizes Guide (book sizes.md).

IDs: `tab-sizes`, table in card format for reference use.

---

## TXT Specs Download

Generated alongside PDF templates, the TXT file exports all calculated specifications in human-readable format:

```
GENERATED: 7/12/2026, 10:30:45 AM

============================================================

COVER TYPE
------------------------------------------------------------
TYPE: Jacket

PAGE DIMENSIONS
------------------------------------------------------------
Trim Height: 234 mm
Trim Width: 156 mm

PAPER SPECIFICATION
------------------------------------------------------------
Grammage: 80 gsm
Volume: 13
Number of Pages: 320 pp

COVER SPECIFICATIONS
------------------------------------------------------------
Doc Size: 297 × 370 mm
Spine: 22 mm (rounded to mm)
Board: 4mm (both boards combined)
Binding: Perfect Bound
...
```

**Filename:** `specs-{slug}-{pH}x{pW}-sp{spine}.txt`

IDs: `btn-specs`, triggered from results card.

---

## Paper Stock Presets

Optional dropdown (enabled via `CONFIG.features.enablePaperPresets`) that fills gsm and volume from the Clays house paper range:

**Populated from:** `CONFIG.paperStocks` — the Clays House Paper Text Range 2026 (`CLAYS_HOUSE_PAPER_RANGE_2026.pdf`). Each entry is `{ label, gsm, microns, method, type, sizes, formats, note? }`. The dropdown groups stocks under `CONFIG.printMethods` (Conventional / Digital); option values are indexes into `CONFIG.paperStocks`. Microns are never shown; volume is `(microns / gsm) × 10` to 2dp (`cvStockVolume()`).

**Behavior:**
- Selecting a stock fills `gsm` and `volume`, sets `printMethod` to the stock's method, and shows type, stocked sizes and any supplier note in `paperStockHint`
- Editing gsm/volume away from the stock's values clears the selection
- `alert-paper` (non-blocking, shown in the Paper Specification section under gsm/volume) when the trim doesn't match the stock's `formats` (`CONFIG.paperFormats` A/B/Demy/Royal, ±`paperFormatToleranceMm`; `formats: null` = all formats), or in cased modes when Printing Method differs from the stock's method

Example entries:

```js
paperStocks: [
  { label: 'FSC Holmen Book 52gsm', gsm: 52, microns: 81, method: 'conventional',
    type: 'Improved Mechanical', sizes: 'B Format', formats: ['B'] },
  { label: 'FSC Ensolux Cream 70gsm', gsm: 70, microns: 110, method: 'digital',
    type: 'Improved Mechanical', sizes: 'Demy & Royal', formats: ['Demy','Royal'],
    note: 'Large formats are printed on …' },
]
```

- Enter the supplier's caliper in `microns`; never put microns in the label.
- `sizes` is Clays' wording (shown in the hint); `formats` is what the trim check uses — keep them in step.
- A stock held for both methods gets one entry per method. The placeholder option is added in code, not config.
- Supplier notes from the range sheet are reworded without the TJ site name. Note-to-stock attribution was read from the PDF layout (notes sit between rows) — confirm with Clays if in doubt.

IDs: `paperStockSelect` (select), `paperStockHint`, `paperPresetRow` (optional section), `alert-paper`.

---

## Saved Calculations

Manual save feature (enabled via `CONFIG.features.enableSaveHistory`) stores calculation specs to browser localStorage with custom names.

**Behavior:**
- Click "Save Calculation" button → modal prompts for name
- Specs stored with: `id` (timestamp), `name` (user input), `timestamp`, `mode`, `inputs` object
- Dropdown shows saved calculations; click to load → repopulates all form fields
- Delete button removes individual saves; "Clear All" wipes history

**Storage key:** `coverspec_saved` (browser localStorage)

**Format:**
```js
{
  id: 1720774245000,
  name: "Jacket • 156×234",
  timestamp: 1720774245000,
  mode: "jacket",
  inputs: { pHeight: 234, pWidth: 156, gsm: 80, volume: 13, ... }
}
```

IDs: `btn-save-calc`, `saveModal`, `savedCalcsSection`, `savedCalcsDropdown`.

---

## `fmt()` / `fmtInt()` functions

```js
function cvFmt(n, d=1) {
  const f = parseFloat(n.toFixed(d));
  return d === 1 ? f.toFixed(1) : String(f);
}
function cvFmtInt(n) { return String(Math.round(n)); }
```

`cvFmt()` always produces 1dp by default. Pass `d=0` for integers. `cvFmtInt()` rounds to whole mm (used for jacket/PPC spine, docW, docH). Used throughout both UI and PDF output to guarantee displayed values agree.

---

## Known constraints and decisions

- **No bleed on the PDF page.** Page = trim size only. Bleed instruction is a text note. Adding a bleed-padded page with dashed guides was tried and rejected as confusing to non-technical users.
- **Dimension arrows and rotated notes are back** (Oct 2026) — Clays' preferred layout uses them; this supersedes the earlier client decision that removed them. Rotated text verified in MuPDF rendering; check Acrobat/Preview when changing layouts.
- **No white background boxes behind text.** Text sits directly on the panels.
- **Spine rounded before docW.** `Math.round(raw × 10) / 10` applied immediately to prevent displayed spine and docW disagreeing due to float precision.
- **Board thickness required for jacket and PPC.** Alert fires if user enters dimensions without selecting a board size. Without a board value the spine is materially wrong.
- **Height × Width convention.** All dimensions printed `H × W mm` to match industry standard for book formats.

---

## Recent updates (v2.0+)

- **Rebranding:** Project renamed to "Clays CoverSpec Studio" with tagline "Production-Ready Cover Specs"
- **Enhanced config.js:** Added comprehensive customization guide and inline comments explaining all dimension constraints, alert triggers, and how to modify production rules
- **Improved introduction:** Wider card layout (800px) and larger typography (15px intro, 14px body) for better readability
- **Paper Stock Presets:** (superseded — see House paper range below)
- **Saved Calculations:** Manual save feature—users click "Save Calculation" to store specs with custom names. No auto-history. Uses browser localStorage, searchable by name
- **TXT Specs Download:** Alongside PDF template, users can download calculated specifications as a text file with all dimensions, paper details, and cover-type-specific settings
- **Red PDF Text:** (superseded — see Clays PDF layout below)
- **Improved UI:** Placeholder text is subtle and smaller; save modal matches app design system; custom modal dialog for saving calculations (no browser prompt)
- **CFC Wraparound Customization:** Input field allows users to customize the turn-in (default 18mm, all four sides). Resets to 18mm when switching to the CFC tab
- **Required Fields Alert:** Shows when user has entered trim dimensions but hasn't filled in mode-specific required fields (flap width for flaps/jacket)
- **Updated Alert Messages:** All alerts now reference "Contact Your Printer" instead of "Contact Your Account Manager"
- **Clean branding:** Removed all references to previous white-label client (TJ Clays/TJ Books)
- **MIT License:** Published as open-source with permissive licensing
- **Barcode Text Customization:** ISBN barcode generator now supports toggling ISBN label, digit numbers, and EAN-5 add-on display. Font scaling (50–150%), ISBN format options (formatted vs. raw), and real-time text overflow warning when text exceeds barcode width. Improved text alignment and positioning for cleaner layout
- **Standard Sizes Reference:** New reference tab displaying UK and European standard book trim sizes (A-Format through A4) with binding types and use cases. Sourced from comprehensive book sizes research document
- **Bulk limits** (Oct 2026) — spine warnings replaced by text-block bulk limits: max 60mm; min 4mm paperback; cased by printing method × back style (see Alerts)
- **Flaps Width Constraint Removed:** Removed 580mm maximum document width constraint for 8pp flap covers, allowing greater flexibility for varied production scenarios
- **SVG export removed** (Oct 2026) — PDF template is the only template download.
- **Clays PDF layout:** PDF templates rebuilt in `pdfTemplates.js` after Clays' reference artwork guides — slate/ink palette, dotted safe zones, dimension arrows, job-specific notes.
- **Printing Method & Back Style** (Oct 2026) — Dust Jacket and CFC have a Printing Method select (Conventional / Digital) and a shared Back Style select; together they set the cased minimum bulk.
- **House paper range** (Oct 2026) — Paper Stock dropdown replaced with the Clays House Paper Text Range 2026, grouped Conventional / Digital, with stocked-size and printing-method warnings in the Paper Specification section.
- **Default board** (Oct 2026) — Dust Jacket and CFC default to 2mm boards.

---

## Saved Calculations

Users can manually save calculation specs with custom names to browser localStorage:

**UI:** "Save Calculation" button → optional name input modal → stored in `coverspec_saved`

**Format stored:**
```js
{
  id: timestamp,
  name: "Jacket • 156×234",  // User-customizable
  timestamp: Date.now(),
  mode: "jacket",
  inputs: { pHeight, pWidth, gsm, volume, numPages, ... }
}
```

**Toggle via config:**
```js
CONFIG.features.enableSaveHistory = true  // enables saved calculations
```

Saved calculations appear in a dropdown at the bottom of the form. Users can load, rename (by re-saving), or delete. No limit on number of saved calculations.

---

## Expanding the application

### Paper stock presets

✓ **Already implemented.** See "Paper Stock Presets" section above. Customize available stocks by editing `CONFIG.paperStocks` in `config.js`.

### Even-page validation

Add a check in `cvCalculate()` flagging if `numPages` is odd (cover extents are always even).

### Additional back styles

Add entries to `CONFIG.coverTypes.ppc.subtypes` as `{ label, gutter: { <boardValue>: mm, ... } }` — one gutter per board in `boardThicknesses`. Also add the key to each `minBulk[method]` on jacket and ppc, and an `<option>` to `ppcType` in index.html (the select is static markup).

### Additional board sizes

Add entries to `CONFIG.boardThicknesses`. The board select is populated by `cvPopulateBoardSelect()` at init. Add a matching gutter to every `ppc.subtypes[type].gutter`.

### White-labelling

The app ships with "Clays CoverSpec Studio" and "Production-Ready Cover Specs" as defaults. To re-brand:

1. Replace `logo-main.svg` (header, 36px height) and `logo.png` (og:image) with your brand logo
2. Update `CONFIG.brand.name` and `CONFIG.brand.tagline` in `config.js`
3. Update `CONFIG.paperStocks` to your paper suppliers' stocks and specifications
4. Optionally update `CONFIG.theme` colors to match your brand identity
5. Update alert messages in `CONFIG.alerts` to reference your support process
6. Enable/disable features in `CONFIG.features` (paper presets, saved calculations)
7. Update PDF template titles in `CONFIG.coverTypes[mode].templateTitle` if needed
8. All changes apply immediately—no code modifications needed
