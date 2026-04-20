import { PrismaClient } from '@prisma/client';

// Cache the client across hot reloads so dev mode doesn't spawn a new
// Postgres pool on every code edit. Next.js best-practice pattern.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
