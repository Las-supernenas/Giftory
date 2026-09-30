/**
 * Giftory · datos de desarrollo
 * Basado en el schema.prisma de la rama feature/docker-setup (PostgreSQL + Prisma 6).
 *
 * Ubicación: backend/prisma/seed.ts
 * Ejecutar:  npx prisma db seed
 *
 * - Se puede ejecutar varias veces sin duplicar nada.
 * - Solo toca los datos del usuario demo.
 * - El cumpleaños de Laura cae siempre "dentro de 12 días", como en la demo.
 */
import { PrismaClient, Interest } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEMO_EMAIL = 'demo@giftory.dev';
const DEMO_PASSWORD = 'giftory123'; // solo para desarrollo

/**
 * Fecha a N días de hoy, en UTC y sin hora.
 * Event.date es @db.Date (solo día): construirla en UTC evita que
 * se guarde el día anterior por la diferencia horaria.
 */
function daysFromToday(days: number): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + days));
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('El seed de desarrollo no se ejecuta en producción.');
  }

  // 1 · Usuario demo: si existe se actualiza, si no se crea
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { name: 'Ana', passwordHash },
    create: { email: DEMO_EMAIL, name: 'Ana', passwordHash },
  });

  // 2 · Borrar los datos anteriores del usuario demo.
  //     El schema no tiene borrado en cascada, así que el orden importa:
  //     primero las tablas que apuntan a otras (hijas), después las apuntadas (padres).
  await prisma.$transaction([
    prisma.savedIdea.deleteMany({
      where: { OR: [{ person: { userId: user.id } }, { giftIdea: { userId: user.id } }] },
    }),
    prisma.libraryItem.deleteMany({
      where: { OR: [{ userId: user.id }, { giftIdea: { userId: user.id } }] },
    }),
    prisma.event.deleteMany({ where: { person: { userId: user.id } } }),
    prisma.person.deleteMany({ where: { userId: user.id } }),
    prisma.giftIdea.deleteMany({ where: { userId: user.id } }),
  ]);

  // 3 · Personas
  const laura = await prisma.person.create({
    data: {
      userId: user.id,
      name: 'Laura',
      interests: [Interest.TRAVEL, Interest.COOKING, Interest.CRAFTS_AND_DIY],
    },
  });
  const mama = await prisma.person.create({
    data: {
      userId: user.id,
      name: 'Mamá',
      interests: [], // sin intereses: sirve para probar el estado vacío
    },
  });

  // 4 · Ideas de regalo (las de la presentación)
  const ceramica = await prisma.giftIdea.create({
    data: {
      userId: user.id,
      name: 'Taller de cerámica',
      price: 45,
      interests: [Interest.CRAFTS_AND_DIY, Interest.ART_AND_DESIGN],
    },
  });
  const pasta = await prisma.giftIdea.create({
    data: {
      userId: user.id,
      name: 'Curso de pasta fresca',
      price: 45,
      interests: [Interest.COOKING],
    },
  });
  const mapa = await prisma.giftIdea.create({
    data: {
      userId: user.id,
      name: 'Mapa de viajes personalizado',
      price: 39,
      interests: [Interest.TRAVEL, Interest.HOME_AND_DECOR],
    },
  });

  // 5 · Biblioteca del usuario
  await prisma.libraryItem.create({
    data: { userId: user.id, giftIdeaId: mapa.id },
  });

  // 6 · Idea guardada para Laura, con nota privada
  await prisma.savedIdea.create({
    data: {
      personId: laura.id,
      giftIdeaId: ceramica.id,
      privateNote: 'Me lo comentó en Lisboa. Mejor un sábado por la mañana.',
    },
  });

  // 7 · Eventos: uno cercano (aviso destacado) y otro más lejano sin ideas
  await prisma.event.createMany({
    data: [
      { personId: laura.id, name: 'Cumpleaños', date: daysFromToday(12) },
      { personId: mama.id, name: 'Cumpleaños', date: daysFromToday(54) },
    ],
  });

  console.log('Seed completado');
  console.log(`  login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`  personas: Laura, Mamá · ideas: ${[ceramica, pasta, mapa].length} · eventos: 2`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
