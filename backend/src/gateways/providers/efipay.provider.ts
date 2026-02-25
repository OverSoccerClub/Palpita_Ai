import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { IPaymentGateway, PixResult } from '../gateway.interface';

const EfiPay = require('sdk-node-apis-efi');

export class EfipayProvider implements IPaymentGateway {
    private configure: any;
    private certPath: string;
    private credentials: Record<string, string>;

    constructor(credentials: Record<string, string>) {
        console.log('[EfipayProvider] Constructor started...');
        this.credentials = credentials;
        try {
            // Limpar espaços, quebras de linha e possíveis caracteres invisíveis do Base64
            const cleanBase64 = (credentials?.certificateBase64 || '').replace(/\s/g, '').trim();
            const buffer = Buffer.from(cleanBase64, 'base64');

            console.log(`[EfipayProvider] Cert Base64 length: ${cleanBase64.length}, Buffer size: ${buffer.length} bytes`);

            if (buffer.length < 100) {
                console.error('[EfipayProvider] WARNING: Certificate buffer seems too small. Check if the Base64 string is complete.');
            }

            // Criar um arquivo temporário para o certificado
            const certsDir = path.join(process.cwd(), 'certs');
            if (fs.existsSync(certsDir)) {
                // Limpar todos os arquivos .p12 antigos para evitar confusão no SDK ou leitura de lixo
                const files = fs.readdirSync(certsDir);
                for (const file of files) {
                    if (file.endsWith('.p12')) {
                        try { fs.unlinkSync(path.join(certsDir, file)); } catch (e) { }
                    }
                }
            } else {
                fs.mkdirSync(certsDir, { recursive: true });
            }

            this.certPath = path.join(certsDir, `efi_cert_${Date.now()}.p12`);
            fs.writeFileSync(this.certPath, buffer);

            this.configure = {
                sandbox: credentials.sandbox === 'true',
                client_id: credentials.clientId,
                client_secret: credentials.clientSecret,
                certificate: this.certPath,
            };

            console.log(`[EfipayProvider] Initialized. Env: ${this.configure.sandbox ? 'Sandbox' : 'Produção'}. Path: ${this.certPath}`);
        } catch (error: any) {
            console.error('[EfipayProvider] constructor FATAL ERROR:', error.message);
        }
    }

    private getClient() {
        return new EfiPay(this.configure);
    }

