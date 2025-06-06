# legacy-pro-full

## Overview
Legacy Pro is a full‑stack platform built with **Next.js**, **React**, **Node.js**, **PostgreSQL**, and **TailwindCSS**. It includes:

- Core application
- Entity Builder
- Trust Builder
- Smart Vault
- AI Assistant (OpenAI)
- Notifications
- Admin panel
- Billing (Stripe)
- FAQ & Legal pages
- Demo / Sandbox mode
- API documentation
- Third‑party integrations (Stripe, OpenAI, SMTP)
- Unit tests

## Project Structure
```text
/backend
  prisma/
  src/
    controllers/
    models/
    routes/
    services/
    middleware/
    utils/
  package.json
/frontend
  components/
  hooks/
  pages/
  public/
  styles/
  next.config.js
  tailwind.config.js
/docs
  openapi.yaml
/scripts
/tests
```

## Getting Started

### Prerequisites
- Node.js ≥ 18
- PostgreSQL ≥ 14
- Stripe account & API keys
- OpenAI API key
- SMTP credentials

### Local Setup
```bash
git clone https://github.com/swondersalot/legacy-pro-full.git
cd legacy-pro-full
cp .env.example .env   # populate all required environment variables
docker compose up -d postgres
npm install -w backend -w frontend
npm run db:migrate --workspace=backend
npm run dev --workspace=frontend
```

### Running Tests
```bash
npm run test --workspaces
```

### Deployment
See `docs/deployment.md` for step‑by‑step instructions on deploying:
- **Frontend** → Vercel (or any Node‑compatible host)
- **Backend**  → Fly.io / Render / DigitalOcean App Platform
- **Database** → Supabase / Neon / Railway

## License
MIT
