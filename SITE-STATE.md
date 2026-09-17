# Arbor & Eye staging site — current state

Living summary of how the staging site is built and behaves. Describes the final state only, not the history.
Repo: https://github.com/gammagracie/arbor-eye · Live: https://gammagracie.github.io/arbor-eye/

## Pages

| File | What it is | Linked from nav |
|---|---|---|
| `index.html` / `Home.dc.html` | Home carousel (identical files) | yes |
| `Gallery.dc.html` | Gallery, clean version (no boxes behind works) | yes |
| `Gallery-boxed.dc.html` | Gallery, alternate version with `#eef0f5` boxes behind works | no (back pocket) |
| `About.dc.html` | About | yes |
| `Contact Page.dc.html` | Contact with shipping and returns below | yes |
| `Contact-tabs.dc.html` | Alternate contact page: form + Contact / Shipping / Returns tabs | no (back pocket) |

Both gallery files are kept in step; every gallery change is applied to both. Git tag `approved-2026-09-14` marks an earlier signed-off version.

## Global layout

- **Side padding** (header, content, footer share it): 24px phone, 48px tablet (768–1023px), 10% of the viewport from 1024px up. A stable scrollbar gutter keeps pages aligned whether or not they scroll.
- **Header**: 76px tall, growing to 86px between 1280px and 1920px wide. Logo, nav links (14px, tracked uppercase) and account/bag icons share one baseline on desktop. Active nav item is bold, no underline. Phone header is vertically centred.
- **Footer**: 50px tall, growing to 64px between 1280px and 1920px. One line: copyright left, Instagram (links to instagram.com/arbor.eye, new tab) and Pinterest icons right. Sits at the end of the page (not sticky).
- **Mobile menu** (under 768px): hamburger becomes an X; the menu slides down as a fixed overlay between header and footer, footer pinned to the bottom of the screen, page scroll locked. Items: Gallery, About, Contact, Shipping, Returns & Exchanges, then Login/Account and Shopping Cart rows with icons (account/bag icons leave the header whenever the hamburger shows). Double spacing between items.
- **Typography helpers**: `text-wrap: pretty` on all text to avoid single-word last lines.
- **Breakpoints**: phone < 768, tablet 768–1279, desktop ≥ 1280 (gallery grid also switches at 1000, side padding at 1024).

## Home

- **Carousel of nine works** (uncropped gallery scans with the paper border): Brilliance first, then Symbiosis (Core 12), Core 20, Script (Core 11), Habitat (Core 16), Chamber (Core 15), Core 17, Conduit (Core 13), Upwelling (Core 18). Titles match the Gallery so hover label and click-through line up. Original cropped file paths are kept on each entry (`cropped`). "Articulation" (Core 14) is in the data but flagged `hidden` at Ned's request.
- **Main image**: on desktop it fits the height between header and footer and is centred, never wider than the content; on phones/tablets it also fits the screen height so the footer is always visible and the image-plus-thumbnails block is vertically centred. Image fades out/in (0.2s) on change.
- **Hover** on the main image shows the work's title in light italic text below the thumbnails. **Click** opens that work's Gallery detail page (`Gallery.dc.html#Title`).
- **Thumbnails**: 7 visible on desktop, 5 tablet, 3 phone, centred on the current work; one extra waits off-stage each side. Size 5.5% of the image width on desktop (52px tablet, 44px phone), 22px apart, overlapping the image by 30% of the rail height on desktop/tablet (no overlap on phones). Arrows are tall thin chevrons in light grey, bottom-aligned with the thumbnails, 56px clear of the tray on desktop.
- **Tray motion**: selecting a work slides the whole strip one slot in the direction of travel (0.65s ease-in-out) then re-centres silently.
- **Dock-style magnification** (mouse only): thumbnail under the cursor grows to 130%, neighbours ~114%, anchored at the bottom, neighbours nudged aside; end thumbnails have 60px of room so they are never cropped.
- **Finger swipe** on the image or thumbnails moves forward/back; arrow keys work too.

## Gallery (grid)

