# RT FOOD — Frozen Snacks & French Fries (website)

Completely redesigned, fully animated multi-page website. Pure HTML + CSS + JavaScript (no build step).

```
rt-food-website/
├── assets/image/        logo.png (your new logo), product & brand images
├── index.html           Home
├── about.html           About Us
├── culture.html         Our Culture (+ CV upload form)
├── products.html        Products (dropdown filters, pack sizes, add to cart / buy now)
├── seedtoshelf.html     Seed to Shelf
├── Exports.html         Exports (world map + enquiry form)
├── Recipes.html         Recipes (33 videos, text + PDF recipe cards)
├── order.html           Order Now (login → menu → cart → details → payment → bill → live tracking)
├── connect.html         Connect / Contact (office map, form, FAQ)
├── css/style.css        One design system for every page
└── js/
    data.js              Products, prices, coupons, GST, recipes, export countries  ← edit here
    main.js              Loader, header/footer, cart, storage, animations
    shop.js              Product cards + filters   products.js / home.js / exports.js / recipes.js / order.js / forms.js
    pdf.js               Recipe PDF + invoice PDF   logo.js  (logo as base64 for PDFs)
```

## Run it
Open through a web server (not by double-clicking) so YouTube videos, maps and PDFs behave:
`python -m http.server 8000` → http://localhost:8000  — or upload the folder to any hosting.
Needs internet for: Google Fonts, Leaflet maps (OpenStreetMap/CARTO tiles), jsPDF, QR code, YouTube.

## Things to set before going live  (js/data.js)
- `HF.UPI_ID` — **replace with your real UPI ID**; the payment QR is generated from it.
- `HF.GST_RATE` — set the correct GST slab; also replace the placeholder GSTIN in `order.js` / `pdf.js`.
- Product prices: `HF.CATS[].base` (500 g price) and `HF.SIZES` multipliers (200g/500g/1kg/2.5kg).
- Coupons: `HF.COUPONS` (WELCOMERT, FLAT100, FRYDAY, CRISPY50, FREESHIP).
- Own product photos: `HF.IMG_OVERRIDE` in `js/shop.js` → `{ 'french-fries': 'assets/image/my-fries.jpg' }`.
- Rider timeline: `TRACK` at the top of `js/order.js` (demo timeline is compressed to ~2 minutes).

## How the "live" parts work
Cart, login, orders and tracking are stored in the browser (localStorage) and sync across open tabs.
Tracking route = OpenStreetMap geocoding + OSRM road routing; the rider moves along the real route.
This is a front-end demo: payments are simulated and accounts are not secure. For real sales, connect a
backend + payment gateway (e.g. Razorpay) at `placeOrder()` in `js/order.js`.

## Notes
- Recipe ingredients/steps are written guides based on each video's title — please check them against your test kitchen.
- Footer credit: Designed & Developed by RT1504.

## Latest changes
- Brand is now **RT FOOD** (new logo). Loader animation runs on `index.html` and `order.html` only.
- Baked snacks, pizzas, puffets and pies are sold by **1 / 2 / 4 packs** (`RT.SIZES` and the `sizes` rule in `js/data.js`).
- Contact: +91 78619 76128 · enquiries about@hyfunfoods.com · orders sales@hyfunfoods.com
- Footer states the site is for educational purposes only. Welcome coupon is now `WELCOMERT`.
