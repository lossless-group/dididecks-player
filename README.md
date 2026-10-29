# @lossless-group/dididecks-player

The viewer half of [DidiDecks](https://github.com/lossless-group/dididecks-ai):
everything needed to **show** a deck, nothing needed to author one.

Static Astro components with scoped CSS, themed by `--ddd-chrome-*` tokens.
No Tailwind, no filesystem access, no registry, no Reveal.js. Slides are
plain HTML/CSS at a 1920×1080 design size; the player scales them to any
screen in pure CSS and prints them one per page.

## What's in it

| Component | What it does |
|---|---|
| `DeckPlayer` + `PlayerSlide` | Single-page play deck: one 16:9 slide at a time; ← → / Space / PageUp PageDown / Home End; swipe; **T** or **J** for a contents list that skips to any slide; **F** fullscreen; `#N` links to a slide; ⌘P prints every slide, one per page |
| `SlideCanvas` | Scales a 1920×1080 stage to any container with container queries (no JS), centred and letterboxed. Optional wash layer via `--slide-backdrop-*` |
| `ContentFit` | Opt-in island that scales overflowing content down to fit its box |
| `PageAsDeckWrapper` + `SlidePaginator` | Scroll deck: scroll-snap sections, keyboard and double-click navigation, an `NN / total` indicator with type-to-jump |
| `DeckChrome` | Floating navigation capsule for multi-page play routes |
| `ModeToggle` + `runtime/mode-switcher.ts` | light / dark / vibrant on `html[data-mode]` |
| `PrintDeck` | Print layout: each child is one landscape page |

## Use

```astro
---
import DeckPlayer from "@lossless-group/dididecks-player/components/DeckPlayer.astro";
import PlayerSlide from "@lossless-group/dididecks-player/components/PlayerSlide.astro";
import Cover from "../slides/Cover.astro";
---
<DeckPlayer title="Firm deck" pdfHref="/firm-deck.pdf" backHref="/decks/">
  <PlayerSlide title="Cover"><Cover /></PlayerSlide>
  <PlayerSlide title="Portfolio" image="/slides/11.jpg" />
</DeckPlayer>
```

A `PlayerSlide` takes either inline content (an Astro component authored at
1920×1080) or an `image` (a rendered snapshot of a slide). Both scale the
same way.

## Contracts

- **Events.** Play and scroll decks emit `deck:section-changed`
  `{ index, total, isFirst, isLast }` on `window`, and respond to
  `deck:section-goto` `{ index }`, `deck:section-prev` and
  `deck:section-next`.
- **Theming.** Components read only `--ddd-chrome-*` tokens
  (`styles/chrome-tokens.css`), which fall back to a site's own
  `--color-*` and `--font-*` tokens. Override them at any wrapping element.
- **Keyboard.** Cmd, Ctrl and Alt chords always pass through to the browser.
  Keys are ignored while typing in an input.
- **Slides stay static.** No script runs inside a slide; the player's own
  script handles navigation.

## What isn't here

The authoring side of DidiDecks stays in `@dididecks/shell` in
[dididecks-ai](https://github.com/lossless-group/dididecks-ai): the slide
rater and triage tools (they write to the filesystem and are dev-only), the
deck registry, and the injected `/play` and `/toc` routes. The shell depends
on this package and re-exports these components at their old paths.

## Docs

- Spec: [`context-v/specs/Init-Dididecks-Player-Package.md`](context-v/specs/Init-Dididecks-Player-Package.md)
- Changelog: [`changelog/`](changelog/)

## License

MIT
