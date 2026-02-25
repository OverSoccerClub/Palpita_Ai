const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const EfiPay = require('sdk-node-apis-efi');
const fs = require('fs');
const path = require('path');
require('dotenv/config');

async function run() {
    const webhookUrl = process.argv[2];
    if (!webhookUrl) {
        console.error('Uso: node scripts/register-webhook.js <URL_DO_WEBHOOK>');
        console.error('Exemplo: node scripts/register-webhook.js https://palpita-ai.com/api/wallet/webhook');
        process.exit(1);
    }

    console.log('Conectando ao banco de dados...');
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        const gw = await prisma.paymentGateway.findFirst({
            where: { provider: 'EFIPAY', isActive: true }
        });

        if (!gw) {
            console.error('Nenhum gateway EFIPAY ativo encontrado.');
            return;
        }

        const credentials = gw.credentials;
        console.log('Configuração EFI encontrada:', gw.name);

        const cleanBase64 = (credentials.certificateBase64 || '').replace(/\s/g, '').trim();
        const buffer = Buffer.from(cleanBase64, 'base64');
        const certDir = path.join(process.cwd(), 'certs');
        const certPath = path.join(certDir, 'temp_efi_cert_setup.p12');

        if (!fs.existsSync(certDir)) {
            fs.mkdirSync(certDir, { recursive: true });
        }
        fs.writeFileSync(certPath, buffer);

        const options = {
            sandbox: credentials.sandbox === 'true' || credentials.sandbox === true,
            client_id: credentials.clientId,
            client_secret: credentials.clientSecret,
            certificate: certPath,
        };

        const efi = new EfiPay(options);
        const pixKey = credentials.payoutPixKey || credentials.pixKey;

        if (!pixKey) {
            console.error('Nenhuma chave Pix configurada no gateway.');
            return;
        }

        console.log(`Tentando registrar webhook para a chave: ${pixKey}`);
        console.log(`URL: ${webhookUrl}`);

        const params = { chave: pixKey };
        const body = { webhookUrl };

        try {
            const res = await efi.pixConfigWebhook(params, body);
            console.log('✅ WEBHOOK REGISTRADO COM SUCESSO:', res);
            console.log('\nAgora você já pode tentar o "Retentar Payout" no sistema.');
        } catch (webhookErr) {
            console.error('❌ Erro ao registrar webhook:', JSON.stringify(webhookErr, null, 2));
            console.error('\nLembre-se: A URL do webhook precisa estar ONLINE e acessível pela internet (HTTPS) para que a EFI valide o registro.');
        }

    } catch (e) {
        console.error('Erro fatal:', e.message);
    } finally {
        await prisma.$disconnect();
        pool.end();
    }
}

run();
