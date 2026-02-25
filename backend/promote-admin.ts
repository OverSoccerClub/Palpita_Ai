import 'dotenv/config';
import { defineConfig } from 'prisma/config';
import { PrismaPg } from '@prisma/adapter-pg';

async function main() {
    const { PrismaClient } = await import('@prisma/client');
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    const prisma = new PrismaClient({ adapter } as any);

    const email = process.argv[2];
    if (!email) {
        console.error('❌  Uso: npx ts-node promote-admin.ts <email>');
        process.exit(1);
    }

    const user = await (prisma as any).user.update({
        where: { email },
        data: { role: 'ADMIN' },
        select: { id: true, name: true, email: true, role: true },
    });

    console.log(`✅  ${user.name} (${user.email}) agora é ADMIN.`);
    await (prisma as any).$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
