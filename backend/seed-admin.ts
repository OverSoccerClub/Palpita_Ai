/**
 * Seed: create admin account
 * Run: node -e "require('./seed-admin')"  OR  npx ts-node seed-admin.ts
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function main() {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
    const prisma = new PrismaClient({ adapter } as any);

    const email = 'admin@palpitaai.com';
    const password = await bcrypt.hash('Admin@123', 10);

    const user = await (prisma as any).user.upsert({
        where: { email },
        update: { role: 'ADMIN' },
        create: {
            email,
            password,
            name: 'Administrador',
            cpf: '00000000191',
            birthDate: new Date('1990-01-01T00:00:00.000Z'),
            role: 'ADMIN',
            wallet: { create: { balance: 0 } },
        },
        select: { id: true, name: true, email: true, role: true },
    });

    console.log('✅  Conta admin criada/atualizada:', user);
    await (prisma as any).$disconnect();
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
