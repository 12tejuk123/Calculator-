Beautiful Calculator — Frontend scaffold

What's included
- `index.html` — single-page responsive calculator UI
- `css/styles.css` — modern theme, variables, responsive grid, subtle shadows
- `js/script.js` — click + keyboard handling, safe evaluation, theme toggle
 - `js/script.js` — click + keyboard handling, safe evaluation, theme toggle, memory and history features

How to run
1. Open `index.html` in a browser (double-click, or File → Open in browser).
2. Use mouse or keyboard to calculate. Keyboard keys supported: digits, + - * / ( ) . Enter (=), Backspace, Escape, %

Notes & next steps
- Expression evaluation is validated with a conservative regex before using Function to evaluate. For advanced uses replace the evaluator with a proper expression parser.
- Consider adding unit tests, ARIA improvements, and more themes.

New features added in this update
- Memory: M+, M-, MR, MC (stored in a simple memory register; 'M' indicator appears when memory ≠ 0).
- History: open the history panel with the ≡ button, click a history item to recall the result.
- Button press animations and keyboard key highlighting.

Persistence & tests
- History is persisted to localStorage (key: `calc-history-v1`).
- You can export history from the History panel using the Export button.

Running tests (requires Node.js)
1. Install dev dependencies:

```powershell
npm install
```

2. Run unit tests (Jest):

```powershell
License
-------
Use freely for learning and modification.
Alternatives:
- Netlify: Connect the repo and set the publish directory to `/` (or a `dist/` folder if you add a build step).
- Vercel: Import the repository in Vercel and deploy the static site from the project root.

Netlify (one-click)
-------------------

You can deploy with Netlify using the included `netlify.toml`.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/12tejuk123/Calculator-Buddy)

When creating the site in Netlify via the link above, choose GitHub as the provider, select this repository and set the publish directory to `/` (root). Netlify will deploy the site automatically.

Optional improvements I can add:
- Run `npm test` in CI before deploying and cancel deployment on failing tests.
- Build step (e.g., produce a `dist/` folder) and publish only that directory.

License
-------
Use freely for learning and modification.