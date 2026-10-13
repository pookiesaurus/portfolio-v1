# Portfolio Site Performance Review

Oct 13, 2026

## Summary

The site is slow mainly because its images are far too large: the Home page downloads about 28 MB of images and About about 36 MB, where 2–4 MB would be normal. Scrolling also janks because a fixed full-screen background sits under 24 blurred glass panels, which forces a full repaint on every scroll frame.

The three fixes with the biggest payoff:

1. Resize and convert images to WebP or AVIF at display size, and lazy-load anything below the fold.
2. Stop the background from repainting on scroll (drop `background-attachment: fixed`, and stop resetting the background variable on every scroll event on mobile).
3. Stop the music player from downloading a 3–6 MB song on every page load before anyone presses play.

These figures come from reading the code and file sizes, not from a browser trace. Measuring in Lighthouse before and after is the last step below.

## Findings

The first three findings are about load time and cause most of the lag. The rest add jank while scrolling or interacting.

| # | Concern | Evidence | Why it lags |
| --- | --- | --- | --- |
| 1 | Huge, unoptimised images | `images/` is 164 MB. On Home, `img4.jpg` is 9.8 MB at 3072×4096 px for a \~210 px photo card; `img2`, `img6`, `img8` are 2–2.5 MB each. About loads 25 PNG photos of about 1 MB each. Project thumbnails are 0.5–1.6 MB PNGs. | Pages weigh about 28 MB (Home), 36 MB (About), 8 MB (Projects) and 3 MB (Writing, Contact). On mobile data that is tens of seconds, and decoding big images blocks the main thread. |
| 2 | Nothing is lazy-loaded | No `<img>` on any page has `loading="lazy"`, and none have `width`/`height`. | Every image downloads up front, even far below the fold. Missing sizes cause layout shift as images arrive. |
| 3 | Oversized background images | `backgroundtest3.jpeg` is 3.9 MB at 4432×2508 px and loads on every page (`styles.css` line 68). On mobile, `script.js` line 452 swaps in `background-mobile-bottom.png`, a 7.5 MB PNG, when you reach the bottom. `footer2.png` is 2880 px wide. | Every page pays about 4 MB before any content. On phones, a 7.5 MB download starts mid-scroll. |
| 4 | Fixed background under many blurs | `background-attachment: fixed` on the body (`styles.css` line 72), plus 24 `backdrop-filter: blur(...)` rules in `styles.css` and 3 in `project-window.css`. | A fixed background can't be scrolled cheaply by the GPU, so the browser repaints the viewport every frame. Each blurred panel then re-blurs what is behind it. This is the main cause of scroll jank. Safari on iOS ignores fixed backgrounds anyway. |
| 5 | Background variable reset on every scroll (mobile) | `checkNearBottom` in `script.js` (lines 443–458) calls `setProperty('--background-img', ...)` on every scroll event, even when the value hasn't changed. | Changing a root custom property makes the browser recheck styles for the whole page, many times per second while scrolling. |
| 6 | Music player preloads audio | `script.js` sets `audio.src` on load (`loadTrack` / `restoreState`) with no `preload` setting. Tracks are 3.3–5.8 MB each. | Browsers may start downloading the song on every page view, competing with images for bandwidth. |
| 7 | `will-change` on many elements | `.t-resize` sets `will-change: width, height` (`styles.css` lines 1425 and 1574) and is used 8–14 times per page. | `will-change` keeps a GPU layer per element and uses memory. Width/height can't be GPU-accelerated anyway, so it costs memory and gains nothing. |
| 8 | Large images inside project windows | Project windows load full-size files, e.g. `unimelb-library/img1.png` (11 MB), `img3.png` (7.8 MB), `starchitect/showcase-table.jpeg` (7.7 MB), `creative-futures/cd1.png` (3.7 MB). | Opening a project stalls while these download and decode. Dragging a window over a blurred backdrop while it decodes feels sticky. |
| 9 | Small JS issues | `project-window.js` adds a `DOMNodeRemoved` listener per window (line 873). Mutation events are deprecated and can slow every DOM change. Each window's Escape key handler is never removed on close. The clock re-renders every second. | Minor on their own, but they build up the longer a visitor opens and closes windows. |
| 10 | Unused files | `backgroundtest.png` (14 MB), `backgroundtest1.png` (14 MB) and `backgroundtest2.jpg` (2.3 MB) are referenced nowhere. The rulebook PDF is 26 MB. | These don't slow page loads, but they bloat the repo and deploys. The PDF is slow for anyone who clicks it. |

