import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function main() {
    console.log('--- Diagnostic: Wallets ---');
    const wallets = await prisma.wallet.findMany({
        include: { user: true, transactions: { take: 5, orderBy: { createdAt: 'desc' } } }
    });

    wallets.forEach(w => {
        console.log(`Wallet ID: ${w.id}`);
        console.log(`  User: ${w.user.email} (${w.user.name})`);
        console.log(`  Balance: ${w.balance} (${JSON.stringify(w.balance)})`);
        console.log(`  Last Transactions:`);
        w.transactions.forEach(tx => {
            console.log(`    - [${tx.type}] ${tx.amount} status: ${tx.status} at ${tx.createdAt}`);
        });
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
