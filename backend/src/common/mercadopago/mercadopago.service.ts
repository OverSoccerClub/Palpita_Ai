import { Injectable } from '@nestjs/common';
import { MercadoPagoConfig, Payment } from 'mercadopago';

@Injectable()
export class MercadopagoService {
    private client: MercadoPagoConfig;

    constructor() {
        this.client = new MercadoPagoConfig({
            accessToken: process.env.MP_ACCESS_TOKEN || 'YOUR_ACCESS_TOKEN',
        });
    }

    async createPixPayment(amount: number, userEmail: string, description: string) {
        const payment = new Payment(this.client);

        const body = {
            transaction_amount: amount,
            description: description,
            payment_method_id: 'pix',
            payer: {
                email: userEmail,
            },
        };

        return payment.create({ body });
    }
}
