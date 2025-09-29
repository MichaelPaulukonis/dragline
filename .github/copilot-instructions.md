# GitHub Copilot Instructions for dragline

## Project Context

`dragline` is a browser-based creative coding experiment that renders movable textual blocks on an HTML5 canvas using p5.js. The project is aimed at artists and poets exploring generative text landscapes.

## Technology Stack

When proposing code changes, stay aligned with the existing stack:

- **Build tooling:** Vite (`npm run dev`, `npm run build`, `npm run preview`).
- **Language:** Modern JavaScript (ES modules, ES2020+).
- **Rendering:** p5.js via `p5js-wrapper` inside a single-canvas sketch.
- **Data fetching:** `axios` requests to the Tumblr API with a JSON fallback import.
- **Styling:** Hand-authored CSS under `css/`.
- **Testing:** Jest with `babel-jest` (Node environment).
- **Deployment:** GitHub Pages through `npm run deploy` (`gh-pages`).

Avoid suggesting frameworks (e.g., React, Next.js) or tooling outside this stack unless the user explicitly requests them.

## Repository Structure Highlights

- `src/dragline.js`: Entry module; initializes p5, orchestrates fetching, input, and rendering.
- `src/text-grid/`: Corpus processing pipeline (`tokenizer.js`, `gridBuilder.js`, `splitter.js`, `utils/`).
- `src/blocks.js`: Block creation, clustering, and z-index logic.
- `src/grid.js`: Character grid helpers used for canvas rendering.
- `src/tumblr-random.js`: Tumblr API integration with DOMParser cleanup and fallback JSON.
- `css/`: Styling files (`style.css`, `infobox.css`).
- `tests/buildGrid.test.js`: Existing Jest coverage for the grid builder.
- `docs/reference/dragline-repository-snapshot.md`: Current high-level snapshot and roadmap notes.

Prototype or legacy experiments are stored in `aux/` and `text-grid-project/`; treat them as references unless asked otherwise.

## Coding Guidelines

- Use ES modules with relative imports that match the existing structure.
- Prefer small, reusable functions; consider extracting logic from `dragline.js` when it becomes too large.
- Preserve the generative/random behavior unless changes are explicitly requested. If you introduce deterministic options (e.g., for testing), gate them behind flags or helper functions.
- Be mindful of canvas performance: avoid unnecessary full-grid recomputation or repeated DOM lookups in tight loops.
- Use `const`/`let` (no `var`), template literals, and modern language features already supported by the toolchain.
- Handle asynchronous flows with `async`/`await` and wrap Tumblr fetches in `try/catch`, surfacing helpful user feedback on failure.
- Maintain the existing CSS strategy; do not introduce new styling frameworks without approval.

## Testing Expectations

- Extend the Jest suite when changing pure logic (e.g., grid building, block utilities). Mock external APIs such as Tumblr.
- For p5-heavy features, focus on unit-testing extracted helpers rather than the entire canvas runtime unless integration coverage is unavoidable.
- Run `npm test` after modifying or adding tests.

## Build & Deployment Notes

- Development server: `npm run dev` (Vite default port 5173).
- Production build: `npm run build` (outputs to `dist/`).
- Preview build: `npm run preview`.
- Deployment: `npm run deploy` publishes to GitHub Pages (site served from `/dragline/`).

## Documentation & Housekeeping

- Update `README.md` or relevant docs when introducing new features, keyboard shortcuts, or workflows.
- Use `docs/reference/dragline-repository-snapshot.md` as the canonical context for architecture and improvement ideas.
- Significant new features can be documented under `docs/reference/` following the existing style.
- Remove unused dependencies and justify any new packages.

## Security Considerations

- The Tumblr API key bundled with the client should be considered public. If you change authentication or key management, document the approach and ensure secrets remain protected.
- Provide graceful fallbacks when remote content cannot be retrieved so the app remains functional using local data.

## Future-Friendly Suggestions

- Favor refactors that pave the way for undo/redo, performance optimizations, or alternative data sources—these align with the improvement roadmap captured in the repository snapshot.
- When proposing infrastructure or CI changes, ensure they complement the existing npm scripts and GitHub Pages deployment workflow.
