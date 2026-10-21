/**
 * Giftory · development data
 * PostgreSQL + Prisma 6.
 *
 * Location: backend/prisma/seed.ts
 * Run:      npx prisma db seed (requires ALLOW_DEMO_SEED=true)
 *
 * - It can be run several times without duplicating anything.
 * - It only touches the data of the demo users.
 * - Laura's birthday is always "in 12 days", as in the demo.
 */
import { PrismaClient, Interest, GiftIdea } from '@prisma/client';
import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { access, copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { giftIdeaImagesDirectory } from '../src/infrastructure/giftidea/giftidea-image-storage';

const prisma = new PrismaClient();

const DEMO_EMAIL = 'demo@giftory.dev';
const DEMO_PASSWORD = 'giftory123'; // development only

// Demo users who create the public gift ideas shown in Discovery (same demo password)
const LUCIA_EMAIL = 'lucia@giftory.dev';
const MARCOS_EMAIL = 'marcos@giftory.dev';
const CREATOR_USERS = [
  { email: LUCIA_EMAIL, name: 'Lucía' },
  { email: MARCOS_EMAIL, name: 'Marcos' },
];

// Demo photos live in the repository (uploads/ is git-ignored); the seed copies them to uploads/
const SEED_IMAGES_DIRECTORY = path.resolve(process.cwd(), 'prisma', 'seed-images');

type SeedIdea = {
  creatorEmail: string;
  name: string;
  price: number;
  interests: Interest[];
  description: string;
  productUrl: string | null;
  // File name inside prisma/seed-images. If the file is missing, the idea is created without image
  image: string | null;
};

// Real store search pages: they always work and do not pretend to be a specific product
function storeSearchUrl(query: string): string {
  return `https://www.amazon.es/s?k=${encodeURIComponent(query)}`;
}

// Covers every Interest (checked at the start of the seed) with prices from 0 € to about 130 €
const SEED_IDEAS: SeedIdea[] = [
  // · Lucía
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'Auriculares inalámbricos True Wireless',
    price: 169,
    interests: [Interest.TECHNOLOGY, Interest.MUSIC],
    description: 'Para disfrutar de su música favorita con un diseño innovador.',
    productUrl:
      'https://www.elcorteingles.es/electronica/A200280373-6942103169434-pr-auriculares-true-wireless-huawei-freeclip-2-negro/',
    image: 'auriculares.jpg',
  },
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'Soporte Sauron para mandos',
    price: 49.95,
    interests: [Interest.GAMING, Interest.TECHNOLOGY],
    description: 'Soporte para cascos gaming y mandos, para los fans de El Señor de los Anillos.',
    productUrl:
      'https://www.amazon.es/Grupo-Erik-Auriculares-Accesorios-Merchandising/dp/B0HGMBB1M1/ref=sr_1_15',
    image: 'soporte-mando.webp',
  },
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'Cámara instantánea',
    price: 89,
    interests: [Interest.PHOTOGRAPHY],
    description: 'Fotos impresas al momento para guardar los mejores recuerdos.',
    productUrl: "https://www.amazon.es/C%C3%A1mara-instant%C3%A1nea-instax-Dreamy-Purple/dp/B0H3CF2N5J/ref=sr_1_7?dib=eyJ2IjoiMSJ9.K1n6_mVUznAQC7N2rxQla_c0gX4RE9gtARLTupguEH8rpwBcm_-5eAF4w0H7mZ1gJTAbZpzda6g-pSGK6lYIkW-ogLIaP4cFz-cbs_90sHzp5t78khkhx6N2JcuV0R7Rt1-_4hYYr13R0kMzfFfnf-tVgHOsRvzk0WZN5ioVXxTehHr7a0ryeNJfn_cFYjvmsCnpL4ooijk1rwnlmIP1DBxtBRZVo4Kvl3GyBtXLv_IrUEbvWKb4ZcF2Y3dwCimjCwOyWFDM_cn9vvY3nLG6mMWHvTCg__OEwke2CKBzOf0.YnOwd6yygYtVHqmG4pUy9KSqpKy9ZilkVt04Jy1Ik1s&dib_tag=se&keywords=c%C3%A1mara+instant%C3%A1nea&qid=1792506452&sr=8-7&ufe=app_do%3Aamzn1.fos.fde3827e-5b32-4544-acac-9bcf8407a6a6",
    image: 'camara-instantanea.jpg',
  },
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'Póster de Blade Runner',
    price: 7.95,
    interests: [Interest.FILM_AND_TV],
    description: 'Póster de la película Blade Runner (1982).',
    productUrl: null,
    image: 'poster.jpg',
  },
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'Tocadiscos de maleta',
    price: 75,
    interests: [Interest.MUSIC, Interest.HOME_AND_DECOR],
    description: 'Estilo retro para escuchar vinilos en cualquier rincón de casa.',
    productUrl: 'https://www.amazon.es/Muse-MT501-ATC-Tocadiscos-Platino/dp/B09J547MHP',
    image: 'tocadiscos.jpg',
  },
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'E-reader',
    price: 169.99,
    interests: [Interest.BOOKS_AND_READING],
    description: 'Una biblioteca entera en el bolsillo.',
    productUrl: 'https://ereader.kobo.com/es-es/products/kobo-clara-bw',
    image: 'ebook.webp',
  },
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'Globo terráqueo NATGEO',
    price: 51.44,
    interests: [Interest.SCIENCE, Interest.EDUCATION],
    description: 'Globo terráqueo con base de madera de haya e iluminación.',
    productUrl:
      'https://www.amazon.es/TECNODIDATTICA-Terr%C3%A1queo-Cartograf%C3%ADa-F%C3%ADsico-Pol%C3%ADtica-Geographic/dp/B081TQNS87/ref=sr_1_2_sspa',
    image: 'globo.webp',
  },
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'Atlas histórico ilustrado',
    price: 29.9,
    interests: [Interest.HISTORY, Interest.BOOKS_AND_READING],
    description: 'Un viaje por la historia del mundo a través de mapas.',
    productUrl: storeSearchUrl('atlas histórico ilustrado'),
    image: 'atlas-historico.jpg',
  },
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'Curso online de italiano',
    price: 49,
    interests: [Interest.LANGUAGES, Interest.EDUCATION],
    description: 'Para preparar su próximo viaje a Italia.',
    productUrl: null,
    image: 'curso-italiano.jpg',
  },
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'Set de acuarelas profesional',
    price: 118,
    interests: [Interest.ART_AND_DESIGN],
    description: 'Colores intensos y pinceles de calidad para pintar sin límites.',
    productUrl:
      'https://hartem.com/caja-de-madera-azul-de-48-godets-de-acuarela-y-pincel-white-nights.html',
    image: 'acuarelas.webp',
  },
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'Kit para hacer velas aromáticas',
    price: 24.99,
    interests: [Interest.CRAFTS_AND_DIY, Interest.HOME_AND_DECOR],
    description: 'Todo lo necesario para crear sus propias velas.',
    productUrl: storeSearchUrl('kit hacer velas aromáticas'),
    image: 'velas.jpg',
  },
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'Cuaderno para colorear',
    price: 7.66,
    interests: [Interest.ART_AND_DESIGN, Interest.CRAFTS_AND_DIY],
    description:
      'Para relajarse y desconectar con un adorable libro para colorear. ¡Es hora de ponerse cómodo!',
    productUrl:
      'https://www.amazon.es/Cozy-Corner-Calm-Comforting-Colouring/dp/024176422X/ref=asc_df_024176422X',
    image: 'cuaderno-colorear.webp',
  },
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'Bolso patchwork hecho a mano',
    price: 41.06,
    interests: [Interest.FASHION],
    description: 'Un tote bag único en color rosa pastel.',
    productUrl:
      'https://www.etsy.com/es/listing/4445769357/handmade-patchwork-tote-bag-pastel-pink',
    image: 'bolso.webp',
  },
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'Pack pilates',
    price: 76.96,
    interests: [Interest.YOGA_AND_MEDITATION, Interest.FITNESS],
    description: 'Pack de accesorios para pilates. Perfecto para entrenar en casa.',
    productUrl:
      'https://www.elinapilates.com/eu/es/pack-accesorios/1404-pack-de-accesorios-de-pilates-kit-completo-para-entrenar-en-casa-o-gimnasio.html',
    image: 'pack-pilates.jpg',
  },
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'Spa con desayuno',
    price: 38,
    interests: [Interest.WELLNESS_AND_SELF_CARE, Interest.BEAUTY_AND_SKINCARE],
    description: 'Acceso a spa + desayuno buffet. Perfecto para compartir.',
    productUrl:
      'https://www.hoteltreats.com/es/espana/baleares/mallorca/hm-palma-blanc/acceso-al-spa-con-desayuno-buffet-en-mallorca',
    image: 'spa.jpg',
  },
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'Taza de cerámica artesanal',
    price: 18.5,
    interests: [Interest.COFFEE_AND_TEA, Interest.CRAFTS_AND_DIY],
    description: 'Hecha a mano y perfecta para los amantes del té. En color rosa coral.',
    productUrl: 'https://www.etsy.com/es/listing/4572395945/coral-pink-ceramic-mug-with-lavender',
    image: 'taza-ceramica.webp',
  },
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'Cuaderno de cuero',
    price: 14.99,
    interests: [Interest.WRITING],
    description: 'Cuaderno de cuero, vintage con 80 páginas.',
    productUrl:
      'https://www.amazon.es/Cuaderno-Recargable-Encuadernado-Escuelas-Conferencias/dp/B0DWXPCHWM/ref=sr_1_9',
    image: 'cuaderno.jpg',
  },

  // · Marcos
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Pulsera de actividad',
    price: 35.91,
    interests: [Interest.FITNESS, Interest.TECHNOLOGY],
    description: 'Para seguir sus pasos, el sueño y los entrenamientos.',
    productUrl:
      'https://www.marjoya.com/relojes-marea/34900-pulsera-de-actividad-marea-azul-marino-b570152.html',
    image: 'pulsera-actividad.webp',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Mochila de senderismo WARDOW',
    price: 65,
    interests: [Interest.OUTDOOR_SPORTS, Interest.ADVENTURE],
    description: 'Ligera y resistente para rutas de un día. Capacidad 30L.',
    productUrl: 'https://es.wardow.com/products/osprey-hikelite-30-mochila-de-senderismo-10007578',
    image: 'mochila-senderismo.webp',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Camiseta oficial FCB',
    price: 69.99,
    interests: [Interest.TEAM_SPORTS],
    description: 'Para animar a su equipo en cada partido.',
    productUrl:
      'https://www.elcorteingles.es/deportes/A53979215-azul-granate-pr-camiseta-de-hombre-1-equipacion-fc-barcelona-2025-2026-stadium-nike/',
    image: 'camiseta-equipo.jpg',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Libro de recetas del mundo',
    price: 25,
    interests: [Interest.COOKING, Interest.TRAVEL],
    description: 'Viajar sin salir de la cocina.',
    productUrl: 'https://www.amazon.es/Recetas-del-Mundo-community-garcia/dp/B0DK3DKCBJ/ref=sr_1_2',
    image: 'recetas-mundo.jpg',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Set de repostería con moldes',
    price: 29.95,
    interests: [Interest.BAKING],
    description: 'Moldes y utensilios para sus mejores tartas.',
    productUrl: 'https://www.kaufland.es/product/561429930/',
    image: 'reposteria.webp',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Cata de vinos para dos',
    price: 87,
    interests: [Interest.FOOD_AND_GASTRONOMY, Interest.CULTURAL_EXPERIENCES],
    description: 'Una experiencia para descubrir sabores en buena compañía.',
    productUrl:
      'https://www.winedering.com/es/among-the-best-wines-and-flavors-of-mallorca_d10382_travel',
    image: 'cata-vinos.webp',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Cafetera de goteo manual',
    price: 33.9,
    interests: [Interest.COFFEE_AND_TEA],
    description: 'Para preparar el café con calma y disfrutar de todo su sabor.',
    productUrl:
      'https://www.amazon.es/LMSAWK-Vidrio-port%C3%A1til-Cafetera-Lavavajillas/dp/B0FFYZQMV3',
    image: 'cafetera.jpg',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Kit de huerto urbano',
    price: 29.99,
    interests: [Interest.GARDENING, Interest.SUSTAINABILITY],
    description: 'Semillas, macetas y tierra para cultivar en el balcón.',
    productUrl: storeSearchUrl('kit huerto urbano'),
    image: 'huerto-urbano.jpg',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Telescopio',
    price: 62.5,
    interests: [Interest.NATURE_AND_WILDLIFE, Interest.SCIENCE],
    description: 'Para una cita romántica observando las estrellas.',
    productUrl:
      'https://www.mediamarkt.es/es/product/_telescopio-bresser-explorador70400-70-mm-azul-183775763.html',
    image: 'telescopio.webp',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Cama acolchada para mascotas',
    price: 39.99,
    interests: [Interest.PETS],
    description: 'El rincón más cómodo de la casa para su mascota.',
    productUrl: 'https://www.zarahome.com/es/cama-mascotas-borreguito-l44391009',
    image: 'cama-mascota.webp',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Taza calentadora de viaje',
    price: 29.99,
    interests: [Interest.COFFEE_AND_TEA, Interest.TRAVEL],
    description: 'Para los amantes del café "on the go".',
    productUrl:
      'https://www.amazon.es/Rauwseul-Hervidor-El%C3%A9ctrico-Calentadora-12V-24V/dp/B0D9661JDX/ref=asc_df_B0D9661JDX',
    image: 'calentador-cafe.webp',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Diario de viaje',
    price: 22,
    interests: [Interest.TRAVEL, Interest.WRITING],
    description: 'Para apuntar rutas, recuerdos y pegar entradas de cada viaje.',
    productUrl:
      'https://www.amazon.es/Lanpn-Cuaderno-Mujeres-Recuerdos-Viajeros/dp/B0CJV474ZB/ref=asc_df_B0CJV474ZB',
    image: 'diario-viaje.jpg',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Bautismo de buceo',
    price: 129,
    interests: [Interest.ADVENTURE, Interest.OUTDOOR_SPORTS],
    description: 'Una primera inmersión guiada para descubrir el fondo del mar.',
    productUrl:
      'https://www.yumping.com/ofertas/buceo/mallorca/bautismo-de-buceo-en-palma-de-mallorca-3h--o28721',
    image: 'buceo.jpg',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Entradas para un musical',
    price: 110,
    interests: [Interest.CULTURAL_EXPERIENCES, Interest.MUSIC],
    description: 'Una noche de teatro, música y emoción.',
    productUrl: null,
    image: 'musical.jpg',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Lámpara de mesa de diseño',
    price: 41.65,
    interests: [Interest.HOME_AND_DECOR, Interest.ART_AND_DESIGN],
    description: 'Lámpara de diseño cálida, especial para su escritorio.',
    productUrl:
      'https://www.maisonsdumonde.com/ES/es/p/lampara-de-mesa-de-hierro-en-color-laton-12x12x28cm-mushlampio-M25190543.htm',
    image: 'lampara.jpg',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Rutina de cuidado facial',
    price: 99.95,
    interests: [Interest.BEAUTY_AND_SKINCARE],
    description: 'Set de cuidado facial reafirmante de Shiseido.',
    productUrl:
      'https://www.druni.es/estuche-vital-perfection-uplifting-firming-cream-shiseido-tratamiento-antiedad',
    image: 'cuidado-facial.jpg',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Álbum para colección de sellos',
    price: 35.96,
    interests: [Interest.COLLECTIBLES, Interest.HISTORY],
    description: 'Para ordenar y proteger su colección.',
    productUrl:
      'https://filabo.es/tapa-para-hojas-de-sellos/11-album-de-sellos-skay-con-cajetin.html',
    image: 'album-sellos.jpg',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Maqueta Ferrari 250 GTO',
    price: 2495,
    interests: [Interest.CARS_AND_MOTORSPORTS, Interest.COLLECTIBLES],
    description: 'Una pieza de colección única para los amantes del motor.',
    productUrl: 'https://www.ralphlauren.es/es/ferrari-250-gto-3615731998327.html',
    image: 'maqueta-coche.jpg',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Juego de ajedrez Black Onyx',
    price: 110.93,
    interests: [Interest.BOARD_GAMES_AND_PUZZLES, Interest.GAMING],
    description: 'Juego de ajedrez de mármol ónix negro: decoración vintage hecha a mano.',
    productUrl: 'https://www.etsy.com/es/listing/1770666031/black-onyx-marble-chess-set-handmade',
    image: 'juego-mesa.webp',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Puzzle de 1000 piezas',
    price: 18.95,
    interests: [Interest.BOARD_GAMES_AND_PUZZLES],
    description: 'Un reto relajante para varias tardes.',
    productUrl:
      'https://www.elcorteingles.es/juguetes/A200036930-puzzle-1000-piezas-arte-klimt-el-beso-ravensburger/',
    image: 'puzzle.jpg',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Experiencia en circuito de karts',
    price: 55,
    interests: [Interest.CARS_AND_MOTORSPORTS, Interest.ADVENTURE],
    description: 'Velocidad y adrenalina en un circuito profesional.',
    productUrl: null,
    image: 'karts.jpg',
  },
];

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

  // Keep the image already copied in a previous run; copy it only if it is missing
  let imageFilename = existing?.imageFilename ?? null;
  const hasImageFile =
    imageFilename !== null && (await fileExists(path.join(giftIdeaImagesDirectory, imageFilename)));
  if (idea.image && !hasImageFile) {
    imageFilename = await copySeedImage(idea.image);
  }

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

  // Ideas of the demo creators that are no longer in SEED_IDEAS (e.g. renamed) are soft-deleted,
  // so Discovery only shows the current demo ideas
  await prisma.giftIdea.updateMany({
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
      { personId: laura.id, name: 'Cumpleaños', date: daysFromToday(12) },
      { personId: mama.id, name: 'Cumpleaños', date: daysFromToday(54) },
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
