---
date_created: 2026-10-28
date_modified: 2026-10-28
site_uuid: f2da2319-d428-4f00-a27e-aed514ddb296
hex_code: yx885i
publish: true
title: "Dididecks Player: the viewer half of DidiDecks as a standalone package"
lede: "Every Lossless site that shows a deck rebuilt its own viewer. This package is the one copy: static Astro components that play, scroll and print 16:9 decks, with the authoring tools left behind in the shell."
slug: dididecks-player-package
at_semantic_version: 0.1.0
status: In-Progress
authors:
  - Michael Staton
augmented_with: "Claude Code on Claude Opus 5.5 (1M context)"
tags:
  - Dididecks
  - Slide-Decks
  - Astro-Components
  - Package-Extraction
  - JSR
date_authored_initial_draft: 2026-10-28
date_authored_current_draft: 2026-10-28
---

# Dididecks Player

## Why Care?

Decks show up across the Lossless tree: dididecks client-sites, mpstaton-site,
hypernova, twf_site, fullstack-vc, lossless-slides-site, and now humain-web's
gated investor decks. Each grew its own viewer. Reveal.js was dropped because
its globals collided with ordinary web development. The DidiDecks shell had the
best play and print pieces, but bundled them with dev-only authoring tools
(the slide rater writes JSON to disk), so nothing outside a dididecks
client-site could use them. Copies drifted: by October 2026 there were nine
`PageAsDeckWrapper`s and four `SlideCanvas`es, and the newest fixes lived in
whichever site needed them last.

## What this package is

The **viewer**: everything needed to show a deck.

| In | Out (stays in `@dididecks/shell`) |
|---|---|
| `SlideCanvas`, `ContentFit` | `SlideRankPill`, `/api/slide-rank`, `/api/slide-decompose` |
| `DeckPlayer`, `PlayerSlide`, `PrintDeck` | `DeckMatrix`, `DeckStatsPanel`, review ToC |
| `DeckChrome`, `SlidePaginator`, `PageAsDeckWrapper` | `DeckFrame--Play-UI`, `DeckOverlay--Play-UI` (they call the rater) |
| `ModeToggle`, `runtime/mode-switcher.ts`, chrome tokens | registry loader, slot scanner, injected `/play` and `/toc` routes |

The shell depends on this package and keeps one-line re-exports at its old
component paths, so client-sites change nothing.

## Constraints

1. **Static slides.** No script inside a slide. Player scripts handle
   navigation only, so a slide renders the same in the player, in print and
   in a PDF.
2. **Pure-CSS scaling.** `SlideCanvas` scales a 1920×1080 stage with container
   queries; it works without JS and in print.
3. **No Tailwind, no framework.** Plain Astro with scoped CSS. A slide can use
   Tailwind; the player does not require it.
4. **Themed by tokens.** Components read only `--ddd-chrome-*`, which fall back
   to the site's `--color-*` and `--font-*` tokens.
5. **No filesystem, no registry, no network.** Anything that writes, reads a
   deck registry or calls an API belongs in the shell.
6. **Browser shortcuts win.** Cmd/Ctrl/Alt chords pass through; keys are
   ignored while typing.

## Contracts

- `deck:section-changed` `{ index, total, isFirst, isLast }` on `window`,
  emitted by the play and scroll decks.
- `deck:section-goto` `{ index }`, `deck:section-prev`, `deck:section-next`
  move them.
- `#N` in the URL opens slide N (1-based) and follows navigation.
- Print: one slide per landscape page, no chrome.

## Provenance (audit, 2026-10-28)

Every copy across `dididecks-ai/client-sites` and `astro-knots/sites` was
compared. Bases taken:

- **SlideCanvas:** the shell's pure-CSS version, with centring added and
  calmstorm-decks' wash layer ported. Calmstorm's JS scaler was not taken.
- **ContentFit:** calmstorm-decks, as is.
- **DeckChrome:** the shell's. Fixed: it listened for `ddd:section-changed`,
  which nothing sent. Added the modifier-key pass-through.
- **SlidePaginator, PageAsDeckWrapper, ModeToggle, mode-switcher:** the shell's.
- **DeckPlayer, PlayerSlide, PrintDeck:** new. PrintDeck is the shell's print
  route's layout without its registry.

## Roadmap

- **0.2:** replace `PageAsDeckWrapper` with lossless-slides-site's `PageDeck`
  (visible-pixel tracking, tall slides scroll before advancing, hash follows
  the slide, reduced motion, teardown across view transitions), re-tokenised
  to `--ddd-*`; add fullstack-vc's jump panel (J) to the scroll deck.
- **0.2:** one chrome-hidden attribute, `html[data-chrome="off"]`, replacing
  `data-chrome-hidden`, `body[data-chrome]` and `html[data-chrome]`.
- **0.2:** `mode-switcher.ts` honours a server-painted `data-mode`, guards
  storage access, and exports an inline first-paint snippet (no flash).
- **Adoption:** humain-web, mpstaton-site, hypernova, twf_site, fullstack-vc
  and lossless-slides-site move from their own copies to the package.

## Publishing

JSR, like `@lossless-group/lfm`, if it serves `.astro` files to npm-style
installs (`npm:@jsr/lossless-group__dididecks-player`); otherwise npm. To be
settled by a `jsr publish --dry-run` and a test install in a consumer.

## Related

- [[Extract-Didideck-Player-Package-and-Ship-Humain-Decks-Page]] in
  `dididecks-ai/context-v/plans/`: the plan of record for the extraction.
- `@dididecks/shell` in `dididecks-ai/apps/deck-shell/`: the authoring side.
