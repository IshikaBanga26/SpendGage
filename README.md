# SpendGage Backend

REST API for SpendGage — an AI-powered receipt and expense cost-per-unit calculator for indie creators, home bakers, and crafters.

## Tech Stack

- **Runtime:** Node.js with Express.js (ESM modules)
- **Database:** PostgreSQL (Neon) with raw `pg` driver
- **AI:** Groq API (Llama 4) for receipt image parsing and margin advice
- **Auth:** JWT with bcryptjs
- **Validation:** Zod
- **File Uploads:** Multer

## Features

- JWT authentication (register/login)
- Ingredients CRUD with price history tracking
- Products with recipe management (ingredient → product relationships)
- Automatic margin recalculation via PostgreSQL triggers — when ingredient cost changes, all linked product margins update instantly
- AI receipt parsing — upload a grocery receipt image, AI extracts items, quantities, and unit costs
- AI margin advice — get pricing recommendations based on your current products and costs

## Project Structure

src/
├── db/
│   ├── index.js        # PostgreSQL connection pool
│   └── schema.sql      # Tables, triggers, and functions
├── middleware/
│   └── auth.js         # JWT authentication middleware
├── routes/
│   ├── auth.js         # POST /api/auth/register, /api/auth/login
│   ├── ingredients.js  # CRUD + price history
│   ├── products.js     # CRUD + recipe management
│   ├── receipts.js     # Upload, parse, apply
│   └── ai.js           # Margin advice
└── services/
└── ai.js           # Groq API integration

## Getting Started

```bash
npm install
cp .env.example .env

node src/db/index.js   
npm run dev
```

## Environment Variables

DATABASE_URL=
JWT_SECRET=
GROQ_API_KEY=
PORT=5000
FRONTEND_URL=http://localhost:5173

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/ingredients | Get all ingredients |
| POST | /api/ingredients | Create ingredient |
| PATCH | /api/ingredients/:id | Update ingredient |
| DELETE | /api/ingredients/:id | Delete ingredient |
| GET | /api/products | Get all products with margins |
| POST | /api/products | Create product with recipe |
| PATCH | /api/products/:id | Update product |
| DELETE | /api/products/:id | Delete product |
| POST | /api/receipts/upload | Upload and parse receipt image |
| POST | /api/receipts/:id/apply | Apply receipt costs to inventory |
| GET | /api/ai/advice | Get AI pricing recommendations |

## Automation (n8n)

Four automated workflows built with n8n:

- **Nightly margin alert** — runs at 11pm, emails users when product margins drop below threshold
- **Receipt notification** — triggered via webhook after AI parsing, confirms receipt was processed
- **Low stock alert** — runs at 9am, emails users when ingredients fall below stock threshold  
- **User onboarding** — 3-email sequence triggered on registration (day 0, day 1, day 3)