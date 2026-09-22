# Arbor & Eye staging site — current state

Living summary of how the staging site is built and behaves. Describes the final state only, not the history.
Repo: https://github.com/gammagracie/arbor-eye · Live: https://gammagracie.github.io/arbor-eye/
Local copies: working copy in `~/Desktop/art-arbor-gallery-NED/archive/Art-Arbor-min` (moved into `archive/` on 2026-09-22); mirror in `~/Sites/arbor-eye` (every `git push` from the working copy updates GitHub and the mirror together; do not edit the mirror directly).

## Pages

| File | What it is | Linked from nav |
|---|---|---|
| `index.html` / `Home.dc.html` | Home carousel (identical files) | yes (logo) |
| `Home-animated.dc.html` | Secondary home: identical to Home except the header logo is the animated wordmark (`uploads/logo-animation.svg`, the v2 storyboard animation: Tree of Life grows in, ARBOR / EYE fade in, the tree settles into the ampersand; plays once over 6.6s and holds the final frame, no loop). Sized so the letters match the text logo's cap height (20px), which makes the wordmark 188px wide (its letter-spacing is tighter than the CSS logo's); the whole final mark, leaves above the wordmark and stem below, fits inside the header (51px tall, 11px clear at the top), set 8px lower than the static logo so the leaf tips are never clipped; the header layout is identical to the other pages because the text logo is kept in place invisibly beneath the mark. The tree overflows above the header only while it grows in. The animation uses fixed geometry for the tree and ampersand rather than measuring them in the browser (Safari cannot measure artwork inside SVG `<defs>`, which had left the tree unscaled). | yes, temporary: "H2" (first nav item) |
| `Gallery.dc.html` | Gallery, clean grid (no boxes behind works) | yes: "Gallery" |
| `Gallery-boxed.dc.html` | Gallery, grid with `#eef0f5` boxes behind works | no (back pocket, link only) |
| `gallery-filmstrip.html` | Gallery, "filmstrip": one large work with a strip of every work along the bottom | yes, temporary: "G3" |
| `Gallery-horizontal.dc.html` | Gallery, horizontal scroll: the clean grid's cells two rows deep, running off the right edge | yes, temporary: "G4" |
| `About.dc.html` | About | yes |
| `Contact-tabs.dc.html` | Contact: form + Contact / Shipping / Returns tabs | yes: "Contact" (the mobile menu's Shipping and Returns links open its tabs) |

The three templated gallery files (clean, boxed, horizontal) share the same data, filters, detail view and buy page and are kept in step; every gallery change is applied to all of them, and the filmstrip's embedded works list is regenerated when the list changes. Git tags: `approved-2026-09-14` (earlier signed-off version) and `pinned-2026-09-19` (state before the filmstrip experiment).

## Global layout

- **Header and footer are identical on every page**: same height, same side distance (the standard side padding below), including the home page, where the painting may be wider or narrower than the header.
- **Side padding** (header, content, footer share it): 24px phone, 48px tablet (768–1023px), 10% of the viewport from 1024px up. A stable scrollbar gutter keeps pages aligned whether or not they scroll.
- **Header**: 72px tall, growing to 80px between 1280px and 1920px wide. Logo, nav links (13px, tracked uppercase) and account/bag icons share one baseline on desktop. Active nav item is bold, no underline. Phone header is vertically centred. Account and bag icons are thin line icons (a person outline and a square shopping bag) from `assets/icons/account.svg` and `cart.svg`, drawn at 19px in the header (80% of their 24px design size, line weight kept visually the same) and at 24px on the mobile menu rows; `assets/icons/mail.svg` (solid grey envelope) is stored for later use and not placed anywhere yet.
- **Footer**: 43px tall, growing to 54px between 1280px and 1920px (15% shorter than the earlier 50–64px). One line: copyright left, Instagram (links to instagram.com/arbor.eye, new tab) and Pinterest icons right. Sits at the end of the page (not sticky).
- **Mobile menu** (under 768px): hamburger becomes an X; the menu slides down as a fixed overlay between header and footer, footer pinned to the bottom of the screen, page scroll locked. Items: Gallery, About, Contact, Shipping, Returns & Exchanges, then Login/Account and Shopping Cart rows with icons (account/bag icons leave the header whenever the hamburger shows). Double spacing between items.
- **Fonts**: Neuzeit Grotesk (self-hosted in `assets/fonts/`, loaded through `assets/fonts/neuzeit.css`; Light 300, Regular 400, Bold 700, with 600 resolving to Bold) for all sans text, falling back to Helvetica Neue; EB Garamond (Google Fonts) for headings and work titles.
- **Logo**: the supplied SVG wordmark (`uploads/arbor-eye-wordmark.svg`, from `ART/Logo/Wordmark/SVG`, cropped to the mark) on every page except H2, drawn in the text colour with hover dimming. It is sized so its capitals match the former text logo's cap height (20px), making it 188px wide, and sits on the same baseline; the former text logo is kept in the link invisibly so the header layout is unchanged at every screen size. H2 shows the same wordmark as the final frame of its animation. Licence for Neuzeit Grotesk to be confirmed before launch.
- **Temporary nav items**: the header nav and mobile menu read H2 · Gallery · G3 · G4 · About · Contact while the alternates are under review (H2 animated-logo home, G3 filmstrip, G4 horizontal scroll). While they are there, temporary rules tighten the nav below 1280px (12px text; 11px and closer spacing under 900px) so the header stays on one line. Remove the extra items and those rules together.
- **Typography helpers**: `text-wrap: pretty` on all text to avoid single-word last lines.
- **Breakpoints**: phone < 768, tablet 768–1279, desktop ≥ 1280 (gallery grid also switches at 1000, side padding at 1024).

## Home

- **Carousel of nine works** (uncropped gallery scans with the paper border): Brilliance first, then Symbiosis (Core 12), Core 20, Script (Core 11), Habitat (Core 16), Chamber (Core 15), Core 17, Conduit (Core 13), Upwelling (Core 18). Titles match the Gallery so hover label and click-through line up. Original cropped file paths are kept on each entry (`cropped`). "Articulation" (Core 14) is in the data but flagged `hidden` at Ned's request.
- **Main image**: on desktop and tablet the image-plus-thumbnails block is vertically centred in the content area between the header and the bottom of the screen, with 35px above the image and 35px below the thumbnails, and sized to fill that space exactly (the hover title fits in the lower 35px, 15px under the thumbnails). The footer follows below the fold and is reached by scrolling. The image may run wider than the page's side padding, up to 94% of the screen width, so it can still fill the height on very large or squarer screens; where even that is not enough (tall, narrow windows or very wide screens) the block stays centred with equal space above and below. On phones the footer stays on screen and the block is vertically centred, as the image is limited by width there. The image sits in a fixed 1.494:1 frame (object-fit cover, so all nine works share one size and nothing shifts on change) and fades out/in over 0.7s each way (ease-in-out, so the change is gentle at both ends); all carousel images are preloaded; the Tree of Life insignia (`uploads/arbor-mark.png`, grey line drawing) sits behind it on its own layer, 49.7% of the frame height at 25% opacity, and shows through faintly during the fade.
- **Intro overlay**: on page load the white ARBOR & EYE wordmark (`uploads/intro-logo.png`) sits over the main image at 72% of its width, then fades out over 0.9s after 3 seconds.
- **Hover** on the main image fades the work's title in below the thumbnails (light italic text, 0.45s fade in and out). **Click** opens that work's Gallery detail page (`Gallery.dc.html#Title`).
- **Thumbnails**: 5 visible on desktop and tablet (the maximum), 3 on phones, centred on the current work; one extra waits off-stage each side. Size 3.3% of the image width on desktop (about 34px tall at 1440 x 900), 31px on tablet, 44px on phones, 22px apart, overlapping the image by 30% of the rail height on desktop/tablet (no overlap on phones). Arrows are tall thin chevrons in light grey, bottom-aligned with the thumbnails where they overlap the image (desktop/tablet) and centred on them on phones, 56px clear of the tray on desktop.
- **Tray motion**: selecting a work slides the whole strip one slot in the direction of travel (0.95s, soft start and finish) then re-centres silently.
- **Dock-style magnification** (mouse only): thumbnail under the cursor grows to 130%, neighbours ~114%, anchored at the bottom, neighbours nudged aside; end thumbnails have 60px of room so they are never cropped.
- **Finger swipe** on the image or thumbnails moves forward/back; arrow keys work too.

## Gallery (grid)

- Filters: **Series** and **Availability** as styled dropdown panels (white panel, thin dark rule on top, 14px light text, soft shadow), always right-aligned; close on pick, outside click or Escape.
- Grid-size switcher (3 / 2 / 1 columns) shown from 768px up; hidden on phones.
- Three-column layout drops to two columns under 1000px. Phones use two columns.
- **Vertical filter**: one extra column at every size (4 desktop, 3 under 1000px, 3 on phones), taller row gaps (120px desktop, 56px phone) and square cells so the tall works keep their size.
- Works sit in 4:3 cells with no background (clean version) and a soft grey shadow; hover lifts the work and shows its title centred below it in black EB Garamond italic capitals (15px), the same face as the detail-page title.
- "Articulation" (file CORE_14) is in the data but hidden from the grid at Ned's request (`hidden` flag).
- Clicking a work opens the detail view; `#Title` in the URL opens it directly.
- Brilliance is the first work in the gallery (per Ned); Canopy (file DSC01754) is the last.
- Per-work details live in a `DETAILS` map keyed by title. Acrylic and pastel on canvas, 11 x 24 in, with a one-line description: Script, Brilliance, Canopy, Passage (The Turning 8 scan), Conduit (Core 13), Symbiosis (Core 12), Chamber (Core 15), Upwelling (Core 18), Coastal Silence (Ascent 5), Crossings (Structure 4), Habitat (Core 16), Aurora (Select 2), Resonance (Select 8); the same medium and size without a description: Outliers 1, 3 and 4. Everything else defaults to watercolour on paper, 4 x 6 in.

## Gallery, horizontal scroll version (`Gallery-horizontal.dc.html`)

- A copy of the clean grid gallery with the same filters, hover titles (below each work, EB Garamond italic capitals), detail view, buy page and deep links.
- **Row switch** (top left, square icons, shown from 768px up): a 3 x 3 grid of small squares = three rows of works; two horizontal bars = two rows (the view the page opens on); one solid square = a single large scrolling band, works filling the height. Phones always show two rows. Changing the row count starts the rows again from the left.
- Works sit in the same 4:3 cells with soft shadows, one, two or three rows deep, in columns that run off the right edge of the screen (the row bleeds past the side padding; first column lines up with the logo). Cell size comes from the height between toolbar and footer, so the page itself never scrolls: on a 1440 x 900 screen that is about five and a half columns at three rows, three and a half at two rows, and one and a half works in the single band; one and a bit columns on phones. Order runs down each column, then right. The Vertical filter uses square cells.
- **Scrolling**: wheel or trackpad travel in either direction (up/down or sideways) moves the rows left/right with a short ease so mouse-wheel steps glide; left/right arrow keys move about 60% of a screen; phones swipe sideways natively. No scrollbar is shown.
- Opening a work and coming back returns the rows to where they were; changing a filter starts them again from the left.

## Gallery, filmstrip version (`gallery-filmstrip.html`)

- Standalone plain HTML/CSS/JS page (not templated) with the same header, footer, side padding and mobile menu. Header, work and filmstrip fill the screen exactly, with the thumbnails 20px above the bottom edge; the footer sits just below the fold and is reached by scrolling (the mobile menu therefore runs to the bottom of the screen).
- **Stage**: the selected work shown whole, as large as the window allows: it fills the height between header and filmstrip (16px below the header) and, from 768px up, may run wider than the page's usual side padding, out to 3% of the screen width each side with the chevrons still hugging it, centred on the off-white page with the usual soft shadow; works change with a soft 0.9s crossfade (arrows, thumbnails, keys and swipes alike): the incoming image is fully loaded first, then fades in over the outgoing one (no insignia behind it); the works either side of the current one are preloaded so the arrows respond at once. First work (Brilliance) on load, or the work named in the URL hash.
- **Previous / next chevrons** sit either side of the work (the same thin light-grey chevrons as the home carousel, darker on hover, drawn as a hairline; 39 x 108px, 20 x 56px on phones), hugging the work with a fixed gap and vertically centred on it. Click or tap steps to the previous / next work in the line-up, wrapping round at either end, and glides that work's thumbnail to the centre of the strip. The work leaves room for them (84px each side, 32px on phones).
- **Hover** on the work shows its title (black EB Garamond italic capitals, matching the detail page) vertically centred in the white space between the work and the thumbnails at every window shape and a small "View details" cue (always visible on touch screens). **Click** opens that work's detail view in the main gallery (`Gallery.dc.html#<file>`; the gallery's deep link accepts a title or a file name, so the several "Untitled" works resolve correctly).
- **Filmstrip**: every visible work in one row anchored above the footer, thumbnails 38px tall (31px on phones) with 6px gaps (files in `assets/thumbs/`, 260px tall so they stay sharp when magnified), edges faded. The row is a track moved by an eased transform and steered by the cursor only while it is on the thumbnails themselves (the thumbnail row, or a magnified thumbnail rising above it; hovering the artwork, the title or the space around the row does nothing): in the middle 10% of the page width the row eases to a complete stop; left or right of that zone it drifts that way, faster the further out the cursor is, up to 380px per second (about three and a half thumbnails a second) near the page edges; it stops at either end and coasts to rest when the cursor leaves the strip. Speed is the same on 60Hz and 120Hz screens (`CRUISE`, `DEAD`, `ACCEL` in the page script). The wheel/trackpad also moves the row, directly and without the speed limit; choosing a work with the arrow keys or a swipe glides its thumbnail to the centre. Thumbnails magnify Dock-style under the cursor (up to about 190%, bell-curve falloff, growing up from the baseline, neighbours sliding aside, the one under the cursor staying under it) and relax when the cursor leaves the strip. Touch screens get the same glide and magnification, driven by the finger: the row moves and thumbnails swell only while a finger is on the filmstrip, it coasts to rest when the finger lifts, and a touch anywhere else on the page stops it dead. Mouse events synthesised from taps are ignored, so phones that wrongly report a mouse behave correctly; the title is always shown once a touch is seen. Click a thumbnail to show that work; the active one is outlined, the rest dimmed. Arrow keys and finger swipes on the stage step through works.
- The works list is embedded in the page (generated from `Gallery.dc.html`, hidden works left out) and needs regenerating when the gallery's list changes.

