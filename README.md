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
| `npm test` | Runs the backend unit tests without a database |
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

   Add your OpenRouter API key as `OPENROUTER_API_KEY` to both ignored files:
   - `backend/.env` for running the backend directly with `npm run dev`.
   - The root `.env` for Docker Compose; `compose.yml` passes it only to the backend container.

   Use the same key in both files if you switch between local and Docker execution. Replace the placeholder in `backend/.env`; never commit either `.env` file. The backend does not start without this variable.

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
- Demo creators: `lucia@giftory.dev` and `marcos@giftory.dev` (same password), who own the public demo gift ideas
- People: Laura (with interests) and Mamá (no interests, useful for testing empty states)
- 3 gift ideas of the demo user, plus 38 public demo ideas covering every interest, with a wide range of prices, descriptions, product links and photos
- 13 ideas in the demo user's library (two pages, to show pagination) and 1 idea saved for Laura with a private note
- 2 events: Laura's birthday in 12 days and Mamá's birthday in 54 days (dates relative to the current day)

Demo photos live in `backend/prisma/seed-images/` (committed to the repository; JPG, PNG or WebP). The seed copies them to `backend/uploads/giftideas/` with server-generated names; a missing photo only produces a warning. The seed fails if any interest has no demo idea. Running it again updates the demo ideas instead of duplicating them.

Ideas owned by the demo creators (`lucia@giftory.dev`, `marcos@giftory.dev`) that are no longer in the seed list (for example, after renaming an idea in `seed.ts`) are soft-deleted, so Discovery always shows exactly the current demo ideas. This also applies to ideas created manually with those two accounts. Ideas created with any other account, including the demo user, are never touched.

#### Server demo ideas (manual, one time)

The server demo seed is separate from the development seed above. It is **not run by the deployment workflow**. After deploying the application and starting the database, run it manually from the project directory on the server:

1. Add `DEMO_ACCOUNT_PASSWORD` to the server's ignored root `.env`. Use a unique password of 8–20 characters with uppercase and lowercase letters, a number, and a symbol. Compose passes this value to the backend container.
2. Run:

   ```bash
   docker compose up -d db
   docker compose run --rm -e ALLOW_SERVER_DEMO_SEED=true backend npx tsx prisma/seedDemo.ts
   ```

This creates the account `demotest@gmail.com` and the public gift ideas from `backend/prisma/seed-ideas.ts`. It copies available photos into the persistent gift-idea uploads volume. The command is guarded by `ALLOW_SERVER_DEMO_SEED=true`; it is not part of normal deployment. It can be rerun safely for ideas already created, but it does not change the password of an account that already exists.

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
| Invalid recommendation provider response or unavailable provider | 502 |
| Recommendation provider timeout | 504 |
| Unknown route | 404 |
| Any other error | 500 |

### API endpoints

