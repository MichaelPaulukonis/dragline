# dragline · a draggable text landscape

[![Project Status](https://img.shields.io/badge/status-in_development-orange.svg)](#project-status) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE) [![Version](https://img.shields.io/badge/version-0.1.0-6f42c1.svg)](package.json) [![Built with Vite](https://img.shields.io/badge/built_with-Vite-646cff.svg)](https://vitejs.dev/)

Dragline is an interactive poem-machine that scatters monospaced text blocks across a canvas and invites you to rearrange them into new constellations. Every composition is a miniature collaboration between generative code, Tumblr-fueled corpora, and your hands on the mouse.

> “It’s not so much a tool as it is a text of its own.” — the project’s guiding principle

**Live build:** <https://michaelpaulukonis.github.io/dragline>  ·  **Repository snapshot:** [`docs/reference/dragline-repository-snapshot.md`](docs/reference/dragline-repository-snapshot.md)

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Usage](#usage)
3. [Features & Capabilities](#features--capabilities)
4. [Development Setup](#development-setup)
5. [Contributing](#contributing)
6. [Project Structure](#project-structure)
7. [Troubleshooting & FAQ](#troubleshooting--faq)
8. [Additional Info](#additional-info)
9. [Credits & Resources](#credits--resources)

---

## Getting Started

### Prerequisites

- Node.js ≥ 18 (Vite 6 requires a modern runtime)
- npm ≥ 9 (bundled with recent Node releases)
- Optional: Tumblr API key if you want to swap in your own text source

### Installation

```bash
git clone https://github.com/MichaelPaulukonis/dragline.git
cd dragline
npm install
```

### Quick Start

```bash
npm run dev
```

Visit the printed URL (typically <http://localhost:5173>) and start rearranging blocks.

### Common Setup Hiccups

| Issue | Why it happens | Fix |
| --- | --- | --- |
| `npm run dev` complains about Node version | Node < 18 | Upgrade Node (e.g., via nvm: `nvm install 20 && nvm use 20`). |
| Tumblr requests fail with 429/401 | Tumblr rate limits or key revoked | Dragline falls back to bundled JSON blocks; add your own API key in `src/tumblr-random.js` if needed. |
| Canvas looks empty | Fallback data not loaded yet | Wait a moment or press **`n`** to fetch a new batch. |

---

## Usage

### Core Interaction

| Action | Gesture |
| --- | --- |
| Move a block | Click + drag |
| Add a block | Right arrow |
| Remove the most recent block | Left arrow |
| Delete selected block | Delete/Backspace |
| Raise/lower z-index | Shift + Up / Shift + Down |
| Cycle focus between blocks | Shift + Left / Shift + Right |
| Cycle fill characters | Space |
| Reset layout | `r` |
| Fetch fresh Tumblr corpus | `n` |
| Toggle info box | `i` or Escape |
| Enter selection mode | Option/Alt + Shift + `S` |
| Save crop while in selection mode | Shift + `S` or Enter |
| Save full monochrome canvas | Shift + `S` (when selection mode is inactive) |

### Advanced Play

- Edit the fill character palette in `src/dragline.js` (`fillChars`) for noisier or calmer compositions.
- Swap in your own fallback corpus by replacing `src/grids.*.json` with exported grids from previous sessions.
- Tweak clustering distance inside `src/blocks.js` to tighten or loosen the initial scatter.

### Configuration & Environment

The default Tumblr credentials in `src/tumblr-random.js` are public. To use your own key:

```js
const settings = {
  blogName: 'your-blog.tumblr.com',
  appKey: import.meta.env.VITE_TUMBLR_KEY,
  debug: false
}
```

Add the key to a `.env` file and expose it via `VITE_TUMBLR_KEY`. Remember that Vite embeds variables starting with `VITE_` at build time.

### Tumblr API Overview

Dragline pulls posts using `GET https://api.tumblr.com/v2/blog/{blogName}/posts?api_key=...`. Responses are parsed with the browser’s `DOMParser` to strip HTML tags. When Tumblr is unreachable, the project falls back to locally stored grids so you can continue composing offline.

---

## Features & Capabilities

### What’s delightful right now

- 🎲 **Generative scatter** – Every load throws text fragments into a unique constellation.
- � **Grid-snapped crops** – Define a reusable selection rectangle and export consistent captures.
- �🖱️ **Direct manipulation** – Drag blocks, layer them, and watch characters compete for canvas space.
- 🎚️ **On-the-fly remixing** – Cycle fill characters, reset layouts, or grab a high-contrast PNG snapshot.
- 🔄 **Live corpora** – Pull fresh text from Tumblr or lean on bundled archives when offline.

### Why Dragline is different

Unlike traditional text editors or poetry bots, Dragline treats text as spatial material. It rewards playful rearrangement and gives immediate visual feedback through z-index layering and grid-based rendering.

### Roadmap

Improvement ideas live as individual notes under [`docs/01_backlog/`](docs/01_backlog/). Highlights include richer export tools, selective block editing, animated drift, smarter clustering, and an inventory-style block browser.

---

## Development Setup

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Produce production bundle in `dist/` |
| `npm run preview` | Preview the build locally |
| `npm run deploy` | Publish to GitHub Pages via `gh-pages` |
| `npm test` | Run Jest suite (currently covers grid builder) |

### Workflow Notes

- Vite hot-module reload keeps the canvas responsive—no manual refresh needed.
- Jest targets logic-only modules. When you extract new utilities from p5 flows, add tests under `tests/`.
- For styling tweaks, edit `css/style.css` and `css/infobox.css`; no frameworks are involved.

### Debugging Tips

- Enable `debug: true` in `src/tumblr-random.js` to log API responses.
- Use the browser console to inspect `textAreas` and experiment with manual block mutations.
- Set breakpoints inside `populateCharGrid` to understand layering behaviour.

---

## Contributing

Dragline is an open sketch—new ideas are always welcome.

1. Fork the repository and create a feature branch (`git checkout -b feature/your-idea`).
2. Keep changes aligned with the [coding guidelines](.github/copilot-instructions.md).
3. Run `npm test` (and add new tests if you touch logic-heavy modules).
4. Open a pull request describing the creative intent and any visual quirks to watch for.

If you spot a bug or have a feature idea, open an issue or drop a note in the backlog by adding a markdown file under `docs/01_backlog/`.

---

## Project Structure

```
src/
├─ dragline.js         # p5 orchestration: fetch, input, rendering
├─ blocks.js           # Block creation, positioning, z-indexing
├─ grid.js             # Character grid creation and rendering helpers
├─ selection.js        # Grid-snapped selection state + overlay rendering
├─ tumblr-random.js    # Tumblr API integration + fallback logic
└─ text-grid/          # Tokenize → gridify → split corpus
css/
├─ style.css           # Base canvas and page styling
└─ infobox.css         # Floating instructions panel
docs/
├─ 01_backlog/         # Potential future enhancements
├─ reference/          # Architecture notes and repository snapshots
└─ ...                 # Stage-gate planning scaffolding
tests/
└─ buildGrid.test.js   # Jest coverage for grid construction
```

For a deeper architectural overview, read [`docs/reference/dragline-repository-snapshot.md`](docs/reference/dragline-repository-snapshot.md).

---

## Troubleshooting & FAQ

**Q: The canvas is blank—did something break?**  
A: Probably not. Press `n` to fetch a new set of blocks or check the console for Tumblr rate-limit messages.

**Q: Can I use my own text source?**  
A: Absolutely. Point `blogName` in `src/tumblr-random.js` to another Tumblr blog or swap the fetch entirely for local files.

**Q: How do I capture a composition without the pink gradient?**  
A: Press Shift + `S` for a full-canvas monochrome PNG. Need a specific crop? Press Option/Alt + Shift + `S` to enter selection mode, adjust the grid-snapped bounds, then confirm with Shift + `S` or Enter to export just that region.

**Q: Where can I ask questions?**  
A: Open a GitHub issue.

---

## Additional Info

- **License:** [MIT](LICENSE)
- **Changelog:** Coming soon—follow updates via repository commits and reference snapshots.
- **Project Status:** In development; expect playful instability.

---

## Credits & Resources

- Built with [p5.js](https://p5js.org/) and [Vite](https://vitejs.dev/).
- Tumblr corpus courtesy of <https://poeticalbot.tumblr.com> (and whatever blog you plug in).
- Inspiration and ongoing architectural notes live inside [`docs/reference/`](docs/reference/).

Happy dragging! 🐛
