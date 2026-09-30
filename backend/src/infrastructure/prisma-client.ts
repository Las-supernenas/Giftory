import { PrismaClient } from "@prisma/client";

// Shared PrismaClient instance for the whole application
// so we don't open several connection pools.
const prisma = new PrismaClient();

export { prisma};