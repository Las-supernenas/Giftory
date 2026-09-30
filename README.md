# Giftory

Find the gift. Remember the person.

Monorepo with the backend and the frontend in separate folders, each with its own dependencies.

## Structure

```
giftory/
├── backend/    API built with Express + TypeScript
└── frontend/   React + Vite + TypeScript
```

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- Docker Desktop

## Backend

```bash
cd backend
npm install
npm start
```

The server runs at `http://localhost:3000`.

Other useful scripts: `npm run typecheck`, `npm run lint`, `npm run prettier:fix`.

## Database (Docker + Prisma)

Requirement: Docker Desktop must be running.

1. Create the environment files from the examples (from the project root):

   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   ```

   Choose a password (letters, numbers and `_` only) and use it in both files:
   - `.env` → `POSTGRES_PASSWORD`
   - `backend/.env` → inside `DATABASE_URL`, replacing `replace_with_your_local_password`

2. Start the services (from the project root):

   ```bash
   docker compose up -d --build
   ```

   If you only need the database (for example, to run the seed):

   ```bash
   docker compose up -d db
   ```

3. Create the tables and load the seed data (from `backend/`):

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

   To start from scratch (drops the database, applies the migrations and runs the seed):

   ```bash
   npx prisma migrate reset
   ```

   To browse the data: `npx prisma studio`

### Seed data

The seed can be run multiple times without duplicating data. It creates:

- Demo user: `demo@giftory.dev` / `giftory123`
- People: Laura (with interests) and Mamá (no interests, useful for testing empty states)
- 3 gift ideas, 1 idea in the user's library and 1 idea saved for Laura with a private note
- 2 events: Laura's birthday in 12 days and Mamá's birthday in 54 days (dates relative to the current day)

## Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

The frontend uses `VITE_API_URL` as the target for Vite's development proxy. To configure your local environment, copy `frontend/.env.example` to `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:3000
```

Vite loads `.env.local` automatically. Keep `.env.local` local and do not commit it; commit `frontend/.env.example` as the shared template. Restart Vite after changing the variable.

## Notes

Backend and frontend are two independent projects: each one has its own `package.json` and needs its own `npm install`.
