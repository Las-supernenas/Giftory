/**
 * Giftory · development data
 * PostgreSQL + Prisma 6.
 *
 * Location: backend/prisma/seed.ts
 * Run:      npx prisma db seed (requires ALLOW_DEMO_SEED=true)
 *
 * - It can be run several times without duplicating anything.
 * - It resets the controlled demo user's people, events and saved ideas.
 * - It updates seeded ideas for the controlled demo creators and soft-deletes their stale ideas.
 * - Laura's birthday is always "in 12 days", as in the demo.
 */
import { PrismaClient, Interest, GiftIdea } from '@prisma/client';
import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { access, copyFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { giftIdeaImagesDirectory } from '../src/infrastructure/giftidea/giftidea-image-storage';
import { LUCIA_EMAIL, MARCOS_EMAIL, SEED_IDEAS, type SeedIdea } from './seed-ideas';

const prisma = new PrismaClient();

const DEMO_EMAIL = 'demo@giftory.dev';
const DEMO_PASSWORD = 'giftory123'; // development only

// Demo users who create the public gift ideas shown in Discovery (same demo password)
const CREATOR_USERS = [
  { email: LUCIA_EMAIL, name: 'Lucía' },
  { email: MARCOS_EMAIL, name: 'Marcos' },
];

// Demo photos live in the repository (uploads/ is git-ignored); the seed copies them to uploads/
const SEED_IMAGES_DIRECTORY = path.resolve(process.cwd(), 'prisma', 'seed-images');

// Ideas the demo user keeps in the Library: more than 9 so pagination can be shown
const DEMO_LIBRARY_IDEAS = [
  'Auriculares inalámbricos True Wireless',
  'Cámara instantánea',
  'E-reader',
  'Set de acuarelas profesional',
  'Pack pilates',
  'Taza de cerámica artesanal',
  'Cuaderno de cuero',
  'Mochila de senderismo WARDOW',
  'Libro de recetas del mundo',
  'Cafetera de goteo manual',
  'Kit de huerto urbano',
  'Juego de ajedrez Black Onyx',
];

/**
 * Date N days from today, in UTC and without time.
 * Event.date is @db.Date (day only): building it in UTC prevents
 * the previous day from being stored because of the timezone.
 */
function daysFromToday(days: number): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + days));
}

