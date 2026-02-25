import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const gateway = await prisma.paymentGateway.findFirst({ where: { isActive: true } });
    console.log('ACTIVE_GW_START');
    console.log(JSON.stringify(gateway, null, 2));
    console.log('ACTIVE_GW_END');
}
main().catch(console.error).finally(() => prisma.$disconnect());
