
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

async function main() {
    const prisma = new PrismaClient();
    try {
        const gateway = await prisma.paymentGateway.findFirst({
            where: { isActive: true }
        });
        console.log(JSON.stringify(gateway, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
