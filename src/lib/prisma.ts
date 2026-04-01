import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClient = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaClient;

export const isDbConfigured = () => {
  return !!process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("your-");
};

export { prismaClient as prisma };
export default prismaClient;
