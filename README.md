# Sam's Club — Student Learning Hub

Simple static site with subject dropdowns and YouTube embed support.

How to use
- Open `index.html` in a browser (or use VS Code Live Server).
- Click a subject, then an area to load an embedded video.
 - Add resources / lessons by editing the `MANUAL_LESSONS` array in `script.js` (see the README's Lessons section).
- Notes entered in the Notes box are saved to `localStorage`.

Files
- [index.html](index.html) — main page
- [styles.css](styles.css) — styling
- [script.js](script.js) — interaction logic

Customization
- Update colors in `styles.css` (CSS variables `--bvw-blue` and `--bvw-gold`).
 - Update colors in `styles.css` (CSS variables `--primary-red`, `--white`, `--black`, `--silver`).
 - The header now includes rotating slogans and a liquid glass visual; adjust slogans in `script.js`.

Lessons
- To add lessons manually, edit the `MANUAL_LESSONS` array in `script.js`.
- Each lesson should have: `title`, `area` (must match a `data-area`), `video` (embed URL), and optional `content`.
- On first load the site seeds `localStorage` from `MANUAL_LESSONS` if there are no existing lessons.
