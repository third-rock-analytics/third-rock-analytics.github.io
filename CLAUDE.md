# third-rock-analytics.github.io

Static site for Third Rock Analytics. Hosted on GitHub Pages with Jekyll enabled.

## Stack
- Plain HTML + CSS — no framework, no build step, no CMS
- Custom design tokens in `colors_and_type.css`; layout in `site.css`; page-level additions in `additions.css`
- Fonts: Bricolage Grotesque (display), DM Sans (body), Newsreader (serif), JetBrains Mono (mono)

## URL convention
All pages use folder/index.html for clean URLs — never `page.html` at the top level.

| File | URL |
|------|-----|
| `index.html` | `/` |
| `map/index.html` | `/map/` |
| `blog/index.html` | `/blog/` |
| `blog/YYYY-MM-slug/index.html` | `/blog/YYYY-MM-slug/` |

## Blog posts
- File path: `blog/YYYY-MM-slug/index.html`
- Copy from `blog/post-template/index.html` (excluded from published site via `_config.yml`)
- Add the post as a `.post-card` in `blog/index.html` and update the filter buttons if new tags are introduced
- Also update the blog teaser card in the root `index.html` (`.more-card--blog` section)
- Tags in use: `Practice`, `Tooling` — add new tags to the filter bar in `blog/index.html` when introduced

## Jekyll config
`_config.yml` excludes `blog/post-template/` from the published build. Add other draft/template paths there as needed.

## Absolute paths
All asset and CSS hrefs use absolute paths from root (e.g. `/assets/logos/...`, `/colors_and_type.css`) so they work regardless of folder depth.