    async createPixPayment(amount: number, email: string, description: string): Promise<PixResult> {
        try {
            const efipay = this.getClient();

            const txid = crypto.randomUUID().replace(/-/g, '').substring(0, 35);
            const expMin = 30;

            // Priorizar chave do banco de dados, senão usar sandbox default ou env
            let pixKey = this.credentials.pixKey;
            if (!pixKey) {
                pixKey = this.configure.sandbox ? '11111111111' : (process.env.EFI_PIX_KEY || '');
            }

            const body = {
                calendario: { expiracao: expMin * 60 },
                valor: { original: amount.toFixed(2) },
                chave: pixKey,
                solicitacaoPagador: description,
            };

            console.log(`[EfipayProvider] Creating Pix. Key: ${pixKey}, Amount: ${amount}. Cert: ${this.certPath}`);

            const pixRes = await efipay.pixCreateImmediateCharge([], body);
            const txId = pixRes.txid;

            // Generate QR Code
            const qrRes = await efipay.pixGenerateQRCode([], { id: txId });

            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + expMin);

            return {
                externalId: txId,
                pixCode: qrRes.qrcode,
                pixQrBase64: qrRes.imagemQrcode,
                expiresAt,
            };
        } catch (error: any) {
            const errorMsg = error.message || (typeof error === 'string' ? error : 'Erro desconhecido');
            console.error('[EfipayProvider] Error creating PIX:', errorMsg);

            if (error.erros) {
                console.error('[EfipayProvider] EfiPay API Errors:', JSON.stringify(error.erros, null, 2));
            } else if (error.error_description) {
                console.error('[EfipayProvider] EfiPay Auth Error:', error.error_description);
            } else if (typeof error !== 'string') {
                console.error('[EfipayProvider] Full Error:', JSON.stringify(error, null, 2));
            }
            throw new Error(errorMsg);
        }
    }

    async getPaymentStatus(externalId: string): Promise<'PENDING' | 'APPROVED' | 'CANCELLED' | 'EXPIRED'> {
        try {
            const efipay = this.getClient();
            const res = await efipay.pixDetailCharge([], { txid: externalId });

            switch (res.status) {
                case 'CONCLUIDA': return 'APPROVED';
                case 'REMOVIDA_PELO_USUARIO_RECEBEDOR':
                case 'REMOVIDA_PELO_PSP': return 'CANCELLED';
                default: return 'PENDING';  // ATIVA
            }
        } catch (error) {
            console.error('[EfipayProvider] Error getting payment status:', error.message);
            return 'PENDING';
        }
    }

    async createPayout(amount: number, pixKey: string, description: string, recipientEmail?: string): Promise<{ id: string; status: string }> {
        // Pix key of the sender (us) - Prioritize payoutPixKey if available
        let myPixKey = this.credentials.payoutPixKey || this.credentials.pixKey;
        if (!myPixKey) {
            myPixKey = this.configure.sandbox ? '11111111111' : (process.env.EFI_PIX_KEY || '');
        }

        try {
            const efipay = this.getClient();

            // EfiPay Pix Send (Money Out) - Correct Schema (Requires pagador and Webhook)
            const body = {
                valor: amount.toFixed(2),
                pagador: {
                    chave: myPixKey
                },
                favorecido: {
                    chave: pixKey,
                },
            };

            console.log(`[EfipayProvider] Trying Pix Send. MyKey: ${myPixKey}, To: ${pixKey}`);

            const idEnvio = crypto.randomUUID().replace(/-/g, '');
            const params = { idEnvio };

            console.log(`[EfipayProvider] Sending Pix Payout. Key: ${pixKey}, Amount: ${amount}, idEnvio: ${idEnvio}`);

            const res = await efipay.pixSend(params, body);

            return {
                id: res.idEnvio || idEnvio,
                status: res.status || 'PROCESSING',
            };
        } catch (error: any) {
            const errorMsg = error.message || (typeof error === 'string' ? error : 'Erro interno na EFI');
            console.error('[EfipayProvider] Error in createPayout:', errorMsg);

            // LOG COMPLETO DO ERRO PARA DIAGNÓSTICO
            console.dir(error, { depth: null });

            if (error.erros) {
                console.error('[EfipayProvider] EfiPay Payout API Errors:', JSON.stringify(error.erros, null, 2));
                const detailedMsg = error.erros.map((e: any) => e.mensagem || e.msg).join(', ');

                const hasWebhookError = error.erros.some((e: any) => e.chave === 'conta_chave_sem_webhook' || e.mensagem?.includes('webhook'));
                if (hasWebhookError) {
                    throw new Error(`A EFI exige que sua chave Pix (${myPixKey}) tenha um Webhook cadastrado para autorizar envios. Instruções no walkthrough.`);
                }

                throw new Error(detailedMsg || errorMsg);
            }

            if (error.nome === 'conta_chave_sem_webhook') {
                throw new Error(`A EFI exige que sua chave Pix (${myPixKey}) tenha um Webhook cadastrado para autorizar envios. Instruções no walkthrough.`);
            }

            if (error.error_description) {
                console.error('[EfipayProvider] EfiPay Payout Auth Error:', error.error_description);
                throw new Error(error.error_description);
            }

            throw new Error(errorMsg);
        }
    }

    async getPayoutStatus(idEnvio: string): Promise<'PENDING' | 'APPROVED' | 'FAILED'> {
        try {
            const efipay = this.getClient();
            const res = await efipay.pixSendDetail([], { idEnvio });

            console.log(`[EfipayProvider] Payout Status for ${idEnvio}: ${res.status}`);

            switch (res.status) {
                case 'REALIZADO': return 'APPROVED';
                case 'NAO_REALIZADO': return 'FAILED';
                default: return 'PENDING';
            }
        } catch (error: any) {
            console.error('[EfipayProvider] Error getting payout status:', error.message);
            return 'PENDING';
        }
    }
}