| Method | Route | Response |
|---|---|---|
| `GET` | `/api/health` | `200 { "status": "ok" }` |
| `POST` | `/api/users/register` | `201 { id, name, email }` · `400` invalid data · `409` email already registered |
| `POST` | `/api/users/login` | `200 { accessToken, user: { id, name, email } }` · `400` invalid data · `401` invalid credentials |
| `GET` | `/api/users/session` | `200 { id, name }` (not cached) · `401` no valid session |
| `GET` | `/api/people` | `200` list of the user's people, including `savedIdeasCount` · `401` no token |
| `POST` | `/api/people` | `201 { id, name, interests }` · `400` invalid data · `401` no token |
| `PATCH` | `/api/people/:id` | `200 { id, name, interests }` · `400` invalid data · `404` not found · `401` no token |
| `DELETE` | `/api/people/:id` | `204` · `404` not found · `401` no token |
| `POST` | `/api/people/:id/recommendations` | `200 { recommendations: [...] }` · `400` invalid preferences · `401` no token · `404` person not found · `502` provider failure or invalid response · `504` provider timeout |
| `GET` | `/api/giftideas` | `200` list of public gift ideas |
| `POST` | `/api/giftideas` | `201` created; `400` invalid data; `401` no token |
| `GET` | `/api/giftideas/:id` | `200` gift idea including optional description, product URL and image filename; `400` invalid id; `404` not found |
| `PATCH` | `/api/giftideas/:id` | `200` updated gift idea; only its creator can edit it |
| `POST` | `/api/giftideas/:id/image` | `200 { imageFilename }`; upload or replace the creator's image using multipart form field `image` |
| `DELETE` | `/api/giftideas/:id/image` | `204`; remove the creator's image |
| `GET` | `/api/giftideas/images/:filename` | Public image file |
| `GET` | `/api/people/:personId/savedideas` | `200` list of the user's saved ideas for that person |
| `POST` | `/api/people/:personId/savedideas` | `201` assign an idea to that person |
| `PATCH` | `/api/people/:personId/savedideas/:id` | `200` update the private note |
| `DELETE` | `/api/people/:personId/savedideas/:id` | `204` remove the assignment |
| `GET` | `/api/people/:personId/events` | `200` list of the person's events · `400` invalid id · `404` person not found · `401` no token |
| `POST` | `/api/people/:personId/events` | `201 { id, name, date }` · `400` invalid data · `404` person not found · `401` no token |
| `PATCH` | `/api/events/:id` | `200 { id, name, date }` · `400` invalid data · `404` not found · `401` no token |
| `DELETE` | `/api/events/:id` | `204` · `404` not found · `401` no token |
| `GET` | `/api/library` | `200` library items with `giftIdea` details and `canEditGiftIdea` · `401` not authenticated |
| `POST` | `/api/library` | `201 { id, giftIdea }` · `400` invalid data · `404` gift idea not found · `409` already in the library · `401` not authenticated |
| `DELETE` | `/api/library/:id` | `204` · `400` invalid id · `404` not found · `401` not authenticated |

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

#### Gift recommendations (Gifty)

The authenticated `POST /api/people/:id/recommendations` route recommends up to five existing public gift ideas for a person owned by the current user. All request fields are optional: `budget` (a positive, inclusive maximum in euros), `ageRange`, `occasion`, and `additionalInfo`. An empty eligible catalog returns `{ "recommendations": [] }` without calling OpenRouter. Returned gift names and prices come from the database, not the model.

The backend uses OpenRouter model `minimax/minimax-m3.1-flash:free`. A direct provider smoke request returned structured JSON successfully. The free model can be unavailable or rate limited; its JSON mode does not replace the backend's runtime response validation. Each action makes at most one provider request, with a 30-second timeout and no automatic retry. Provider failures or invalid responses return a safe `502`; timeouts return `504`.

To try it locally, start the backend and frontend, log in, open `/people`, expand a person you own, optionally enter a budget or other preferences, and click **Haz tu magia Gifty**. The page shows the recommendations or an empty/error message. The OpenRouter key stays on the backend; do not put it in a `VITE_` variable or browser code.

For Docker Compose on your machine, add `OPENROUTER_API_KEY` to the ignored root `.env` before `docker compose up -d --build`. For the EC2 deployment, set it in the ignored `/home/ubuntu/Giftory/.env` on the server before deploying; the deployment runs `docker compose` from that directory. Keep the real key out of Git, workflow files, Docker images, and logs. Changing the key requires recreating the backend container.

#### Events

All Event routes require the `Authorization: Bearer <accessToken>` header.

- An event belongs to a person, and ownership is checked through that person: a user only sees and modifies events of their own (not deleted) people. Otherwise the API returns `404`.
- `date` is a calendar day in `YYYY-MM-DD` format (e.g. `2026-10-23`), both in requests and responses. It must be a real date; past dates are allowed.
- `name` is required, trimmed, 1–100 characters.
- `DELETE` is a hard delete: the event is removed from the database.
- Events are returned ordered by date.

#### Library

All `/api/library` routes require authentication.

- The Library is the user's private collection of existing public gift ideas.
- `POST` receives `{ giftIdeaId }`. It does not create a new gift idea: it only links the existing idea to the authenticated user. The `userId` is never sent by the frontend; it comes from the session.
- A gift idea can be in a user's library only once: saving it again returns `409`.
- `DELETE /api/library/:id` uses the **library item id** (the `id` returned by `GET`/`POST`), not the gift idea id. It only removes the idea from the library; the public gift idea is not deleted.
- A user only sees and removes their own library items. Another user's item returns `404`, so the API does not reveal whether it exists.

#### Gift ideas

