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

---

## Backend

### Getting started

```bash
cd backend
npm install
npm run dev
```

The server runs at `http://localhost:3000`.

Other useful scripts:

| Script | What it does |
|---|---|
| `npm run dev` | Starts the server in development mode (reloads on changes) |
| `npm run build` | Compiles TypeScript to `dist/` |
| `npm start` | Runs the compiled server (`npm run build` first) |
| `npm run typecheck` | Checks types without compiling |
| `npm run lint` | Runs ESLint |
| `npm run prettier:fix` | Formats the code |

### Database (Docker + Prisma)

Requirement: Docker Desktop must be running.

1. Create the environment files from the examples (from the project root):

   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   ```

   Choose a password (letters, numbers and `_` only) and use it in both files:
   - `.env` → `POSTGRES_PASSWORD`
   - `backend/.env` → inside `DATABASE_URL`, replacing `replace_with_your_local_password`

   Generate a JWT secret and use the same value as `JWT_SECRET` in both files:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   The server does not start if `JWT_SECRET` is missing.

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

#### Seed data

The seed only runs if you manually add `ALLOW_DEMO_SEED=true` to `backend/.env` when you intend to run it. It can be run multiple times without duplicating data. It creates:

- Demo user: `demo@giftory.dev` / `giftory123`
- People: Laura (with interests) and Mamá (no interests, useful for testing empty states)
- 3 gift ideas, 1 idea in the user's library and 1 idea saved for Laura with a private note
- 2 events: Laura's birthday in 12 days and Mamá's birthday in 54 days (dates relative to the current day)

### Architecture (hexagonal)

The backend follows a hexagonal architecture (ports and adapters): the business logic does not depend on Express or Prisma, they are plugged in from the outside.

Folders shown as `<feature>/` do not exist yet: they are created with each feature (e.g. `user/` with registration).

```
backend/src/
├── domain/                      Business core: no Express, no Prisma
│   ├── errors/                  Domain errors (ValidationError, UnauthorizedError...)
│   ├── shared/                  Shared building blocks (Entity)
│   └── <feature>/               e.g. user/, person/, gift-idea/
│       ├── <Entity>.ts          Entity (User, Person...)
│       ├── use-cases/           Application layer: use cases (RegisterUserUseCase...)
│       ├── repositories/        Ports: repository interfaces (UserRepository...)
│       └── services/            Ports: service interfaces (SecurityService...)
├── infrastructure/              Driven adapters: implement the ports
│   ├── prisma-client.ts         Shared PrismaClient instance
│   └── <feature>/               e.g. PrismaUserRepository, BcryptSecurityService
├── ui/                          Driving adapter: HTTP with Express
│   ├── api.ts                   createApi(): middlewares, routes, error handling
│   ├── shared/                  Shared routes (health) and middlewares
│   └── <feature>/               Routes and controllers per feature
└── index.ts                     Entry point: wires the adapters and starts the server
```

| Hexagonal layer | Folder |
|---|---|
| Domain | `domain/` (entities, `errors/`) |
| Application | `domain/<feature>/use-cases/` |
| Ports | `domain/<feature>/repositories/`, `domain/<feature>/services/` |
| Driven adapters (out) | `infrastructure/` (Prisma, bcrypt, JWT) |
| Driving adapters (in) | `ui/` (Express) |

#### Rules

- `domain/` never imports Express, Prisma or anything from `infrastructure/` or `ui/`.
- Use cases receive their dependencies (ports) through the constructor.
- Dependencies are created and wired **only in `index.ts`**. Controllers receive the use cases already built.
- Ports define their own types; they never import from use cases.
- All routes are mounted under `/api`.

#### Error handling

Domain errors are translated to HTTP status codes in `ui/shared/middlewares/error-handler-middleware.ts`:

| Error | Status |
|---|---|
| `ValidationError` | 400 |
| `UnauthorizedError` | 401 |
| `ForbiddenOperationError` | 403 |
| `EntityNotFoundError` | 404 |
| `BusinessConflictError` | 409 |
| Unknown route | 404 |
| Any other error | 500 |

### API endpoints

| Method | Route | Response |
|---|---|---|
| `GET` | `/api/health` | `200 { "status": "ok" }` |
| `POST` | `/api/users/register` | `201 { id, name, email }` · `400` invalid data · `409` email already registered |
| `POST` | `/api/users/login` | `200 { accessToken, user: { id, name, email } }` · `400` invalid data · `401` invalid credentials |
| `GET` | `/api/people` | `200` list of the user's people · `401` no token |
| `POST` | `/api/people` | `201 { id, name, interests }` · `400` invalid data · `401` no token |
| `PATCH` | `/api/people/:id` | `200 { id, name, interests }` · `400` invalid data · `404` not found · `401` no token |
| `DELETE` | `/api/people/:id` | `204` · `404` not found · `401` no token |
| `GET` | `/api/giftideas` | `200` list of public gift ideas |
| `POST` | `/api/giftideas` | `201` created; `400` invalid data; `401` no token |
| `GET` | `/api/giftideas/:id` | `200 { id, name, price, interests }` � `400` invalid id � `404` not found |

#### Authentication

`POST /api/users/login` returns a JWT (`accessToken`) valid for 5 days. Send it in the `Authorization` header of requests to private routes:

```
Authorization: Bearer <accessToken>
```

Wrong password and unknown email return the same `401` error, so the API does not reveal which emails are registered.

#### People

All `/api/people` routes require the `Authorization: Bearer <accessToken>` header. Creating a gift idea also requires authentication; listing and retrieving gift ideas are public.

- A user only sees and modifies their own people. Accessing another user's person returns `404`, so the API does not reveal whether it exists.
- `DELETE` is a soft delete: the person is kept in the database with `deletedAt` set, and is no longer returned by the API.
- `interests` must be values of the `Interest` enum in `prisma/schema.prisma` (e.g. `TRAVEL`, `COOKING`).

#### Gift ideas

- All active gift ideas are public and can be listed or retrieved without authentication.
- A gift idea requires a non-empty name and a non-negative price. Interests are optional and must be values of the `Interest` enum in `prisma/schema.prisma`.
---

## Frontend

### Getting started

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

### Environment variables

The frontend uses `VITE_API_URL` as the target of the Vite proxy for API requests. To configure your local environment, copy `frontend/.env.example` to `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:3000
```

Vite loads `.env.local` automatically. This file is local and must not be committed to Git; `frontend/.env.example` must be included in the repository. If you change the variable, restart Vite.

---
### Structure

The frontend is organized by feature. Each feature has its own folder with its pages and, when it calls the API, its services.

```
frontend/src/
├── features/
│   ├── auth/
│   │   └── pages/               LoginPage, RegisterPage
│   ├── people/
│   │   ├── pages/               PeoplePage
│   │   └── services/            people-service.ts: requests to /api/people
│   └── shared/
│       ├── services/            interests-service.ts: request to /api/interests
│       └── types/               person.ts: Person type and interest labels
├── App.tsx                      Routes, session (access token) and route protection
├── main.tsx                     Entry point: mounts App inside BrowserRouter
└── index.css                    Tailwind import
```

#### Rules

- Requests to the API go through the Vite proxy using relative URLs (`/api/...`), never `http://localhost:3000`.
- When a page needs several requests to the same resource, they go in a service file inside its feature (`features/<feature>/services/`).
- The access token is stored in `sessionStorage` under `giftoryAccessToken`. Services read it from there to send the `Authorization: Bearer <token>` header.
- The list of available interests is loaded from `GET /api/interests`; the backend is the source of truth. `features/shared/types/person.ts` only keeps the Spanish labels (`INTEREST_LABELS`). If an interest has no label, the UI shows its key.

### Shared UI

The components in `frontend/src/features/shared/components/` provide a small UI foundation:

- `Button` for actions (primary, accent or secondary); `Input` for labeled fields and validation errors; `Card` for grouped content.
- `LoadingState` while loading; `ErrorState` for errors; `EmptyState` when there is no content. Pass a `message` to the error and empty states.
- Use the color tokens in `frontend/src/index.css`, the system font and Tailwind's spacing scale. Build for small screens first, then add responsive variants where needed. Keep labels, keyboard focus and readable contrast.

### Pages

| Route | Page | Access |
|---|---|---|
| `/` | Home: shows the API status | Public |
| `/login` | Login form | Public |
| `/register` | Registration form | Public |
| `/people` | List, create, edit and delete the user's people | Private |
| `/library` | View and remove items from the user's library | Private |

Private routes redirect to `/login` when there is no session.

## Notes

Backend and frontend are two independent projects: each one has its own `package.json` and needs its own `npm install`.
