import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const gateway = await prisma.paymentGateway.findFirst({
        where: { isActive: true },
    });
    console.log('Active Gateway:', JSON.stringify(gateway, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
