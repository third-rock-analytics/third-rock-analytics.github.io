# third-rock-analytics.github.io

Static site for Third Rock Analytics. Hosted on GitHub Pages with Jekyll enabled.

## Stack
- Plain HTML + CSS — no framework, no build step, no CMS
- All styles in one file, `style.css` (tokens at the top). Only `map/index.html` keeps page-specific inline styles.
- Font: Inter only (400/500/600). Brand v3 — source files and brand guide live in `Internal/Branding/`.
- Colors: ink/text/muted/line neutrals + Earth blue (`--earth`) for every button and link. Gold, grey, and tan appear only in the logo, with one exception: the four "How it works" step markers use the orb colors in planet order (Sun, Mercury, Venus, Earth).
- Keep it plain: no monospace labels, decorative coordinates, gradients, or serif-italic accent words.
- Homepage order: Hero → Services → Work → About → FAQ → How it works (dark band) → Contact. "How it works" ends on step 1, which is the contact form right below it.
- Project writeups live at `work/<slug>/index.html` (same layout classes as blog posts). Drafts are excluded in `_config.yml` until approved; `[TK]` marks facts still needed from Jeff. `404.html` at the root is GitHub Pages' not-found page.
- Layout: each section is a `.band` (hairline on top) whose `.wrap` carries thin frame lines on both sides (≥760px), Stripe-style. Grids that should touch the frame (services, steps) use negative `margin-inline` of one gutter. Section headings get a small sentence-case `.section-label`.
- Every page shares the same nav and footer markup (copy from `index.html`). The primary action everywhere is "Book a free call" → `/#contact`.

## URL convention
All pages use folder/index.html for clean URLs — never `page.html` at the top level.

| File | URL |
|------|-----|
| `index.html` | `/` |
| `map/index.html` | `/map/` |
| `blog/index.html` | `/blog/` |
| `blog/YYYY-MM-slug/index.html` | `/blog/YYYY-MM-slug/` |

## Blog posts
**Currently hidden.** `_config.yml` excludes all of `blog/` and nothing links to it (nav, footer, homepage, sitemap). The files are kept for later. To bring field notes back: remove the `blog/` exclude, re-add "Field notes" to the nav on every page, and add the blog URLs to `sitemap.xml`.

- File path: `blog/YYYY-MM-slug/index.html`
- Copy from `blog/post-template/index.html` (excluded from published site via `_config.yml`)
- Add the post as a `.post-card` in `blog/index.html` and update the filter buttons if new tags are introduced
- Add the post to `sitemap.xml`
- Tags in use: `Practice`, `Tooling` — add new tags to the filter bar in `blog/index.html` when introduced

## Jekyll config
`_config.yml` excludes `blog/` (hidden for now, which also covers `blog/post-template/`). Add other draft/template paths there as needed.

## Absolute paths
All asset and CSS hrefs use absolute paths from root (e.g. `/assets/logos/logo.svg`, `/style.css`) so they work regardless of folder depth.

## Blog voice
- Never reference TRA transitioning from a side project, becoming full-time, or any framing around the practice "becoming the main thing." Treat TRA as an established practice with no origin narrative.
