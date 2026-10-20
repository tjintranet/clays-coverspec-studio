/* ═══════════════════════════════════════════════════════════════════
   config.js — Cover Layout Creator
   Central configuration: branding, cover rules, alert messages.

   CUSTOMIZATION GUIDE
   ───────────────────────────────────────────────────────────────────
   This file controls all production rules and user-facing messages.

   • DIMENSION CONSTRAINTS: Each cover type specifies maximum spine width
     (minBulkMm/maxBulkMm), maximum flap widths (flapMin/Max), and other bounds.
     Change these to enforce your production capabilities.

   • ALERT MESSAGES: When a user enters a value exceeding a constraint,
     the corresponding alert fires. Messages live in the alerts section
     below and reference the constraint values in coverTypes.

   • BOARD SIZES: The boardThicknesses array populates the jacket and
     CFC board dropdown. Add or remove options to match your inventory.

   • PPC SUBTYPES: The ppc.subtypes object defines board hollow styles
     with their gutter widths. Add new subtypes as new production flows.

   All changes apply immediately—no code changes needed in script.js.
═══════════════════════════════════════════════════════════════════ */

const CONFIG = {

  brand: {
    name:     'Clays CoverSpec Studio',
    tagline:  'Production-Ready Cover Specs',
  },

  // ── Feature Toggles ────────────────────────────────────────────
  // Enable or disable optional features for your deployment
  features: {
    enablePaperPresets:  true,    // Show paper stock preset dropdown
    enableSaveHistory:   true,    // Save and recall recent calculations
  },

  // ── Paper Stock Presets ────────────────────────────────────────
  // Commonly used papers in book production. Add or modify to match
  // your suppliers. Format: { label, gsm, volume }
  // Note: volumes are calculated from formula (microns/gsm)×10.
  // Verify with your paper supplier and adjust as needed.
  // Tip: To add a custom paper, manually enter gsm/volume below the
  // dropdown without selecting a preset.
  paperStocks: [
    // microns = caliper from the paper supplier. Not shown in the dropdown —
    // volume is derived as (microns / gsm) × 10 when the list is built.
    { label: '— Select a paper stock (or enter custom) —', gsm: 0, microns: 0 },
    { label: 'FSC Holmen Book Cream 52gsm',       gsm: 52, microns: 80  },
    { label: 'FSC Holmen Book Cream 55gsm',       gsm: 55, microns: 106 },
    { label: 'FSC Holmen Book Cream 65gsm',       gsm: 65, microns: 138 },
    { label: 'FSC Holmen Book Cream 80gsm',       gsm: 80, microns: 155 },
    { label: 'FSC Holmen Book 52gsm',             gsm: 52, microns: 80  },
    { label: 'FSC Holmen Book 55gsm',             gsm: 55, microns: 106 },
    { label: 'FSC Bulky News 49gsm',              gsm: 49, microns: 112 },
    { label: 'FSC Bulky News 52gsm',              gsm: 52, microns: 114 },
    { label: 'FSC Ensolux Cream 70gsm',           gsm: 70, microns: 110 },
    { label: 'FSC College Text 80gsm',            gsm: 80, microns: 138 },
    { label: 'FSC Arctic Matt 90gsm',             gsm: 90, microns: 83  },
    { label: 'FSC White Woodfree Offset 80gsm',   gsm: 80, microns: 98  },
    { label: 'FSC Munken Premium White 80gsm',    gsm: 80, microns: 140 },
    { label: 'FSC Munken Premium Cream 80gsm',    gsm: 80, microns: 140 },
    { label: 'FSC Munken Pure 80gsm',             gsm: 80, microns: 104 },
  ],

  // ── Theme tokens ───────────────────────────────────────────────
  // All colour, typography, radius, and motion values used by the UI.
  // These are written into :root as CSS custom properties at init by
  // applyTheme() — config.js is the single source of truth for all
  // brand decisions. To white-label: update values here only.
  theme: {
    // Palette from DESIGN.md (Clays). Contrast ratios are WCAG 2.2 AA.
    // Content surfaces (light palette)
    bg:           '#f4f6f8',   // page / input background (cool neutral)
    surface:      '#ffffff',   // card background — color.surface.raised
    border:       '#d5dce3',   // card and input borders
    borderDark:   '#a9b4bf',   // secondary button border

    // Content text (dark on light)
    text:         '#212529',   // primary body text — color.text.secondary (14.2:1 on bg)
    textMid:      '#4c525a',   // labels, secondary text — color.text.primary (7.3:1 on bg)
    textDim:      '#636b73',   // muted labels, hints, units (≥4.5:1 on bg)

    // Brand accent
    accent:       '#0e6ba8',   // Clays blue — color.border.strong (5.7:1 on white, both ways)
    accentHover:  '#0a5a8f',   // darkened blue — primary button hover
    accentDark:   '#003057',   // navy — link hover
    onAccent:     '#ffffff',   // text/icons on accent fills
    highlight:    '#06bee1',   // Clays cyan — color.surface.muted; use on navy only (6.1:1)

    // Header — white so the navy logo-main.svg reads at full strength
    headerBg:     '#ffffff',

    // Chrome surfaces (brand navy — tab bar, primary result card)
    chromeBg:     '#003057',   // color.surface.strong
    chromeSurf:   '#003057',   // tab bar background
    chromeBord:   'rgba(255,255,255,0.14)', // chrome borders

    // Chrome text (on navy chrome)
    chromeText:    '#ffffff',  // primary on navy (13.5:1)
    chromeTextMid: '#ffffff',  // hover on navy
    chromeTextDim: '#a9bccd',  // inactive tabs on navy (6.9:1)

    // Fallback logo mark (shown if logo-main.svg is absent)
    logoFallback: '#003057',

    // Semantic error
    red:          '#c0392b',
    redBg:        '#fdf0ee',
    redBorder:    '#e8b4ae',

    // Typography
    font:         "'Open Sans', sans-serif",   // font.family.primary

    // Motion
    dur:          '300ms',

    // Radii
    rXs:          '4px',
    rSm:          '10px',
  },

  // ── Cover type definitions ─────────────────────────────────────
  // Each cover type includes spine calculation parameters and dimension
  // constraints (minBulkMm/maxBulkMm, maxDocWMm, flap ranges, etc). Modify these
  // values to enforce different production rules for your workflow.
  // Changing a constraint will automatically trigger an alert in the UI
  // if the user enters a value that exceeds it.
  // See the alerts section below for the corresponding alert messages.
  coverTypes: {
    limp: {
      label:       'Paperback',
      slug:        'paperback',  // used in download filenames
      spineBaseline:  0.65,        // baseline mm added to spine calculation
      spineRoundMm:   false,       // round to 1 decimal place (not whole mm)
      minBulkMm:      4,           // paperback minimum text-block bulk (mm)
      maxBulkMm:      60,          // maximum text-block bulk (mm)
      hinge:          3,           // mm inboard from spine edge for hinge guide
      safeZone:       3,           // no type/border within this many mm of the edges
      bleedNote:      'Add 3mm bleed allowance to the document',
      pdfNote:        'PDF page = trim size. Hinge & spine guides included.',
      templateTitle:  'Cover Layout — Paperback Cover Template',
    },
    flaps: {
      label:       'Paperback with Flaps',
      slug:        'flaps',
      spineBaseline:  0.65,        // baseline mm added to spine calculation
      spineRoundMm:   false,       // round to 1 decimal place
      minBulkMm:      4,           // paperback minimum text-block bulk (mm)
      maxBulkMm:      60,          // maximum text-block bulk (mm)
      flapMin:        90,          // alert if user enters flap width < this value (mm)
      hinge:          3,           // mm inboard from spine edge for hinge guide
      safeZone:       3,           // no type/border within this many mm of the edges
      bleedNote:      'Add 3mm bleed allowance to the document',
      pdfNote:        'PDF page = trim size incl. flaps. Score & spine guides included.',
      templateTitle:  'Cover Layout — Paperback with Flaps Template',
    },
    jacket: {
      label:       'Dust Jacket',
      slug:        'jacket',
      spineBaseline:  0.50,        // baseline mm added to spine calculation
      spineRoundMm:   true,        // round to nearest whole mm (stricter precision than paperback)
      minBulk:        { conventional: { flatback: 4, round: 8 }, digital: { flatback: 10, round: 10 } },
                                   // cased minimum text-block bulk (mm) by printing method × back style
      maxBulkMm:      60,          // maximum text-block bulk (mm)
      boardOverhang:  3,           // front/back panel = trim width + this (e.g. 153 + 3 = 156)
      safeZone:       3,           // no type/border within this many mm of the edges
      turnIn:         10,          // fixed turn-in depth (mm) on both front and back flaps
      flapMin:        70,          // alert if user enters flap width < this value (mm)
      flapMax:        100,         // alert if user enters flap width > this value (mm)
      heightAdd:      6,           // mm added to document height for board overhang (docH = pH + 6)
      bleedNote:      'Add 3mm bleed allowance to the document',
      pdfNote:        'PDF page = trim size incl. flaps & turn-ins. Fold guides included.',
      templateTitle:  'Cover Layout — Dust Jacket Template',
    },
    ppc: {
      label:       'CFC - Printed Paper Case',
      slug:        'cfc',
      spineBaseline:  0.50,        // baseline mm added to spine calculation
      spineRoundMm:   true,        // round to nearest whole mm
      minBulk:        { conventional: { flatback: 4, round: 8 }, digital: { flatback: 10, round: 10 } },
                                   // cased minimum text-block bulk (mm) by printing method × back style
      maxBulkMm:      60,          // maximum text-block bulk (mm)
      wrap:           18,          // default turn-in (mm), all four sides (docH = pH + 18 + 18 + 6)
      boardInset:     4,           // front/back board = trim width − this (e.g. 153 − 4 = 149)
      safeEdge:       4,           // no text/image within this many mm of the case edge
      safeSpine:      2,           // no text/image within this many mm of the spine edges
      safeGutter:     4,           // front/back: no text/image within this many mm of the gutter
      heightAdd:      42,          // total mm added to height at default wrap (18 top + 18 bottom + 6 overhang)
      bleedNote:      'No additional bleed required — turn-in acts as bleed',
      pdfNote:        'PDF page = full document size incl. 18mm turn-ins.',
      templateTitle:  'Cover Layout — CFC Template',
      // CFC subtypes: gutter (joint between board and spine) depends on the
      // back style AND the board caliper. Keys are boardThicknesses values
      // (both boards combined): 4 = 2mm / 2000mic boards, 6 = 3mm / 3000mic.
      // To add a subtype: { label: 'Display Name', gutter: { 4: mm, 6: mm } }
      subtypes: {
        round:      { label: 'Round Back', gutter: { 4: 8,  6: 9  } },
        flatback:   { label: 'Flat Back',  gutter: { 4: 10, 6: 11 } },
      },
    },
  },

  // ── Printing methods (cased: jacket & CFC) ────────────────────
  // Keys index coverTypes.jacket/ppc.minBulk. Order = dropdown order.
  printMethods: {
    conventional: 'Conventional',
    digital:      'Digital',
  },

  // ── Board thickness options (PPC & Jacket) ────────────────────
  // value = total board contribution to spine (both boards combined, mm)
  boardThicknesses: [
    { label: 'Choose board size', value: 0   },
    { label: '2mm boards',        value: 4   },
    { label: '3mm boards',        value: 6 }
  ],

  // ── Binding adders ─────────────────────────────────────────────
  bindingAdders: {
    '0': 0,   // Perfect Bound
    '2': 2,   // Sewn
  },

  // ── Alert messages ─────────────────────────────────────────────
  // Alerts fire when users enter values that exceed production constraints.
  // Modify messages here to match your brand voice and contact procedures.
  // Alert triggers are defined in coverTypes above:
  //   - bulkMin/bulkMax: triggered when text-block bulk (pages × gsm × vol / 20000)
  //     is outside minBulkMm/maxBulkMm (cased: minBulk[printMethod][backStyle]).
  //     {min}/{max}/{bulk}/{type} are filled in.
  //   - flapMin/flapMax: triggered by flap width bounds (paperback with flaps)
  //   - jktFlapMin/jktFlapMax: triggered by jacket flap bounds (jacket only)
  //   - boardReq: triggered when board thickness not selected (jacket/PPC)
  alerts: {
    bulkMax:    '⚠ Book bulk is {bulk}mm — the maximum is {max}mm. Contact your Printer or consider a lower grammage or lower volume paper.',
    bulkMin:    '⚠ Book bulk is {bulk}mm — the minimum for {type} books is {min}mm. Contact your Printer or consider a higher volume paper or more pages.',
    flapMin:    '⚠ Flap width is below the minimum.',
    flapMax:    '⚠ Flap width exceeds maximum (page width − 10mm).',
    jktFlapMin: '⚠ Flap width is below the 70mm minimum.',
    jktFlapMax: '⚠ Flap width exceeds the 100mm maximum.',
    boardReq:   '⚠ Please select a board thickness.',
    requiredFields: '⚠ Please complete all required fields.',
  },

  // ── PDF drawing constants ──────────────────────────────────────
  // PDF template style — after Clays' reference guides (pdfTemplates.js)
  pdf: {
    ink:        [35, 31, 32],     // #231f20 — guides, arrows, notes
    slate:      [145, 155, 176],  // #919bb0 — spine fill, board outlines, panel titles
    white:      [255, 255, 255],  // spine lettering guides and SPINE title
    flapTint:   [238, 240, 244],  // light slate — flap areas
    lineW:      0.3,              // mm — solid / dashed guides
    dotW:       0.35,             // mm — dotted guide dot size
    dotGap:     0.7,              // mm — dotted guide spacing
    arrowW:     0.35,             // mm — dimension arrow line
    headL:      2.2,              // mm — arrowhead length
    headW:      1.6,              // mm — arrowhead width
    noteSize:   8,                // pt — notes (Helvetica)
    specSize:   7,                // pt — job spec lines
    titleSize:  34,               // pt — BACK / FRONT / SPINE (max; shrinks to fit)
    titleTrack: 0.12,             // letter spacing, as a fraction of title size
  },
};
