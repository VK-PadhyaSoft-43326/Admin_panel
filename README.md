# Fernwood Admin

A free, production-style e-commerce admin panel. HTML5, CSS3, vanilla JavaScript, jQuery 3.7, Bootstrap 5.3, Chart.js 4, Bootstrap Icons. No build step — open `index.html` in a browser. Responsive down to 360px.

## Every submodule is a real, independent screen

25 submodules, each with its own grid page and its own create/edit form page — 50 files, generated from one shared engine so they behave identically:

| Module | Submodules |
|---|---|
| Catalog | Categories, Products, Attributes, Brands, Collections, UOMs |
| Inventory | Stock, Stock history |
| Customers | Customers |
| Promotions | Offers, Coupons |
| Orders | Orders |
| Billing | Invoices |
| Payments | Transactions |
| Shipping | Shipments |
| Returns | Returns, Refunds |
| Reviews | Reviews |
| Enquiries | Enquiries |
| Administration | Users, Roles, Permissions, Login history |
| Logs | Info logs, Error logs |

Plus the Dashboard, Settings, Your profile, sign in / forgot password, and a 404 page.

## How a grid page works

`<entity>.html` — e.g. `categories.html`, `stock-history.html`, `transactions.html`:

- Search, column sort, status filtering (pills and/or dropdowns), pagination, page-size selector, and a live record count
- A **New** button that opens `<entity>-form.html?id=0`
- An **Edit** icon per row that opens `<entity>-form.html?id=<id>`
- A **Delete** icon per row that opens a confirmation dialog before removing anything
- CSV export of whatever the current search/filter/sort has produced
- Empty-state messaging when nothing matches

All of this comes from one reusable `DataGrid` class in `app.js` plus one config object per entity in `pages.js` — no page duplicates this logic.

## How a create/edit form works

`<entity>-form.html?id=` — the same page handles both:

- **Id = 0** (or no id) → **Create**. The heading reads "New \<entity\>", no delete button, no ID badge.
- **Id > 0** → **Edit**. The record is looked up, an "ID ..." badge appears, every field is pre-filled from the existing record, and a Delete button appears.
- An unknown id shows a plain "not found" message instead of a blank or broken form.
- Field types: text, email, tel, number, date, textarea, select (fixed options or auto-populated from existing values), and toggle (switch) — all driven by the `form` array in each entity's `pages.js` config.
- Saving validates with Bootstrap's built-in constraints, writes the record, shows a toast, and returns to the grid.

## Data actually persists

There's no backend, so **create, edit and delete write to `localStorage`**, keyed per module. Every grid and every dashboard number reads through the same layer, so:

- Add a product in `products-form.html` → it's on `products.html` and counted correctly.
- Edit an order's status → the dashboard's recent-orders list and order-status chart update on next load.
- Delete a coupon → gone everywhere, until you reset.

**Settings → Demo data → Reset data** clears everything back to the original mock data. This is the intended way to "start over" — refreshing the page does not reset anything, by design, since the point is that changes hold.

## Shared layout

- Responsive sidebar with module/submodule navigation — six collapsible groups (Catalog, Inventory, Promotions, Returns, Administration, Logs) and nine single-item modules; the group containing the current page opens automatically
- Top bar: global search (press `/` anywhere to focus it), notifications, user/profile menu
- Breadcrumb + page heading on every screen
- Light/dark toggle, saved to `localStorage`, applied instantly on every page
- Collapsible desktop sidebar, slide-over sidebar with a scrim on mobile
- Toast notifications for every create/update/delete
- Confirmation dialog reused for every delete, on both grid and form pages

## Dashboard

- KPI row: Revenue, Orders, Customers, Conversion
- Revenue & orders combination chart (Chart.js)
- Orders-by-status chart, built live from whatever orders currently exist
- Recent orders (persistence-aware — a newly created order shows up here)
- Store performance panel: average order value, repeat customer rate, orders delivered, refund rate — all computed from the live order and customer data, not hardcoded

## Files

```
ecommerce-admin/
├── index.html                  Dashboard
├── <entity>.html               25 grid pages
├── <entity>-form.html          25 create/edit pages
├── settings.html, profile.html, login.html, forgot-password.html, 404.html
├── robots.txt, site.webmanifest, _headers
└── assets/
    ├── css/style.css, style.min.css
    ├── js/
    │   ├── data.js, data-more.js     Mock data — the seed for every module
    │   ├── pages.js                  One config object per submodule: columns, filters, form fields
    │   └── app.js, app.min.js        Shell, DataGrid, persistence layer, list + form controllers
    └── vendor/                       Bootstrap, jQuery, Chart.js, Bootstrap Icons — vendored, no CDN
```

## Adding a 26th submodule

1. Add an entry to `assets/js/pages.js` — `source` (the mock data array), `columns` (grid), `form` (fields).
2. Add the array to `assets/js/data.js` or `data-more.js`.
3. Add two HTML files: copy any existing `<entity>.html` / `<entity>-form.html` pair, change the filename and `data-init="list:<key>"` / `"form:<key>"`.
4. Add the link to `MENU` in the sidebar markup on every page (or regenerate with the build script).

## Deploying

Static files — upload the folder anywhere. No Node, no server-side code.

- Assets are minified and versioned (`?v=2.0.0`); bump the string when you ship a change.
- No inline JavaScript anywhere, so `_headers` (Netlify / Cloudflare Pages) ships a strict `script-src 'self'` CSP with no `unsafe-inline`. nginx equivalent:

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; frame-ancestors 'none'" always;
location ~* \.(css|js|woff2?|svg)$ { expires 1y; add_header Cache-Control "public, immutable"; }
location ~* \.html$ { add_header Cache-Control "public, max-age=0, must-revalidate"; }
error_page 404 /404.html;
```

- `robots.txt` disallows everything; every page sends `noindex, nofollow`.
- If a page's data fails to load, the boot routine shows an inline notice instead of a blank screen.

## `preview-single-file.html`

The dashboard with every stylesheet, script and the icon font inlined into one file — no relative paths, nothing external but Google Fonts. Useful for previewing the design somewhere that can only render one file. Sidebar links are inert since there's only one page; use the full folder for the working app.

## Design decisions worth knowing about

- **ID scheme**: mock IDs are prefixed strings (`CAT-14`, `FW-2087`) rather than plain integers, matching how real systems label records. "Id = 0" is the literal create sentinel; any other value is treated as "greater than 0" and looked up as an edit target.
- **Every grid gets Edit and Delete**, including modules like Payments/Transactions and the two Logs screens that are usually read-only in a real system. This keeps the 25 modules consistent and matches the brief's grid requirements; in a real deployment you'd gate these behind the Roles/Permissions module also included here.
- **Uniform pages over bespoke widgets**: earlier drafts gave Products, Orders and Customers extra bespoke cards (a print-friendly order slip, "top customers" cards). Those are gone in favour of every module using the same grid + form pattern — consistent, testable, and easy to extend to a 26th module without inventing a new pattern.
