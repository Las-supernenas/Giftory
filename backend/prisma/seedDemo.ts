import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { access, copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { emailValidator, passwordValidator } from '../src/domain/user/utils/validators';
import { giftIdeaImagesDirectory } from '../src/infrastructure/giftidea/giftidea-image-storage';
import { SEED_IDEAS } from './seed-ideas';

const prisma = new PrismaClient();
const DEMO_EMAIL = 'demotest@gmail.com';
const DEMO_NAME = 'Marta López';
const SEED_IMAGES_DIRECTORY = path.resolve(process.cwd(), 'prisma', 'seed-images');

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function copySeedImage(imageFile: string): Promise<string | null> {
  const imageName = path.parse(imageFile).name;
  const sourceCandidates = [
    path.join(SEED_IMAGES_DIRECTORY, imageFile),
    path.join(SEED_IMAGES_DIRECTORY, `${imageName}.jpg`),
    path.join(SEED_IMAGES_DIRECTORY, `${imageName}.webp`),
  ];
  let source: string | null = null;
  for (const candidate of sourceCandidates) {
    if (await fileExists(candidate)) {
      source = candidate;
      break;
    }
  }

  if (!source) {
    console.warn(`Image not found: prisma/seed-images/${imageFile}; creating the idea without an image.`);
    return null;
  }

  const extension = path.extname(source).slice(1).toLowerCase().replace('jpeg', 'jpg');
  if (!['jpg', 'png', 'webp'].includes(extension)) {
    console.warn(`Unsupported image format: ${imageFile}; creating the idea without an image.`);
    return null;
  }

  const filename = `${randomUUID()}.${extension}`;
  await mkdir(giftIdeaImagesDirectory, { recursive: true });
  await copyFile(source, path.join(giftIdeaImagesDirectory, filename));
  return filename;
}

async function main() {
  if (process.env.ALLOW_SERVER_DEMO_SEED !== 'true') {
    throw new Error('Set ALLOW_SERVER_DEMO_SEED=true to run this one-time server seed.');
  }

  const password = process.env.DEMO_ACCOUNT_PASSWORD;
  if (!password || !passwordValidator(password)) {
    throw new Error(
      'DEMO_ACCOUNT_PASSWORD is required and must meet the app password rules (8–20 characters, uppercase, lowercase, number, and symbol).',
    );
  }
  if (!emailValidator(DEMO_EMAIL)) {
    throw new Error(`Invalid demo account email: ${DEMO_EMAIL}`);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: { email: DEMO_EMAIL, name: DEMO_NAME, passwordHash },
  });

  let createdCount = 0;
  let repairedImagesCount = 0;
  for (const idea of SEED_IDEAS) {
    const existing = await prisma.giftIdea.findFirst({
      where: { userId: user.id, name: idea.name, deletedAt: null },
    });

    // Preserve existing ideas, but repair their image if it is missing from uploads.
    if (existing) {
      const existingImagePath = existing.imageFilename
        ? path.join(giftIdeaImagesDirectory, existing.imageFilename)
        : null;
      const existingImageExists = existingImagePath ? await fileExists(existingImagePath) : false;

      if (idea.image && !existingImageExists) {
        const imageFilename = await copySeedImage(idea.image);
        if (imageFilename) {
          await prisma.giftIdea.update({
            where: { id: existing.id },
            data: { imageFilename },
          });
          repairedImagesCount += 1;
        }
      }
      continue;
    }

    const imageFilename = idea.image ? await copySeedImage(idea.image) : null;
    await prisma.giftIdea.create({
      data: {
        userId: user.id,
        name: idea.name,
        price: idea.price,
        interests: idea.interests,
        description: idea.description,
        productUrl: idea.productUrl,
        imageFilename,
      },
    });
    createdCount += 1;
  }

  console.log(
    `Server demo seed complete for ${DEMO_EMAIL}; created ${createdCount} gift ideas and repaired ${repairedImagesCount} missing images.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
