# RYU Films — revised homepage starter

Updated to Raul's Photoshop layout: white background, centered logo at the top, all eight trailers in a two-column grid on the left, and the red cameraman illustration on the right. Both new images are included; the vintage poster and original camera artwork follow the gallery. Gallery and Book Me remain in gold script. All eight trailer previews appear in the opening desktop composition. On mobile the trailer grid is followed by the artwork so labels and images stay readable.

## Open or host
Open dist/index.html, or serve the dist directory from any static web host. No build or dependency installation is needed.

## Connect the eight trailers
The uploaded files are JPEG screenshots, not videos. The first version uses honest still previews, with video-ready players.
1. Copy the actual trailer exports into dist/assets (prefer web-optimized MP4 / H.264).
2. Open dist/config.js. Enter each matching path in video, e.g. assets/no-favors.mp4.
3. Optional: enter a full-length MP4 in fullVideo. Clicking a preview or gallery card then opens that longer film with audio controls. Homepage trailers remain muted.
4. Fill bookingUrl with Raul's confirmed booking link OR bookingEmail with his verified business email. URL takes priority. Until then, the form only downloads a project brief and explicitly says nothing is sent. There is no booking backend.

The featured order is No Favors (SVCIA), Everything! (Shy Carter), Shy Carter / Sachie Louie, Aerial Reel, Elevate Soho, I'm From New York, How Can I Lose, and Bars 101. The homepage and gallery use the same order. Confirm song titles and artist credits before public launch. Aerial Reel and Brand film are descriptive labels, not verified original titles.

## Playback
Eight native video elements are set to autoplay muted, loop and play inline. Browsers may prevent autoplay depending on device/user settings. Poster images display immediately; no one-second video-loading guarantee is possible. Reduced-motion preference pauses automatic playback, and a visible Play/Pause control appears once video paths are configured. Clicking a trailer opens an accessible dialog with normal video controls.

Original MP4 files are recommended for the clean homepage rather than relying on Instagram embeds. Instagram post links are not MP4 sources; do not paste them into video or fullVideo. If social links are supplied instead, build deliberate external links/embeds separately.

## Branding
The logo is a standalone transparent PNG at dist/assets/ryu-films-logo.png, extracted from Raul's reference using the built-in image editing tool. Prompt: Extract only the RYU Films lettering, preserve colors and metallic finish, remove cream background and all surrounding elements, and output genuine alpha transparency. Great Vibes is a close script-font approximation loaded through Google Fonts, with local fallbacks; it is not confirmed as the original logo font. Supply the original font for an exact match. The existing camera artwork is preserved.

## Files
index.html: page structure. style.css: spacing, responsive layout, and visual design. config.js: all media paths, labels and booking contact. app.js: playback, gallery dialogs and inquiry behavior. assets/: provided artwork/stills. The downloadable ZIP excludes Sites hosting identity.

The right-side cameraman cutout uses built-in image_gen. Prompt: Remove only the white background, preserve both red hoodie cameramen, cameras, gimbals and illustration; output genuine transparency. The second uploaded vintage poster is preserved unchanged.