## Detail view ("Original")

- Two columns on desktop and tablet: image left, text right; stacked on phones. Text is vertically centred on the image; whole block centred in the space below the back link.
- Text: "Original", italic title (all work titles on the site are italic), medium, size, then two icon lines (limited edition set; certificate of authenticity). On tablet-portrait widths (600–767px) the two icon lines sit in a right-hand column. "Email to enquire" and "Buy the print" links at 11px.
- **Framing carousel**: three dots below the image (Unframed / White frame / Black frame). Frames are drawn in code (16px border + white mount) and ease on/off over 0.5s. Tap the right half of the image or swipe left for next, left half or swipe right for previous.
- **Magnified view** (zoom button below the dots, desktop/tablet): a white lightbox covering the page showing only the artwork with the framing dots. Double-click / double-tap steps the zoom 1x → 2x → 3x → 1x, keeping the clicked point in view (the lightbox scrolls); option-click steps it back down. Arrow keys flip frames, swipe works, Escape or × closes.

## Buy page ("Print")

- Print shown on an off-white wall (`#F0F2EF`) with a soft shadow; clicking it opens a **lightbox carousel** (dark overlay) of the three framing views with dots, hover arrows, tap zones, swipe, arrow keys and Escape.
- Italic title, then the price for the selected size: 8x12″ $225 · 16x24″ $595 · 24x36″ $1,195. Size buttons, then **Choose Your Frame Color** (this line and the Frame / Mount lines are 14px regular weight): white and black swatches (thin 100 x 12px slivers) plus "Unframed", caret under the selection; picking one redraws the print and updates the "Frame: …" / "Mount: …" lines.
- Add to cart button.

