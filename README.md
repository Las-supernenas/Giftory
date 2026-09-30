# Giftory

Encuentra el regalo. Recuerda a la persona.

Monorepo con el backend y el frontend en carpetas separadas, cada uno con sus propias dependencias.

## Estructura

giftory/
├── backend/ API en Express + TypeScript
└── frontend/ React + Vite + TypeScript

## Requisitos

- Node.js 20.19+ o 22.12+
- npm

## Backend

```bash
   cd backend
   npm install
   npm start
```

El servidor arranca en `http://localhost:3000`.

Otros scripts útiles: `npm run typecheck`, `npm run lint`, `npm run prettier:fix`.

## Base de datos (Docker + Prisma)

Requisito: Docker Desktop abierto.

1. Crea los archivos de entorno a partir de los ejemplos (desde la raíz):

```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
```

   Elige una contraseña (solo letras, números y `_`) y ponla en los dos archivos:
   - `.env` → `POSTGRES_PASSWORD`
   - `backend/.env` → dentro de `DATABASE_URL`, en el lugar de `replace_with_your_local_password`

2. Levanta PostgreSQL:

```bash
   docker compose up -d db
```

3. Crea las tablas y carga los datos de prueba (desde `backend/`):

```bash
   npx prisma migrate dev
   npx prisma db seed
```

   Para empezar de cero (borra la base de datos, aplica las migraciones y ejecuta el seed):

```bash
   npx prisma migrate reset
```

   Para ver los datos en el navegador: `npx prisma studio`

### Datos de prueba (seed)

El seed se puede ejecutar varias veces sin duplicar datos. Crea:

- Usuario demo: `demo@giftory.dev` / `giftory123`
- Personas: Laura (con intereses) y Mamá (sin intereses, para probar estados vacíos)
- 3 ideas de regalo, 1 idea en la biblioteca del usuario y 1 idea guardada para Laura con nota privada
- 2 eventos: cumpleaños de Laura dentro de 12 días y de Mamá dentro de 54 días

## Frontend

```bash
   cd frontend
   npm install
   npm run dev
```

La app arranca en `http://localhost:5173`.

El frontend necesita un archivo `.env` con la URL del backend:

VITE_BASE_URL=http://localhost:3000

## Notas

Backend y frontend son dos proyectos independientes: cada uno lleva su propio `package.json` y necesita su propio `npm install`.

