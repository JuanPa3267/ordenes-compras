import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const prismaClientSingleton = () => {
    // 1. Creamos la conexión usando el driver nativo pg
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    
    // 2. Pasamos esa conexión al adaptador de Prisma
    const adapter = new PrismaPg(pool);
    
    // 3. Inicializamos Prisma con el adaptador
    return new PrismaClient({ adapter });
};

declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;