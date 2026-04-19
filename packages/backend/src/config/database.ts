import { PrismaClient } from '@prisma/client';
import { env } from './env';

// Extend the global type to include prisma
// This prevents multiple instances during hot reloading in development
declare global {
    var prisma: PrismaClient | undefined;
}

const prismaClient = (): PrismaClient => {
    return new PrismaClient({
        log: env.isDevelopment
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
        errorFormat: 'pretty',
    });
    };

// Singleton pattern — reuse existing instance if it exists
const db = globalThis.prisma ?? prismaClient();

if (env.isDevelopment) {
    globalThis.prisma = db;
}

export default db;