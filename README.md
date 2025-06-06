# Legacy Pro Repository

This repository contains the full codebase for Legacy Pro, version 6.7 with improvements based on plans discussed.

- `backend/`: Node.js + Express.js + Prisma API server
- `frontend/`: Next.js + React + Tailwind CSS PWA client

## Setup

### Backend

1. Copy `.env.production` with appropriate environment variables.
2. Run `npm install` in `backend/`.
3. Run `npx prisma migrate dev` to setup the database.
4. Run `npm run build` and then `npm start` or `npm run dev`.

### Frontend

1. Copy `.env.production` with appropriate environment variables.
2. Run `npm install` in `frontend/`.
3. Run `npm run build` and `npm start` (or use `npm run dev`).

## Scripts

### Backend

- `npm run dev`: Run with nodemon for development.
- `npm run build`: Compile TypeScript to JavaScript.
- `npm run start`: Start the compiled server.
- `npm run migrate`: Run Prisma migrations.

### Frontend

- `npm run dev`: Start Next.js development server.
- `npm run build`: Build for production.
- `npm run start`: Start the Next.js production server.

## Folder Structure

Refer to detailed documentation in `/docs` for full structure and implementation details.