- All active gift ideas are public and can be listed or retrieved without authentication.
- A gift idea requires a non-empty name and a non-negative price. Interests are optional and must be values of the `Interest` enum in `prisma/schema.prisma`.
- Gift idea responses also include `description`, `productUrl` and `imageFilename`; each is `null` when absent. `GET /api/people` includes `savedIdeasCount` for each person. Library and saved idea responses include `canEditGiftIdea` so the frontend can show creator-only editing controls.
- Authenticated creators can edit their idea's name, price, interests, public description and product URL. Product URLs must use `http` or `https`. Changes to a public idea appear in Discovery, Library and saved ideas.
- A gift idea can have one optional JPG, PNG or WebP image of up to 5 MB. Uploads and removals require authentication and creator ownership; uploaded files receive a server-generated filename. The image URL is `/api/giftideas/images/<imageFilename>`.
- In local backend development, images are stored in `backend/uploads/giftideas/`. In Docker, they are stored at `/app/uploads/giftideas/` in the named volume `giftory_giftidea_images`. The volume survives `docker compose up -d --build` and container replacement. `docker compose down -v` deletes the volume and its images.
- Prisma stores the image filename, not the image file. Apply the included Prisma migration to existing databases (`npx prisma migrate dev` locally or `npx prisma migrate deploy` for deployment).
---

## Frontend

### Getting started

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

### Automated tests

Run the frontend component tests with:

```bash
cd frontend
npm test
```

The tests use mocked API calls and do not require a running backend or database.

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
│   ├── events/
│   │   ├── components/          EventsSection: list, create, edit and delete a person's events
│   │   ├── services/            events-service.ts: requests to the Event endpoints
│   │   └── types/               event.ts: PersonEvent and EventInput types
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
- `AppNavigation` for the main navigation: receives `userName` (null without a session) and `onLogout` from `App`. Logo and links on the left; the user greeting ("¡Hola, Julia!" with an avatar initial) and the logout button on the right. Uses `NavLink` to highlight the current page. On mobile the links take a full-width row and logout is an icon button.
- `GiftIdeaFilters` for the Discovery and Library filters: search by name on top, and a filter panel with interests grouped by category and a price range (sidebar on desktop, collapsible on mobile). The filtering rules live in `features/shared/gift-idea-filters.ts` and the interest groups in `features/shared/interest-categories.ts`.
- `Pagination` for page controls ("Anterior", page numbers, "Siguiente"); the calculations live in `features/shared/pagination.ts`.

### Pages

| Route | Page | Access |
|---|---|---|
| `/` | Discovery: public gift ideas with optional descriptions, product links and images; authenticated users can create ideas and save them to their library | Public |
| `/login` | Login form | Public |
| `/register` | Registration form | Public |
| `/people` | Manage and search people by name; expand one person's details to see events, saved ideas, and Gifty recommendations, assign ideas from the library, and edit private notes | Private |
| `/library` | View and remove library items, assign ideas to people, and edit gift ideas created by the user | Private |

Private routes redirect to `/login` when there is no session.
After login, the user is redirected to Discovery (`/`).
After a successful registration, the user is redirected to Login with the message "Cuenta creada correctamente. Inicia sesión" Registration does not log the user in.
The main navigation (`AppNavigation`) is shown on every page. With a session it greets the user by name, links to Discovery, People and Library, and shows the logout button; without a session it links to Discovery, Login and Register. The current page is highlighted. The user's name comes from `GET /api/users/session` on page load and from the login response; the frontend never reads the token.
Discovery and Library can be filtered by name (case and accent insensitive), interests (an idea matches if it has ANY of the selected interests) and minimum/maximum price (both included). Filters combine: an idea must match all of them. Filtering is done in the browser on the loaded list, which is never modified. In Library, only the user's own saved ideas are filtered. All interest categories are always shown; a category with no matching ideas shows "Aún no hay ideas aquí.".
Every interest from `GET /api/interests` is shown in its category; interests without matching ideas are disabled.
Both lists are paginated on the client (9 ideas per page); changing a filter goes back to page 1.
People can be searched by name with the same rules (case and accent insensitive, trimmed); the shared helper is `features/shared/normalize-text.ts`.

## Notes

Backend and frontend are two independent projects: each one has its own `package.json` and needs its own `npm install`.
