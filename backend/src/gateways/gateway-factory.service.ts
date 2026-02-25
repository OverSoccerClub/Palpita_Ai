import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { GatewayProvider } from '@prisma/client';
import { IPaymentGateway } from './gateway.interface';
import { MercadopagoProvider } from './providers/mercadopago.provider';
import { EfipayProvider } from './providers/efipay.provider';

@Injectable()
export class GatewayFactoryService {
    constructor(private prisma: PrismaService) { }

    async getActiveGateway(): Promise<{ provider: IPaymentGateway; gatewayId: string }> {
        const gateway = await this.prisma.paymentGateway.findFirst({
            where: { isActive: true },
        });

        if (!gateway) {
            throw new BadRequestException(
                'Nenhum gateway de pagamento ativo. Configure um em Administração → Gateways.',
            );
        }

        return { provider: this.buildProvider(gateway), gatewayId: gateway.id };
    }

    async getGatewayById(id: string): Promise<{ provider: IPaymentGateway }> {
        const gateway = await this.prisma.paymentGateway.findUnique({ where: { id } });
        if (!gateway) throw new BadRequestException('Gateway não encontrado');
        return { provider: this.buildProvider(gateway) };
    }

    private buildProvider(gateway: any): IPaymentGateway {
        const credentials = gateway.credentials as Record<string, string>;
        switch (gateway.provider) {
            case GatewayProvider.MERCADOPAGO:
                return new MercadopagoProvider(credentials);
            case GatewayProvider.EFIPAY:
                console.log('[GatewayFactory] Building EFIPAY provider...');
                const p = new EfipayProvider(credentials);
                console.log('[GatewayFactory] EFIPAY provider built successfully.');
                return p;
            default:
                throw new BadRequestException(`Provider '${gateway.provider}' não suportado.`);
        }
    }
}
