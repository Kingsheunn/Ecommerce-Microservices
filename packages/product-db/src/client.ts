// Use explicit file import to avoid unsupported directory imports under ESM
import { PrismaClient } from "../generated/prisma/index.js";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;