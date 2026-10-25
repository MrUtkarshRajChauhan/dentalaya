# Adi's Dentalaya — Modern Website Sample

A nine-page, mobile-first static website sample for **Adi's Dentalaya**, a multispeciality
dental & oral clinic in Rajajinagar, Bengaluru. Built from HTML, CSS and vanilla JavaScript,
with GSAP + ScrollTrigger loaded from a CDN for restrained scroll-reveal animation.

All content, photographs, logo, video embeds and clinician profiles are sourced from the
official clinic website (https://www.adisdentalaya.com/). Nothing medical, statistical or
promotional has been invented. The appointment form is an honest demo: it validates input
locally and explicitly states that nothing is sent to the clinic, offering the official
booking form and phone number instead.

## Run

No build step. Open `index.html` in a browser, or serve the folder statically, e.g.:

```
python -m http.server 8080
```

## Pages

| File | Page |
|---|---|
| `index.html` | Home — hero, facts strip, treatment index, cosmetic teaser, approach steps, team preview, gallery preview, hours/map, CTA |
| `dental-treatment.html` | All dental treatments with alternating editorial blocks + in-page jump nav |
| `cosmetic-dentistry.html` | Whitening, porcelain veneers, bonding, published cases, consultation process |
| `appointment.html` | Validated appointment-request form (demo) + clinic info panel |
| `about-us.html` | Clinic profile, facilities, approach, clinicians teaser, map & hours |
| `important-instructions.html` | Gum surgery post-op, oral surgery post-op, life with braces (accordions), post-RCT |
| `gallery.html` | Clinic-tour mosaic + 12 published treatment cases, with accessible lightbox |
| `videos.html` | Five official videos (click-to-load, privacy-friendly YouTube player) |
| `our-team.html` | Chief clinicians featured; five consultant specialists |

Cross-page links intentionally open in new tabs (`target="_blank" rel="noopener noreferrer"`)
per project requirements.

## Structure

```
sample/
├── index.html            (all 9 pages at project root)
├── ...
├── styles.css            shared design system
├── script.js             nav, lightbox, accordions, form validation, video facades, GSAP
├── assets/images/        logo, clinic photos, published cases, thumbnails
├── assets/icons/
└── assets/fonts/         (fonts load from Google Fonts with system fallbacks)
```

## Assets & sources

- **Logo** — official clinic logo (`assets/images/adisdentalaya-logo.png`), used in header/footer.
- **Clinic tour photos** (Slide 1–6 of the official gallery): front, waiting area, street view,
  operatory room, treatment in progress, consultation room.
- **Published cases** (12 before/after photos from the official "Treatments" gallery):
  direct composites, metal-free ceramic crown, crowns & bridges, complete dentures,
  adult orthodontics + bridge, child post-and-core crowns.
- **Team photos** (7) from the official Our Team page.
- **Videos** — the five official embeds, titled exactly as published; thumbnails downloaded
  locally, playback loads on demand via `youtube-nocookie`.
- Content text rewritten for clarity from the official treatment/instruction pages; dates,
  hours, address, phone and clinician credentials are quoted/verified verbatim.

## Honest limitations

- No backend exists; the appointment form does **not** transmit or book anything.
- The published treatment cases are shown as clinic documentation, not as promises of outcomes.
- If GSAP fails to load, all content remains visible (failsafe in `script.js`) and the site
  is fully usable; `prefers-reduced-motion` is respected.
