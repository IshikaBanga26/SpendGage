# SpendGage

**AI-powered receipt and expense cost-per-unit calculator for indie creators, home bakers, and crafters.**

Micro-businesses lose profit silently as ingredient costs rise — SpendGage scans grocery receipts with AI, tracks real-time ingredient costs, and automatically recalculates product margins so creators always know exactly what to charge.

---

## Live Demo

- **App:** https://spendgage.pages.dev
- **API:** https://spendgage.onrender.com

> Backend is hosted on a free tier and may take 30–50 seconds to wake up on first request after a period of inactivity.

---

## The Problem

Home bakers, candle makers, jewelry sellers, and other indie creators buy raw materials whose prices shift constantly — flour, butter, packaging, beads, wax. Most never update their selling prices to match, because manually recalculating cost-per-unit across every product, every time an ingredient price changes, is tedious and easy to forget. Profit margins quietly shrink and nobody notices until it's a real problem.

## The Solution

1. Upload a photo of any grocery or supply receipt
2. AI extracts every item, quantity, and price automatically
3. Match items to your ingredients (or create new ones on the spot)
4. Every product using that ingredient recalculates its margin instantly
5. Get an email alert the moment a product's margin drops below a safe threshold

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express.js (ESM) |
| Database | PostgreSQL (hosted on Neon) via raw `pg` driver |
| AI | Groq API (Llama 4) — receipt parsing & pricing advice |
| Auth | JWT + bcryptjs |
| Validation | Zod |
| File Uploads | Multer |
| Automation | n8n (workflow automation) |
| Email | Nodemailer / SMTP via n8n |

---

## Core Features

- **JWT authentication** — register and login with hashed passwords
- **Ingredients tracking** — full CRUD with historical price logging
- **Product recipes** — link ingredients to products with exact quantities used
- **Automatic margin cascading** — a PostgreSQL trigger recalculates every affected product's margin the instant an ingredient's cost changes — no application-level logic required
- **AI receipt parsing** — upload a receipt image, get structured JSON of items/quantities/prices back in seconds, with automatic fuzzy-matching to existing ingredients
- **AI pricing advisor** — generates specific, numbers-based pricing recommendations from your live product and ingredient data
- **Automated email workflows (n8n)** — nightly margin alerts, low-stock alerts, receipt-processed notifications, and a 3-part onboarding email sequence for new users

---

## Architecture Highlight — Cascading Margin Recalculation

The most technically interesting piece of this project lives entirely in PostgreSQL, not application code:

```sql
-- Recalculates a single product's cost and margin
CREATE FUNCTION recalculate_product_cost(p_id UUID) ...

-- Fires automatically whenever an ingredient's cost changes,
-- recalculating every product that uses it
CREATE TRIGGER on_ingredient_cost_change
  AFTER UPDATE OF current_unit_cost ON ingredients
  FOR EACH ROW EXECUTE FUNCTION trigger_cascade_product_recalc();
```

When a receipt updates an ingredient's price, the database — not Node.js — handles the cascade. This guarantees consistency regardless of how the ingredient was updated (via the API, a script, or directly in the database), and keeps the recalculation atomic within a single transaction.

---

## Project Structure
SpendGage/

├── backend/

│   ├── src/

│   │   ├── db/

│   │   │   ├── index.js          # PostgreSQL connection pool

│   │   │   └── schema.sql        # Tables, functions, triggers

│   │   ├── middleware/

│   │   │   └── auth.js           # JWT verification middleware

│   │   ├── routes/

│   │   │   ├── auth.js           # Register / login

│   │   │   ├── ingredients.js    # Ingredient CRUD + price history

│   │   │   ├── products.js       # Product CRUD + recipe management

│   │   │   ├── receipts.js       # Upload, AI parse, apply to inventory

│   │   │   ├── ai.js             # AI margin advice endpoint

│   │   │   └── internal.js       # Internal endpoints used by n8n

│   │   ├── services/

│   │   │   └── ai.js             # Groq API integration

│   │   └── index.js              # Express app entry point

