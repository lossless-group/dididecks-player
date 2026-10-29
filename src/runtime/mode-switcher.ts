/**
 * Mode Switcher — three-mode contract: 'light' | 'dark' | 'vibrant'.
 *
 * Promoted from chroma-decks/src/utils/mode-switcher.js on 2026-06-06
 * (plan: dididecks-ai/context-v/plans/
 *         Lift-Chroma-Decks-Generic-Code-into-Shared-Shell.md, Phase 2).
 *
 * Differences from the chroma original:
 *   - Rewritten in TS to match shell convention.
 *   - localStorage key is per-client (`{client}:mode`) so multiple decks
 *     hosted on the same domain don't collide.
 *   - Default mode is configurable (chroma defaulted to 'light' as part
 *     of brand canon; future clients may want 'dark' or 'vibrant').
 *   - `prefers-color-scheme` handling is opt-in (default: off) since
 *     light-canon brands don't want a dark first-visit just because
 *     the OS is in dark mode.
 *
 * Usage (consumer-side, inside <script>):
 *
 *   import { createModeSwitcher } from "@lossless-group/dididecks-player/runtime/mode-switcher.ts";
 *
 *   const ms = createModeSwitcher({
 *     client: "humain-vc-decks",
 *     defaultMode: "light",
 *     respectSystemPreference: false,
 *   });
 *
 * Exposes a singleton on `window.modeSwitcher` so multiple toggle
 * components on the same page share state. Calling createModeSwitcher
 * twice with different configs throws (one app, one mode contract).
 */

export type Mode = "light" | "dark" | "vibrant";
export const VALID_MODES: readonly Mode[] = ["light", "dark", "vibrant"];

export interface ModeSwitcherOptions {
  /** Per-client namespace for the localStorage key. Required to avoid
   *  cross-deployment collisions if multiple decks live on the same domain. */
  client: string;
  /** Default mode when nothing is stored and no system preference is honored. */
  defaultMode?: Mode;
  /** When true, first-visit honors prefers-color-scheme: dark → "dark".
   *  Default false (brand canon usually wins over OS preference). */
  respectSystemPreference?: boolean;
}

export interface ModeSwitcher {
  getCurrentMode(): Mode;
  setMode(mode: Mode): Mode;
  toggleMode(): Mode;
}

declare global {
  interface Window {
    modeSwitcher?: ModeSwitcher;
  }
}

export function createModeSwitcher(opts: ModeSwitcherOptions): ModeSwitcher {
  const { client, defaultMode = "light", respectSystemPreference = false } = opts;
  const STORAGE_KEY = `${client}:mode`;

  // If a singleton was already installed by an earlier component on the
  // same page, return it. Multiple <ModeToggle /> instances should share.
  if (typeof window !== "undefined" && window.modeSwitcher) {
    return window.modeSwitcher;
  }

  function getStored(): Mode | null {
    if (typeof window === "undefined") return null;
    const v = window.localStorage.getItem(STORAGE_KEY);
    return VALID_MODES.includes(v as Mode) ? (v as Mode) : null;
  }

  function getSystem(): Mode {
    if (typeof window === "undefined") return defaultMode;
    if (
      respectSystemPreference &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return defaultMode;
  }

  function storeMode(mode: Mode): void {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, mode);
    }
  }

  function applyMode(mode: Mode, initialLoad = false): void {
    if (typeof document === "undefined") return;
    const next: Mode = VALID_MODES.includes(mode) ? mode : defaultMode;
    document.documentElement.setAttribute("data-mode", next);
    if (!initialLoad) {
      currentMode = next;
      storeMode(next);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("mode-change", { detail: { mode: next } }));
    }
  }

  let currentMode: Mode = getStored() ?? getSystem();
  applyMode(currentMode, true);

  if (typeof document !== "undefined") {
    requestAnimationFrame(() => {
      document.documentElement.classList.add("theme-transition");
    });
  }

  const api: ModeSwitcher = {
    getCurrentMode: () => currentMode,
    setMode(mode) {
      if (!VALID_MODES.includes(mode)) return currentMode;
      applyMode(mode);
      return mode;
    },
    toggleMode() {
      const idx = VALID_MODES.indexOf(currentMode);
      const next = VALID_MODES[(idx + 1) % VALID_MODES.length];
      applyMode(next);
      return next;
    },
  };

  if (typeof window !== "undefined") {
    window.modeSwitcher = api;
  }
  return api;
}