## Proposed solutions

Most fixes are small edits to existing files. The image work is the biggest job and has the biggest payoff.

| # | Fix | Effort | Expected impact |
| --- | --- | --- | --- |
| 1 | Resize every image to about 2× its largest display size (e.g. photo cards about 440 px wide, thumbnails about 1200 px, project images about 1600 px) and convert to WebP, or AVIF with a WebP fallback via `<picture>`. Use Squoosh, or a one-off script with `sharp` or `cwebp`. Keep PNG only for graphics with sharp edges and few colours. | Medium (one batch run) | Very high. Expect Home to drop from about 28 MB to under 2 MB, and About from about 36 MB to under 3 MB. |
| 2 | Add `loading="lazy"` and `decoding="async"` to every image below the fold, plus `width` and `height` attributes. Do the same for `<img>` tags generated in `project-window.js`. | Low | High. The first screen loads only what is visible, and layout stops shifting. |
| 3 | Re-export the background at about 2560 px wide as WebP or AVIF (aim for under 300 KB). Replace the 7.5 MB mobile PNG with a compressed version under 300 KB. Shrink `footer2.png` the same way. | Low | High. Saves about 4 MB on every page, and about 7 MB on mobile. |
| 4 | Remove `background-attachment: fixed`. Put the background on a `position: fixed` pseudo-element instead, which the mobile rule already does. That layer composites on the GPU and doesn't repaint on scroll. Also reduce blur radius or the number of blurred panels on mobile. | Low | High. This is the main fix for scroll jank. |
| 5 | In `checkNearBottom`, remember the current background and only call `setProperty` when it actually changes. Throttle with `requestAnimationFrame` the same way `updateBackground` already does. | Low | Medium. No more page-wide style recalcs while scrolling on phones. |
| 6 | Set `audio.preload = "none"` and only assign `audio.src` when the visitor presses play. Keep showing the title and cover until then. Also re-encode tracks at 128 kbps (about 3 MB each). | Low | Medium. Saves 3–6 MB per page view for visitors who never press play. |
| 7 | Delete `will-change: width, height` from both `.t-resize` rules. | Trivial | Low to medium. Less GPU memory, especially on phones. |
| 8 | Optimise project-window images the same way as fix 1. Optionally show a small blurred preview until the full image has loaded. | Medium | High for anyone opening projects. Windows open instantly instead of stalling on 8–11 MB files. |
| 9 | Remove the no-op `DOMNodeRemoved` listener. Remove `win._escHandler` in `closeWindow`. Optionally pause the clock while the tab is hidden (`visibilitychange`). | Trivial | Low. Small cleanup with no visible change. |
| 10 | Delete the unused `backgroundtest*` files and `.DS_Store`. Compress the rulebook PDF (e.g. with Ghostscript `-dPDFSETTINGS=/ebook`), or link a compressed copy. | Trivial | Low for the site; a smaller repo and faster deploys. |

## Order of work and how to check it

Do the quick code fixes first, then the image pass, measuring before and after.

1. Record a baseline: run Lighthouse (Chrome DevTools, Mobile preset) on Home, Projects and About. Note total page weight, Largest Contentful Paint and Total Blocking Time.
2. Quick code fixes, about an hour: 4 (fixed background), 5 (scroll handler), 6 (audio preload), 7 (`will-change`) and 9 (JS cleanup).
3. Image pass: fixes 1, 3 and 8, then fix 2 (lazy-loading and sizes) while editing the `<img>` tags.
4. Clean-up: fix 10.
5. Re-run Lighthouse on the same pages. In the DevTools Performance panel, record a scroll on Home and check that frames stay under 16 ms with no long green paint bars.

- [ ] Baseline Lighthouse scores recorded
- [ ] Quick code fixes done
- [ ] Images optimised and lazy-loaded
- [ ] Unused files removed
- [ ] After scores recorded and compared