│   └── package.json

│

├── frontend/

│   ├── src/

│   │   ├── pages/

│   │   │   ├── Landing.jsx

│   │   │   ├── Login.jsx / Register.jsx

│   │   │   ├── Dashboard.jsx

│   │   │   ├── Ingredients.jsx

│   │   │   ├── Products.jsx

│   │   │   ├── Receipts.jsx

│   │   │   └── AIAdvice.jsx

│   │   ├── components/layout/

│   │   │   ├── Layout.jsx

│   │   │   └── ProtectedRoute.jsx

│   │   ├── lib/

│   │   │   ├── api.js            # Axios instance with JWT interceptor

│   │   │   └── format.js         # Display helpers (initials, etc.)

│   │   └── App.jsx

│   └── package.json

│

└── README.md

---

## Getting Started

### Prerequisites
- Node.js 18+
- A free [Neon](https://neon.tech) PostgreSQL database
- A free [Groq](https://console.groq.com) API key
- A Gmail account with an App Password (for email features)

### Backend

```bash
cd backend
npm install
cp .env.example .env  
node src/db/index.js  
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### n8n (optional, for automation workflows)

```bash
npx n8n@1.68.0
```

Then open `http://localhost:5678` and import/build the workflows described below.

---

## Environment Variables

**`backend/.env`**
```env
DATABASE_URL=
JWT_SECRET=
GROQ_API_KEY=
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
INTERNAL_API_KEY=
GMAIL_USER=
GMAIL_APP_PASSWORD=
N8N_RECEIPT_WEBHOOK=
N8N_REGISTER_WEBHOOK=
```

**`frontend/.env.production`**
```env
VITE_API_URL=https://spendgage.onrender.com
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Log in, returns JWT |
| `GET` | `/api/ingredients` | List all ingredients |
| `POST` | `/api/ingredients` | Create an ingredient |
| `PATCH` | `/api/ingredients/:id` | Update an ingredient (triggers cascade) |
| `DELETE` | `/api/ingredients/:id` | Delete an ingredient |
| `GET` | `/api/ingredients/:id/history` | Price history for one ingredient |
| `GET` | `/api/products` | List all products with computed margins |
| `GET` | `/api/products/:id` | Single product with full recipe breakdown |
| `POST` | `/api/products` | Create a product, optionally with a recipe |
| `PATCH` | `/api/products/:id` | Update product or its recipe |
| `DELETE` | `/api/products/:id` | Delete a product |
| `GET` | `/api/receipts` | List all receipts |
| `GET` | `/api/receipts/:id` | Single receipt with parsed line items |
| `POST` | `/api/receipts/upload` | Upload a receipt image for AI parsing |
| `POST` | `/api/receipts/:id/apply` | Apply parsed costs to inventory (auto-creates ingredients if needed) |
| `GET` | `/api/ai/advice` | Get AI-generated pricing recommendations |
| `GET` | `/api/internal/low-margin-products` | Used by the nightly margin alert workflow |
| `GET` | `/api/internal/low-stock-ingredients` | Used by the low-stock alert workflow |

---

## Automation Workflows (n8n)

Four workflows built and tested against the live backend:

| Workflow | Trigger | Action |
|---|---|---|
| **Nightly margin alert** | Schedule — every day at 11 PM | Emails users whose product margins have dropped below their set threshold |
| **Receipt processed notification** | Webhook — fired after AI parsing completes | Confirms the receipt was scanned and is ready for review |
| **Low stock alert** | Schedule — every day at 9 AM | Emails users whose ingredient stock has fallen below their set threshold |
| **New user onboarding** | Webhook — fired on registration | 3-part email sequence: welcome (day 0), ingredients reminder (day 1), receipt-scanning tip (day 3) |

The backend calls these workflows via webhook but does not depend on them — every core feature (receipt scanning, margin calculation, AI advice) works fully even if n8n is offline.

---

## Built By

**Ishika Banga** — [GitHub](https://github.com/IshikaBanga26) · [Portfolio](https://ishika-banga.pages.dev)