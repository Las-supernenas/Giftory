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

## Frontend

```bash
cd frontend
npm install
npm run dev
```

La app arranca en `http://localhost:5173`.

El frontend usa `VITE_API_URL` como destino del proxy de Vite para las peticiones a la API. Para configurar tu entorno local, copia `frontend/.env.example` como `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:3000
```

Vite carga `.env.local` automáticamente. Este archivo es local y no debe subirse a Git; `frontend/.env.example` sí debe incluirse en el repositorio. Si cambias la variable, reinicia Vite.

## Notas

Backend y frontend son dos proyectos independientes: cada uno lleva su propio `package.json` y necesita su propio `npm install`.