- Filters: **Series** and **Availability** as styled dropdown panels (white panel, thin dark rule on top, 14px light text, soft shadow), always right-aligned; close on pick, outside click or Escape.
- Grid-size switcher (3 / 2 / 1 columns) shown from 768px up; hidden on phones.
- Three-column layout drops to two columns under 1000px. Phones use two columns.
- **Vertical filter**: one extra column at every size (4 desktop, 3 under 1000px, 3 on phones), taller row gaps (120px desktop, 56px phone) and square cells so the tall works keep their size.
- Works sit in 4:3 cells with no background (clean version) and a soft grey shadow; hover lifts the work and shows its title (italic) centred below it.
- "Articulation" (file CORE_14) is in the data but hidden from the grid at Ned's request (`hidden` flag).
- Clicking a work opens the detail view; `#Title` in the URL opens it directly.
- Brilliance is the first work in the gallery (per Ned); Canopy (file DSC01754) is the last.
- Per-work details live in a `DETAILS` map keyed by title. Acrylic and pastel on canvas, 11 x 24 in, with a one-line description: Script, Brilliance, Canopy, Passage (The Turning 8 scan), Conduit (Core 13), Symbiosis (Core 12), Chamber (Core 15), Upwelling (Core 18), Coastal Silence (Ascent 5), Crossings (Structure 4), Habitat (Core 16), Aurora (Select 2), Resonance (Select 8); the same medium and size without a description: Outliers 1, 3 and 4. Everything else defaults to watercolour on paper, 4 x 6 in.

## Detail view ("Original")

- Two columns on desktop and tablet: image left, text right; stacked on phones. Text is vertically centred on the image; whole block centred in the space below the back link.
- Text: "Original", italic title (all work titles on the site are italic), medium, size, then two icon lines (limited edition set; certificate of authenticity). On tablet-portrait widths (600–767px) the two icon lines sit in a right-hand column. "Email to enquire" and "Buy the print" links at 11px.
- **Framing carousel**: three dots below the image (Unframed / White frame / Black frame). Frames are drawn in code (16px border + white mount) and ease on/off over 0.5s. Tap the right half of the image or swipe left for next, left half or swipe right for previous.
- **Magnified view** (zoom button below the dots, desktop/tablet): a white lightbox covering the page showing only the artwork with the framing dots. Double-click / double-tap steps the zoom 1x → 2x → 3x → 1x, keeping the clicked point in view (the lightbox scrolls); option-click steps it back down. Arrow keys flip frames, swipe works, Escape or × closes.

## Buy page ("Print")

- Print shown on an off-white wall (`#F0F2EF`) with a soft shadow; clicking it opens a **lightbox carousel** (dark overlay) of the three framing views with dots, hover arrows, tap zones, swipe, arrow keys and Escape.
- Italic title, then the price for the selected size: 8x12″ $225 · 16x24″ $595 · 24x36″ $1,195. Size buttons, then **Choose Your Frame Color**: white and black swatches plus "Unframed", caret under the selection; picking one redraws the print and updates the "Frame: …" / "Mount: …" lines.
- Add to cart button.

## About

- Paragraph text 14px / 1.75 line height, scaling down with the viewport to no less than 11px (line height eases to 1.4) so copy and photo heights stay in step; 18px between paragraphs; headings share one line height; the quote keeps its display size.
- **Biography**: photo on the content's left edge (42% of the width, max 480px), heading level with the top of the photo, text fills the rest (capped at 600px on very wide screens).
- **Process**: text left, photos right on desktop.
- Photo carousels (Biography, Process, Studio): crossfade 0.7s; chevron arrows; dots; tap right/left half or swipe to move.

## Contact

- `Contact Page.dc.html`: hero, email/Instagram line, then Shipping Policy and Returns & Exchanges sections.
- `Contact-tabs.dc.html`: same hero, then three tabs — Contact (form: Name, Email, Message, Send — opens the visitor's mail app to NSChurch@gmail.com), Shipping, Returns & Exchanges. `#shipping` / `#returns` open that tab.

## Assets

- All 63 gallery scans in `assets/works/` (832px wide); home crops `assets/art-1..7.png`; About photos in `uploads/about/`.
- High-resolution scans still to come (current ones look soft at full width).
- Fallback: a light green box shows if any artwork file is missing.

## Open items

- Real edition numbers per work (edition line was removed from the detail page).
- Framed product photography could replace the drawn frames.
