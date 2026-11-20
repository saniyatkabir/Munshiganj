# Munshiganj · Echoes of Bikrampur

An independent guide to the six upazilas of Munshiganj by Saniyat Kabir Ishan. The site uses static HTML, CSS and JavaScript, with local photo and font assets and a vendored copy of Leaflet 1.9.4.

## Run locally

From the project root, run `python3 -m http.server 8000 --directory dist` and open <http://localhost:8000/>. The guide runs over HTTP without a package install or build. The interactive map uses OpenStreetMap tiles over the internet.

## Deploy to Cloudflare

**Pages with GitHub.** Commit this directory to a new GitHub repository. In Cloudflare, create a Pages project, connect the repository and choose the production branch. Select the **None** preset, use `exit 0` as the build command and set the build output directory to `dist`. Deploy. [Cloudflare Pages setup](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/)

**Workers.** The included `wrangler.jsonc` points Workers at `dist`. To deploy to your Cloudflare account, authenticate Wrangler and run `npx wrangler deploy` from the project root. [Workers static assets](https://developers.cloudflare.com/workers/static-assets/)

For a new public address, change the absolute metadata in `dist/index.html` and `publicOrigin` in `dist/place-guide.js`, then regenerate the landmark pages and sitemap.

## Edit the guide

- `dist/data.js` contains the place directory, historical periods, river stories, culture, facts, itineraries, photo credits and source links. Add a coordinate source to any place with a map pin.
- Run `node scripts/build-places.mjs` after editing place records or visiting information. It regenerates the static pages and public sitemap in `dist/`. Commit the regenerated files.
- `dist/index.html` controls the page sections, metadata and navigation.
- `dist/style.css` handles layout, typography and responsive variants.
- `dist/app.js` handles tabs, search, filters, map markers and galleries.
- `dist/assets/` holds the licensed images and third-party dependencies. Photo credits and licenses appear on the site under Sources and photo credits.
