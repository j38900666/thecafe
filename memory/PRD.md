# PRD — The Cafeteria (Restaurant Ordering Website + Admin)

## Problem Statement
Premium, mobile-friendly restaurant & cafeteria website with full customer ordering system and admin dashboard for "The Cafeteria" (Good Food Good Mood), GC CRPF Doyapur, Silchar. WhatsApp 9101328562, Phone 8721824729. Home delivery (charges apply), party bookings.

## User Choices
- Admin auth: Emergent Google login
- Payments: None online — Cash on Delivery + WhatsApp orders only
- Images: stock food images; user-provided logo
- Style: Elegant & premium (dark theme, gold/amber accents, Playfair Display + Manrope)
- Extras: include all (reviews, best-sellers, today's special, offers, QR code)

## Architecture
- Backend: FastAPI + MongoDB (motor), `/api` prefix. Emergent Google OAuth (session cookie).
- Frontend: React (CRA) + Tailwind + lucide-react + sonner + qrcode.react.
- Cart: React Context + localStorage (guest). Orders tracked by mobile number.

## Implemented (2026-06)
- Homepage: hero (logo, name, tagline, address, CTAs: View Menu/Order Now/WhatsApp/Call), delivery banner with charges, offer strip, Today's Special, Best Sellers, prominent Party Booking section, Reviews, Contact + Menu QR code.
- Digital Menu: 8 categories, search, category filter pills, item cards (photo, name, price, desc, veg/non-veg badge, qty selector, add to cart), bestseller tag.
- Cart sheet: add/update qty/remove, live subtotal.
- Checkout: name, mobile, pickup/delivery, address, delivery instructions, COD/Online, auto delivery+packaging charges, free delivery above threshold. Place Order + Order via WhatsApp (formatted summary to wa.me).
- My Orders: lookup by mobile, order status, one-click reorder.
- Admin dashboard (Google login, first user = admin): Menu CRUD + image upload (base64) + availability/bestseller/special flags; Orders list + status update; Reviews delete; Store Settings (delivery/packaging/free-above/offer banner/party note).
- Seed: 22 menu items across 8 categories, 3 reviews, default settings.

## Backlog / Next
- P2: Object-storage for uploaded images (currently base64 in Mongo).
- P2: Auto order/booking notifications to restaurant (email/WhatsApp).

## Iteration 2 (2026-06)
- **Live rotating Offers banner** on homepage (auto-rotates active offers every 4s, clickable dots); admin **Offers** tab to add/toggle/delete offers (live on site). Seeded 3 offers.
- **Table & Party Booking**: homepage booking form + "Book Table" nav link + "Book Online" CTA in party section. Types: Table Reservation, Birthday Party, Anniversary Party, Kitty Party, Get Together (advance booking). Submit or send via WhatsApp. Admin **Bookings** tab lists requests, updates status (pending/confirmed/cancelled) and deletes.
- Backend: /api/offers (public) + /api/offers/admin, full offers CRUD; /api/bookings (create with BK counter + server-side 10-digit mobile & no-past-date validation), GET/PUT status/DELETE (admin). Tested 100% backend + frontend (iteration_2).
