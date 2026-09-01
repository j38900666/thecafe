# The Cafeteria — PRD

## Original Problem Statement
Build a premium, modern, mobile-first, fully responsive website for **The Cafeteria** (slogan exactly "Good Food • Good Mood"), using the uploaded HTML menu as the source of truth. Preserve all menu categories, items, and prices exactly; every food item gets its own relevant real image; smooth category navigation; fully functional shopping cart showing SUBTOTAL ONLY (no auto delivery/packaging charges — restaurant confirms manually); WhatsApp ordering to +91 9101328562; orders also saved to database; QR code digital menu that opens the live site on Android & iPhone; advanced editable admin panel (items, prices, photos, categories, availability, delete); GitHub/Vercel-ready clean structure. Business: GC CRPF Doyapur, Silchar. Contact +91 8721824729. Home delivery available, delivery charges apply. User later added: "Add logo" (provided brand logo image) and requested award-worthy art direction (kinetic hero, masked line reveal, numbered chapters, editorial marquee, framer-motion + lenis, parallax).

## User Choices (confirmed)
- Ordering: BOTH WhatsApp checkout AND order form saved to database
- Images: curated real stock photos matched per dish (no placeholders); later added AI generation (GPT Image 1) via admin sparkle button
- Admin access: simple password login (JWT)
- Design: designer-decided → "Editorial Organic & Luxury" (cream #FDFBF7, burnt orange #C2410C, Cormorant Garamond + Outfit)
- Order alerts channel: browser notification + sound (no email)

## Personas
- Camp resident/visitor: browses digital menu on phone, adds to cart, orders via WhatsApp
- Restaurant owner (admin): updates items/prices/photos/availability/specials, views incoming orders, tracks order status

## Architecture
- Backend: FastAPI (`/app/backend/server.py`) + MongoDB (motor). Collections: `menu_items` (seeded 102 items / 8 categories from uploaded HTML, idempotent seed), `orders`, `login_attempts`. JWT password-only admin auth (24h token), 5-attempt/15-min brute-force lockout. All routes under `/api`.
- Frontend: React + Tailwind + framer-motion + lenis + qrcode.react. Routes: `/` landing (Navbar, Hero with masked line reveal + parallax, Marquee, SpecialsSection, Manifesto, MenuSection with sticky category nav + scroll-spy + search + veg filter, DeliveryBanner, PartySection, QRSection, Footer, CartDrawer), `/admin` dashboard (Orders + Menu management), `/poster` printable QR counter-card.
- Cart: React context + localStorage; subtotal only; checkout → POST /api/orders → opens wa.me/919101328562 with pre-filled order message.
- QR: client-side generated from `window.location.origin` (works on any deployment).
- AI: emergentintegrations OpenAIImageGeneration (gpt-image-1) via EMERGENT_LLM_KEY for dish photos + brand imagery.

## Implemented (2026-08-31, iteration 1)
- Full menu preserved exactly: 8 categories, 102 items, original prices
- 53 unique verified real food photos mapped per dish type (curl-verified 200)
- Kinetic hero (masked line-by-line "Good Food. / Good Mood."), slow editorial marquee, numbered manifesto chapters with arch-framed images, film grain overlay, Lenis smooth scroll, parallax hero
- Cart with qty controls, subtotal-only + "delivery & packaging confirmed manually" note, name/phone/address/note form, WhatsApp + DB order
- Admin panel: password login, orders list with status flow (new/confirmed/delivered/cancelled), item add/edit/delete, availability toggle, category create/rename, photo URL or device upload (base64)
- QR digital menu section, delivery banner (charges apply), party booking CTAs, footer with full business details, brand logo in nav/hero/footer/favicon
- Fixed: PostHog snippet syntax error, hydration warning, flaky image host replaced with verified URLs

## Implemented (2026-08-31, iteration 2)
- Order alerts: admin panel polls for new orders every 20s — instant toast + two-tone ding + browser push notification (bell toggle in admin header requests permission; persists via localStorage); orders list auto-refreshes on new order
- Menu search: live search box filters dishes across all categories with a "no dishes found" state
- Veg/Non-Veg: every item auto-classified (38 non-veg) with green/red Indian-style badge on each card; All/Veg/Non-Veg filter chips; owner can override type per item in the admin item dialog (veg flag stored per item, editable on add/edit)

## Implemented (2026-08-31, iteration 3)
- AI dish photos: OpenAI GPT Image 1 via Emergent Universal Key (emergentintegrations). Sparkle button on each admin menu row → POST /api/admin/items/{id}/generate-image → prompt built from dish name + category → PNG stored as base64 data URL on the item → live instantly on the public menu. ~12s per photo. EMERGENT_LLM_KEY added to backend/.env

## Implemented (2026-08-31, iteration 4)
- Today's Specials: admin marks dishes with a star toggle (or checkbox in item dialog); `special` flag on items; "Today's Specials" horizontal-snap section appears at the top of the landing page (hidden when no specials) with amber badge + Add-to-cart; menu cards also show a "Today's Special" badge
- QR Poster: /poster route — printable counter-card with logo, name, slogan, large QR (encodes live site origin), delivery/WhatsApp/call details; Print/Save-as-PDF button with @media print styles; linked from the public QR section ("Print Table Poster")

## Implemented (2026-08-31, iteration 5)
- Homepage chapter 03 ("To your door, in the camp") stock photo replaced with an AI-generated image (GPT Image 1): delivery rider on a bicycle at golden hour, stored as /app/frontend/public/images/chapter-delivery.jpg (140KB, optimized)
- Admin password rotated at owner's request (value in backend/.env ADMIN_PASSWORD; test_credentials.md updated)

## Implemented (2026-09-01, iteration 6)
- GitHub-ready hardening: .env files gitignored (never tracked), backend/.env.example + frontend/.env.example with placeholders, full project README.md (features, stack, structure, setup, deployment), git history scrubbed of secrets (commit messages + PRD history rewritten; PRD.md now gitignored, exists on disk only)

## Implemented (2026-09-01, iteration 7)
- Deployment prep: frontend/vercel.json (CRA build + SPA rewrites), render.yaml blueprint (backend web service with env var placeholders, auto JWT secret), DEPLOYMENT.md step-by-step guide (GitHub push → MongoDB Atlas → Render backend → Vercel frontend → custom domain), production build verified passing (yarn build, ~31s)

## Backlog
- P1: Real dish photography uploaded by owner via admin panel (replace stock)
- P1: Push to GitHub via Emergent "Save to GitHub" + deploy frontend to Vercel
- P2: Order notifications to owner via email (permanent record)
- P2: Bulk AI photo generation for all dishes with progress
- P2: AI food assistant chatbot (natural-language dish suggestions)
- P3: Specials scheduling by weekday; Kitchen Closed busy-mode switch; multi-language toggle

## Next Tasks
1. Owner connects GitHub account and uses Save to GitHub (repo is scrubbed and ready)
2. Deploy frontend on Vercel, backend on a Python host; QR auto-adapts to final domain
3. Let owner replace key dish photos with real kitchen photos or AI generations