// Fails early if any Interest of the enum has no demo idea, so every filter has results
function checkAllInterestsUsed() {
  const used = new Set(SEED_IDEAS.flatMap((idea) => idea.interests));
  const missing = Object.values(Interest).filter((interest) => !used.has(interest));

  if (missing.length > 0) {
    throw new Error(`Faltan intereses en las ideas de demo: ${missing.join(', ')}`);
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Copies a demo photo to uploads/ with a server-style name (<uuid>.<ext>), as an upload would
async function copySeedImage(imageFile: string): Promise<string | null> {
  const source = path.join(SEED_IMAGES_DIRECTORY, imageFile);

  if (!(await fileExists(source))) {
    console.warn(
      `  Imagen no encontrada: prisma/seed-images/${imageFile} (la idea se crea sin imagen)`,
    );
    return null;
  }

  const extension = path.extname(imageFile).slice(1).toLowerCase().replace('jpeg', 'jpg');
  if (!['jpg', 'png', 'webp'].includes(extension)) {
    console.warn(`  Formato no admitido: ${imageFile} (solo JPG, PNG o WebP)`);
    return null;
  }

  const filename = `${randomUUID()}.${extension}`;
  await mkdir(giftIdeaImagesDirectory, { recursive: true });
  await copyFile(source, path.join(giftIdeaImagesDirectory, filename));
  return filename;
}

// Creates the idea, or updates it if this creator already has one with the same name (no duplicates)
async function upsertSeedIdea(creatorId: number, idea: SeedIdea): Promise<GiftIdea> {
  const existing = await prisma.giftIdea.findFirst({
    where: { userId: creatorId, name: idea.name, deletedAt: null },
  });

  // Always use the photo in seed.ts, so new, changed or removed photos are applied on every run:
  // the previous copy is deleted and the current one is copied (or the idea ends without photo)
  if (existing?.imageFilename) {
    // basename: only a file inside the images folder can be deleted
    await rm(path.join(giftIdeaImagesDirectory, path.basename(existing.imageFilename)), {
      force: true,
    });
  }
  const imageFilename = idea.image ? await copySeedImage(idea.image) : null;

  const data = {
    name: idea.name,
    price: idea.price,
    interests: idea.interests,
    description: idea.description,
    productUrl: idea.productUrl,
    imageFilename,
  };

  if (existing) {
    return prisma.giftIdea.update({ where: { id: existing.id }, data });
  }

  return prisma.giftIdea.create({ data: { ...data, userId: creatorId } });
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('El seed de desarrollo no se ejecuta en producción.');
  }
  if (process.env.ALLOW_DEMO_SEED !== 'true') {
    throw new Error('Para ejecutar el seed, configura ALLOW_DEMO_SEED=true.');
  }

  checkAllInterestsUsed();

  // 1 · Demo user: updated if it exists, created otherwise
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { name: 'Ana', passwordHash },
    create: { email: DEMO_EMAIL, name: 'Ana', passwordHash },
  });

  // 2 · Delete the previous data of the demo user.
  //     The schema has no cascade delete, so the order matters:
  //     first the tables that point to others (children), then the ones they point to (parents).
  await prisma.$transaction([
    prisma.savedIdea.deleteMany({ where: { person: { userId: user.id } } }),
    prisma.libraryItem.deleteMany({ where: { userId: user.id } }),
    prisma.event.deleteMany({ where: { person: { userId: user.id } } }),
    prisma.person.deleteMany({ where: { userId: user.id } }),
  ]);

  // 3 · People
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
      interests: [], // no interests: useful to test the empty state
    },
  });

  // 4 · Gift ideas of the demo user (the ones used in the presentation).
  //     deletedAt: null so an idea soft-deleted during a demo is created again instead of reused
  const ceramica =
    (await prisma.giftIdea.findFirst({
      where: { userId: user.id, name: 'Taller de cerámica', deletedAt: null },
    })) ??
    (await prisma.giftIdea.create({
      data: {
        userId: user.id,
        name: 'Taller de cerámica',
        price: 45,
        interests: [Interest.CRAFTS_AND_DIY, Interest.ART_AND_DESIGN],
      },
    }));
  const pasta =
    (await prisma.giftIdea.findFirst({
      where: { userId: user.id, name: 'Curso de pasta fresca', deletedAt: null },
    })) ??
    (await prisma.giftIdea.create({
      data: {
        userId: user.id,
        name: 'Curso de pasta fresca',
        price: 45,
        interests: [Interest.COOKING],
      },
    }));
  const mapa =
    (await prisma.giftIdea.findFirst({
      where: { userId: user.id, name: 'Mapa de viajes personalizado', deletedAt: null },
    })) ??
    (await prisma.giftIdea.create({
      data: {
        userId: user.id,
        name: 'Mapa de viajes personalizado',
        price: 39,
        interests: [Interest.TRAVEL, Interest.HOME_AND_DECOR],
      },
    }));

  // 4b · Demo creators and their public ideas (one or more for every Interest)
  const creatorIds = new Map<string, number>();
  for (const creator of CREATOR_USERS) {
    const creatorUser = await prisma.user.upsert({
      where: { email: creator.email },
      update: { name: creator.name, passwordHash },
      create: { email: creator.email, name: creator.name, passwordHash },
    });
    creatorIds.set(creator.email, creatorUser.id);
  }

  const seedIdeasByName = new Map<string, GiftIdea>();
  for (const idea of SEED_IDEAS) {
    const creatorId = creatorIds.get(idea.creatorEmail);
    if (creatorId === undefined) {
      throw new Error(`Creador de demo desconocido: ${idea.creatorEmail}`);
    }
    seedIdeasByName.set(idea.name, await upsertSeedIdea(creatorId, idea));
  }

  // 4c · Only clean stale ideas owned by the controlled demo creator accounts.
  const removedIdeas = await prisma.giftIdea.updateMany({
    where: {
      userId: { in: [...creatorIds.values()] },
      deletedAt: null,
      name: { notIn: SEED_IDEAS.map((idea) => idea.name) },
    },
    data: { deletedAt: new Date() },
  });

  // 5 · Library of the demo user
  await prisma.libraryItem.create({
    data: { userId: user.id, giftIdeaId: mapa.id },
  });
  for (const ideaName of DEMO_LIBRARY_IDEAS) {
    const idea = seedIdeasByName.get(ideaName);
    if (!idea) {
      throw new Error(`Idea de biblioteca no encontrada en el seed: ${ideaName}`);
    }
    await prisma.libraryItem.create({
      data: { userId: user.id, giftIdeaId: idea.id },
    });
  }

  // 6 · Idea saved for Laura, with a private note
  await prisma.savedIdea.create({
    data: {
      personId: laura.id,
      giftIdeaId: ceramica.id,
      privateNote: 'Me lo comentó en Lisboa. Mejor un sábado por la mañana.',
    },
  });

  // 7 · Events: a close one (highlighted notice) and a later one without ideas
  await prisma.event.createMany({
    data: [
      { personId: laura.id, name: 'Cumpleaños', date: daysFromToday(12), repeatsYearly: true },
      { personId: mama.id, name: 'Cumpleaños', date: daysFromToday(54), repeatsYearly: true },
    ],
  });

  const ideasWithImage = [...seedIdeasByName.values()].filter((idea) => idea.imageFilename).length;

  console.log('Seed completado');
  console.log(`  login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(
    `  creadores demo: ${CREATOR_USERS.map((c) => c.email).join(', ')} / ${DEMO_PASSWORD}`,
  );
  console.log(`  personas: Laura, Mamá · ideas: ${[ceramica, pasta, mapa].length} · eventos: 2`);
  console.log(
    `  ideas públicas de demo: ${SEED_IDEAS.length} (con imagen: ${ideasWithImage}) · biblioteca de Ana: ${DEMO_LIBRARY_IDEAS.length + 1}`,
  );
  console.log(`  ideas antiguas de creadores demo retiradas: ${removedIdeas.count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
