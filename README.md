# Giftory

Encuentra el regalo. Recuerda a la persona.

Monorepo con el backend y el frontend en carpetas separadas, cada uno con sus propias dependencias.

## Estructura

giftory/
├── backend/ API en Express + TypeScript
└── frontend/ React + Vite + TypeScript

## Requisitos

- Node.js 18+
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

El frontend necesita un archivo `.env` con la URL del backend:

VITE_BASE_URL=http://localhost:3000


## Notas

Backend y frontend son dos proyectos independientes: cada uno lleva su propio `package.json` y necesita su propio `npm install`.