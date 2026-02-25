// seed-admin.mjs — run with: node seed-admin.mjs
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const email = 'admin@palpitaai.com';
const password = await bcrypt.hash('Admin@123', 10);

try {
    const user = await prisma.user.upsert({
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
} catch (e) {
    console.error('❌', e.message);
} finally {
    await prisma.$disconnect();
}