## About

- Paragraphs in Biography, Tree of Life and Process are left-aligned within their existing blocks (block widths, positions and side padding unchanged); the section headings and the quote stay centred.
- Paragraph text 14px / 1.75 line height, scaling down with the viewport to no less than 11px (line height eases to 1.4) so copy and photo heights stay in step; 18px between paragraphs; headings share one line height; the quote keeps its display size.
- **Biography (page opener)**: from 1000px up, a square photo fills the left half of the screen, flush with the left screen edge and touching the bottom of the header (the section is full-bleed; photos are cropped square, framed toward the top so faces stay in view); the heading and copy are centred, vertically and horizontally, in the right half (max 680px wide). The carousel's arrows and dots sit centred under the photo. Under 1000px it stacks: full-width square photo under the header, controls, then heading and copy with the normal side padding.
- **Quote**: the line sits between two large quotation marks, one each side of the text (opening mark riding slightly above the first line, closing mark slightly below the last). Marks are 125px wide from about 1440px up and scale down with the screen (8.7% of its width, about 33px on phones), drawn at 70% of their earlier grey; the text wraps in balanced lines. Tight spacing: 52px above and 44px below the block on desktop (28px on phones), on top of the neighbouring sections' own padding.
- **Process**: text left, photos right on desktop.
- Photo carousels (Biography, Process, Studio): crossfade 0.7s; chevron arrows; dots; tap right/left half or swipe to move.

