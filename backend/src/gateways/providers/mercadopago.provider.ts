import { IPaymentGateway, PixResult } from '../gateway.interface';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export class MercadopagoProvider implements IPaymentGateway {
    private client: MercadoPagoConfig;
    private accessToken: string;

    constructor(credentials: Record<string, string>) {
        this.accessToken = credentials.accessToken;
        this.client = new MercadoPagoConfig({ accessToken: this.accessToken });
    }

    async createPixPayment(amount: number, email: string, description: string): Promise<PixResult> {
        try {
            const payment = new Payment(this.client);
            const res = await payment.create({
                body: {
                    transaction_amount: amount,
                    description,
                    payment_method_id: 'pix',
                    payer: { email },
                },
            }) as any;

            console.log(`[MP Provider] Response status: ${res.status}`);

            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 30);

            return {
                externalId: String(res.id),
                pixCode: res.point_of_interaction?.transaction_data?.qr_code ?? '',
                pixQrBase64: res.point_of_interaction?.transaction_data?.qr_code_base64 ?? '',
                expiresAt,
            };
        } catch (err: any) {
            console.error(`[MP Provider] API Error:`, err.response?.data || err.message);
            throw err;
        }
    }

    async getPaymentStatus(externalId: string): Promise<'PENDING' | 'APPROVED' | 'CANCELLED' | 'EXPIRED'> {
        const payment = new Payment(this.client);
        const res = await payment.get({ id: externalId }) as any;

        switch (res.status) {
            case 'approved': return 'APPROVED';
            case 'cancelled': return 'CANCELLED';
            case 'expired': return 'EXPIRED';
            default: return 'PENDING';
        }
    }

    async createPayout(amount: number, pixKey: string, description: string, recipientEmail?: string): Promise<{ id: string; status: string }> {
        // Mercado Pago "Money Out" (Pix Payout)
        // Endpoint correto: POST /v1/transaction-intents/process
        // x-enforce-signature: false -> Não exige assinatura criptográfica
        try {
            const externalRef = `payout-${Date.now()}`;

            const response = await fetch('https://api.mercadopago.com/v1/transaction-intents/process', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                    'X-Idempotency-Key': externalRef,
                    'X-Enforce-Signature': 'false'
                },
                body: JSON.stringify({
                    external_reference: externalRef,
                    point_of_interaction: {
                        type: 'PSP_TRANSFER'
                    },
                    transaction: {
                        from: {
                            accounts: [
                                {
                                    amount: {
                                        value: amount,
                                        currency: 'BRL'
                                    }
                                }
                            ]
                        },
                        to: {
                            accounts: [
                                {
                                    amount: {
                                        value: amount,
                                        currency: 'BRL'
                                    },
                                    chave_pix: pixKey
                                }
                            ]
                        }
                    }
                })
            });

            const data = await response.json() as any;

            if (!response.ok) {
                console.error('[MP Payout Error]', JSON.stringify(data, null, 2));
                throw new Error(data.message || JSON.stringify(data.cause || data));
            }

            return {
                id: String(data.id),
                status: data.status || 'PENDING'
            };
        } catch (err: any) {
            console.error('Erro no Payout MP:', err.message);
            throw new Error(`Falha no processamento automático: ${err.message}`);
        }
    }

    async getPayoutStatus(idEnvio: string): Promise<'PENDING' | 'APPROVED' | 'FAILED'> {
        // Mercado Pago check payout status logic would go here
        return 'APPROVED';
    }
}
