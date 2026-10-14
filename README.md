# RYU Films — complete local source project

This is the existing published website, version 5, exported for editing in VS Code. The frontend files and assets are preserved byte-for-byte. It is a static HTML/CSS/JavaScript project, not React: there are no missing JSX components, backend services, npm dependencies, or generated framework files.

## Quick start in VS Code

1. Extract this ZIP and open the **RYU-Films-Source** folder in VS Code (File → Open Folder).
2. Install Node.js 20 or newer with npm if it is not already installed.
3. Choose Terminal → New Terminal. Make sure the terminal is in this project folder.
4. Run:

```sh
npm install
npm run dev
```

Open **http://localhost:3000**. Edit the files in `dist/`, save, and refresh your browser to see changes. There is no automatic hot reload. Press Ctrl+C in the terminal to stop the server.

`npm install` has no third-party packages to download; all tooling uses Node's built-in modules. The package manifest and lockfile document this zero-dependency setup. `npm ci` is also supported.

If port 3000 is busy:

```sh
npm run dev -- --port 3001
```

Then open http://localhost:3001. The included VS Code tasks also expose Run locally and Build.

## Production build

```sh
npm run build
npm run preview
```

The build copies the complete editable site from `dist/` into `build/` without transforming the design or JavaScript. Preview serves `build/` at http://localhost:3000; stop the development server first, or use `npm run preview -- --port 3001`.

Upload the **contents of build/** to any static web host. No Node server, database, API key, environment variables, or runtime npm packages are needed on that host. `scripts/serve.mjs` is a local development/preview server only. Each build replaces `build/`; edit `dist/`, not `build/`.

The original Sites manifest is retained at `.openai/hosting.json`, including its project ID and original `dist` publishing directory. It is not required for ordinary static hosting. The hosted Sites access controls are platform settings, not part of this static frontend; configuring access control on another host is a separate step. Nothing in these scripts publishes to or changes the live site.

## Project map

| File/folder | Purpose |
| --- | --- |
| `dist/index.html` | Header, navigation, showcase, gallery, branding, booking form, project dialogs, metadata and embedded favicon |
| `dist/style.css` | All visual styling, responsive layouts, typography and reduced-motion styling |
| `dist/app.js` | Trailer/gallery rendering, preview dialogs, video controls and booking behavior |
| `dist/config.js` | Eight projects, poster paths, video paths and booking settings |
| `dist/assets/` | All original site images, logos, camera artwork and reference assets |
| `dist/RYU-Films-Starter.zip` | Original nested starter download, preserved as an existing site asset; use this outer project for current development |
| `scripts/serve.mjs` | Dependency-free local HTTP server, including video byte-range support |
| `scripts/build.mjs` | Static production copy step |
| `package.json`, `package-lock.json` | npm commands, Node requirement and dependency inventory |
| `.vscode/tasks.json` | Optional VS Code tasks |
| `.openai/hosting.json` | Original Sites hosting configuration |
| `docs/ORIGINAL-README.md` | Original project documentation |
| `design-references/` | Later mockup and transparent camera PNG; not connected to the running website |

## Existing design versus later image mockups

The working site has the top logo, eight previews on the left, cameraman artwork on the right, gallery, additional artwork and booking section. The later collage-background/glowing-projector designs in the conversation were generated image mockups only, not implemented frontend layouts. The latest corrected mockup and separate transparent camera PNG are included in `design-references/` for continued development. The export does not silently replace the working website with a flattened mockup image.

## Configure trailer videos

The current eight projects use JPEG still previews. Actual MP4/video exports were not supplied and therefore are not present in this package. All image assets referenced by the current source are included.

Copy your video files into `dist/assets/` and edit the matching entries in `dist/config.js`:

```js
video: 'assets/everything-trailer.mp4',
fullVideo: 'assets/everything-full.mp4'
```

Keep each project's existing poster and metadata. `fullVideo` is optional. The homepage loops muted trailers; clicking a card opens the full video when supplied, otherwise the short trailer or still. Reduced-motion preferences pause autoplay. Autoplay is subject to browser policies. Instagram page URLs are not MP4 sources and must not be pasted into these video fields.

The shared project list controls both homepage and gallery order: No Favors, Everything!, Shy Carter / Sachie Louie, Aerial Reel, Elevate Soho, I'm From New York, How Can I Lose, Bars 101. Existing labels were preserved; review credits before a new public launch.

## Configure booking

Edit `bookingUrl` or `bookingEmail` in `dist/config.js`. A booking URL takes priority. With an email address, the form opens the visitor's email app; it does not send email automatically. With both settings empty, the current form downloads a project brief for the visitor to share. There is no server-side form delivery or booking backend.

## Fonts and external resources

The original HTML requests **Great Vibes** from Google Fonts. That external font dependency is preserved to retain the existing design when online. Local cursive fallbacks are defined in CSS for offline use, so exact typography may differ without internet. All other site images and frontend code are local. No font binary was bundled in the original source.

## Verification and provenance

Exported from published version 5, source commit `feb5f5b79ceb10788743323a8227a993f67d2f17`. The original source files were verified unchanged. The added npm install/build commands, HTTP serving, asset availability and ZIP integrity were checked. Browser visual/interaction testing was not repeated for this export; the frontend behavior is retained from the original source.

Credentials, Git history and machine-specific caches are intentionally excluded. The live site has not been changed.

## Tests and deployment

Run `npm test` before committing. Branching, environments (dev -> production) and CI/CD are described in [CONTRIBUTING.md](CONTRIBUTING.md).

## Adding videos to Selected Work

Edit `dist/videos.js` only. Each entry takes `title`, `category` (Music Videos, Brand Films or Aerial), `instagramUrl`, and optional `coverImage`, `year`, `featured: true` and `videoUrl`. Set `videoUrl` to a Vimeo link or an MP4/WebM URL to play it instead of the Instagram embed. Filter tabs with no videos are hidden automatically.