## Contact

- The original single-page contact layout (`Contact Page.dc.html`) was removed on 2026-09-21; it is recoverable from the `pinned-2026-09-21` tag.
- `Contact-tabs.dc.html`: same hero, then three tabs — Contact (form: Name, Email, Message, Send — opens the visitor's mail app to NSChurch@gmail.com), Shipping, Returns & Exchanges. The image beside the form and the shipping text is the silver ampersand-and-leaves sculpture on grey (`uploads/ampersand-sculpture.webp`, a square file). On the Contact tab the whole square image is shown, never cropped: from 1100px up it sits in the right-hand column (44% of the content width, at least 440px) with its top level with the "Get in touch" heading, the form's fields take the narrower left column, and the Message field stretches so its bottom line meets the bottom of the image exactly; the Send button sits on the row below, its confirmation note floating under it. Under 1100px the page stacks form, Send, then the full square image (max 520px). On the Shipping tab it keeps the sticky portrait crop. `#shipping` / `#returns` open that tab.

## Assets

- All 63 gallery scans in `assets/works/` (832px wide); home crops `assets/art-1..7.png`; About photos in `uploads/about/`.
- High-resolution scans still to come (current ones look soft at full width).
- Fallback: a light green box shows if any artwork file is missing.

## Open items

- **New artwork details and higher-resolution images are expected.** Intake: full-size originals go in `~/Desktop/art-arbor-gallery-NED/_incoming/images/` (that folder is still beside `archive/`, not inside it), details (spreadsheet, text or screenshots) in `_incoming/details/` or in chat; Claude makes the web-sized copies, updates both galleries, the home carousel and the filmstrip list, and pushes. Originals stay out of the repo; nothing is placed in `~/Sites/arbor-eye` by hand.
- Real edition numbers per work (edition line was removed from the detail page).
- Framed product photography could replace the drawn frames.
