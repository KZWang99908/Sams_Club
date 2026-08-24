# Sam's Club — Student Learning Hub

Simple static site with subject dropdowns and YouTube embed support.

How to use
- Open `index.html` in a browser (or use VS Code Live Server).
- Click a subject, then an area to load an embedded video.
- Use the **Add Resource** button to paste a YouTube URL; enter the matching `data-area` id to attach it to an existing area button, or create a new button in `index.html` with the same `data-area`.
- Notes entered in the Notes box are saved to `localStorage`.

Files
- [index.html](index.html) — main page
- [styles.css](styles.css) — styling
- [script.js](script.js) — interaction logic

Customization
- Update colors in `styles.css` (CSS variables `--bvw-blue` and `--bvw-gold`).
 - Update colors in `styles.css` (CSS variables `--primary-red`, `--white`, `--black`, `--silver`).
 - The header now includes rotating slogans and a liquid glass visual; adjust slogans in `script.js`.

Admin panel
- Click the `Admin` button in the header to open a whitelist-protected admin modal.
- This demo uses client-side sample accounts (`alice` / `alpha123`, `bob` / `bravo456`).
- Use the panel to add lessons; lessons persist in `localStorage` and appear in the Lessons list.
 - This demo uses client-side sample accounts (`alice` / `alpha123`, `bob` / `bravo456`, `KevinW` / `Kw@10125686`).
 - Use the panel to add lessons; lessons persist in `localStorage` and appear in the Lessons list.
