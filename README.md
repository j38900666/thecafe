# The Cafeteria — Good Food • Good Mood

A premium digital menu & ordering platform for **The Cafeteria**, GC CRPF Doyapur, Silchar.
Customers browse a photo-rich menu, add dishes to a cart, and order via WhatsApp — while the
owner manages everything (items, prices, photos, availability, today's specials, orders) from an
admin panel, including AI-generated dish photography.

## Features

- **Digital menu** — 8 categories, 100+ items, per-dish real photos, sticky category navigation, live search, Veg/Non-Veg filters
- **Shopping cart** — subtotal only (delivery & packaging charges confirmed manually by the restaurant), order saved to database + sent to WhatsApp (+91 9101328562)
- **Today's Specials** — owner stars dishes; a featured strip appears on the homepage
- **Order alerts** — admin dashboard polls for new orders with sound + browser push notifications
- **AI dish photos** — one-click photo generation per dish using OpenAI GPT Image 1 (via Emergent Universal Key)
- **QR digital menu + printable poster** — scannable code opens the live site; `/poster` prints a counter card
- **Admin panel** (`/admin`) — manage items, prices, photos (URL/upload/AI), categories, availability, veg/non-veg, specials, and order statuses

## Tech Stack

| Layer    | Tech                                                        |
|----------|-------------------------------------------------------------|
| Frontend | React 19, Tailwind CSS, framer-motion, lenis, qrcode.react  |
| Backend  | FastAPI, Motor (async MongoDB), PyJWT, bcrypt               |
| Database | MongoDB                                                     |
| AI       | emergentintegrations (OpenAI GPT Image 1)                   |

## Project Structure

```
/app
├── backend/
│   ├── server.py            # FastAPI app: menu, orders, auth, AI image generation
│   ├── requirements.txt
│   └── .env.example         # copy to .env and fill in
├── frontend/
│   ├── public/images/       # AI-generated brand imagery
│   ├── src/
│   │   ├── components/      # Navbar, Hero, Marquee, Manifesto, MenuSection,
│   │   │                    # SpecialsSection, CartDrawer, QRSection, Footer, ui/
│   │   ├── pages/           # Landing.jsx, Admin.jsx, Poster.jsx
│   │   ├── context/         # CartContext (localStorage-persisted cart)
│   │   └── api.js           # axios client (uses REACT_APP_BACKEND_URL)
│   └── .env.example
└── design_guidelines.json   # editorial organic-luxury design system
```

## Getting Started

### Backend

```bash
cd backend
cp .env.example .env        # fill in real values
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

The menu auto-seeds (102 items from the original menu) on first run when the database is empty.

### Frontend

```bash
cd frontend
cp .env.example .env        # set REACT_APP_BACKEND_URL to your backend
yarn install
yarn start
```

## Environment Variables

**backend/.env**

| Variable          | Purpose                                          |
|-------------------|--------------------------------------------------|
| `MONGO_URL`       | MongoDB connection string                        |
| `DB_NAME`         | Database name                                    |
| `CORS_ORIGINS`    | Allowed origins (`*` for dev)                    |
| `JWT_SECRET`      | Secret for signing admin JWTs (long random hex)  |
| `ADMIN_PASSWORD`  | Admin panel password                             |
| `EMERGENT_LLM_KEY`| Emergent Universal Key (AI photo generation)     |

**frontend/.env**

| Variable                | Purpose                              |
|-------------------------|--------------------------------------|
| `REACT_APP_BACKEND_URL` | Public URL of the backend (no /api)  |

> `.env` files are gitignored. Never commit real secrets.

## Deployment

- **Vercel (frontend)**: deploy `frontend/` as a Create React App project; set `REACT_APP_BACKEND_URL` env var.
- **Backend**: any Python host (Render/Railway/Fly); set the backend env vars; routes are prefixed `/api`.
- The QR code and poster automatically encode whatever domain the site is served from.

## Business Details

- **Name**: The Cafeteria — *Good Food • Good Mood*
- **Address**: GC CRPF Doyapur, Silchar, Assam
- **WhatsApp orders**: +91 91013 28562 · **Call**: +91 87218 24729
- Home delivery available (charges apply) across campus & within 1 km of camp
