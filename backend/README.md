## Backend architecture (hexagonal)

The backend follows a hexagonal architecture (ports and adapters). Directories marked with * already in progress.
```
backend/src/
├── domain/  *                   Business core: no Express, no Prisma
│   ├── errors/ *                Domain errors (ValidationError, UnauthorizedError...)
│   ├── shared/  *               Shared building blocks (Entity)
│   └── <feature>/               e.g. user/, person/, gift-idea/
│       ├── <Entity>.ts          Entity (User, Person...)
│       ├── use-cases/           Application layer: use cases (RegisterUserUseCase...)
│       ├── repositories/        Ports: repository interfaces (UserRepository...)
│       └── services/            Ports: service interfaces (SecurityService...)
├── infrastructure/ *            Driven adapters: implement the ports
│   ├── prisma-client.ts -DONE-    Shared PrismaClient instance
│   └── <feature>/               e.g. PrismaUserRepository, BcryptSecurityService
├── ui/   *                      Driving adapter: HTTP with Express
│   ├── api.ts(in progress)      createApi(): middlewares, routes, error handling
│   ├── shared/   *              Shared routes (health) and middlewares
│   └── <feature>/               Routes and controllers per feature
└── index.ts(in progress)        Composition root: wires the adapters and starts the server
```

### Rules

- `domain/` never imports Express, Prisma or anything from `infrastructure/` or `ui/`.
- Use cases receive their dependencies (ports) through the constructor.
- Dependencies are created and wired **only in `index.ts`**. Controllers receive the use cases already built.
- Ports define their own types; they never import from use cases.
- Domain errors are translated to HTTP status codes in `ui/shared/middlewares/error-handler-middleware.ts`:

| Error | Status |
|---|---|
| `ValidationError` | 400 |
| `UnauthorizedError` | 401 |
| `ForbiddenOperationError` | 403 |
| `EntityNotFoundError` | 404 |
| `BusinessConflictError` | 409 |
| Any other error | 500 |

### Available endpoints

- `GET /api/health` → `200 { "status": "ok" }`