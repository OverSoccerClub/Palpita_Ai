import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { GatewayProvider, OrderStatus } from '@prisma/client';

@Injectable()
export class GatewaysService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        console.log('[GatewaysService] Finding all gateways...');
        try {
            const results = await this.prisma.paymentGateway.findMany({
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true, name: true, provider: true,
                    isActive: true, automaticWithdrawal: true,
                    createdAt: true, updatedAt: true,
                },
            });
            console.log(`[GatewaysService] Query finished. Count: ${results.length}`);
            console.log(`[GatewaysService] Found ${results.length} gateways`);
            return results;
        } catch (error: any) {
            console.error('[GatewaysService] Error in findAll:', error);
            throw error;
        }
    }

    async create(dto: { name: string; provider: GatewayProvider; credentials: Record<string, string>; automaticWithdrawal?: boolean }) {
        console.log('[GatewaysService] Creating gateway:', dto.name, dto.provider);
        try {
            const result = await this.prisma.paymentGateway.create({
                data: {
                    name: dto.name,
                    provider: dto.provider,
                    credentials: dto.credentials,
                    automaticWithdrawal: dto.automaticWithdrawal ?? true
                } as any,
            });
            console.log('[GatewaysService] Gateway created successfully:', result.id);
            return result;
        } catch (error: any) {
            console.error('[GatewaysService] Error in create:', error);
            throw error;
        }
    }

    async update(id: string, dto: { name?: string; credentials?: Record<string, string>; automaticWithdrawal?: boolean }) {
        const gw = await this.prisma.paymentGateway.findUnique({ where: { id } });
        if (!gw) throw new NotFoundException('Gateway não encontrado');

        const updateData: any = {};
        if (dto.name !== undefined) updateData.name = dto.name;
        if (dto.automaticWithdrawal !== undefined) updateData.automaticWithdrawal = dto.automaticWithdrawal;

        if (dto.credentials) {
            // Only update credentials that were actually changed (not masked)
            const currentCreds = gw.credentials as Record<string, string>;
            const newCreds = { ...currentCreds };
            let hasChanges = false;

            for (const [key, value] of Object.entries(dto.credentials)) {
                if (value !== '••••••••') {
                    newCreds[key] = value;
                    hasChanges = true;
                }
            }

            if (hasChanges) {
                updateData.credentials = newCreds;
            }
        }

        return this.prisma.paymentGateway.update({
            where: { id },
            data: updateData,
        });
    }

    async activate(id: string) {
        const gw = await this.prisma.paymentGateway.findUnique({ where: { id } });
        if (!gw) throw new NotFoundException('Gateway não encontrado');

        // Deactivate all, then activate target (only 1 active at a time)
        await this.prisma.paymentGateway.updateMany({ data: { isActive: false } });
        return this.prisma.paymentGateway.update({ where: { id }, data: { isActive: true } });
    }

    async deactivate(id: string) {
        return this.prisma.paymentGateway.update({ where: { id }, data: { isActive: false } });
    }

    async remove(id: string) {
        const gw = await this.prisma.paymentGateway.findUnique({ where: { id } });
        if (!gw) throw new NotFoundException('Gateway não encontrado');
        return this.prisma.paymentGateway.delete({ where: { id } });
    }

    // Mask credentials for display (show only key names, not values)
    async findOneWithMaskedCredentials(id: string) {
        console.log(`[GatewaysService] Finding masked gateway for ID: ${id}`);
        try {
            const gw = await this.prisma.paymentGateway.findUnique({ where: { id } });
            if (!gw) {
                console.error(`[GatewaysService] Gateway not found: ${id}`);
                throw new NotFoundException('Gateway não encontrado');
            }

            const creds = (gw.credentials || {}) as Record<string, any>;
            const maskedCreds = Object.fromEntries(
                Object.keys(creds).map(k => [k, '••••••••'])
            );

            console.log(`[GatewaysService] Masked gateway found for ID: ${id}`);
            return { ...gw, credentials: maskedCreds };
        } catch (error: any) {
            console.error(`[GatewaysService] Error in findOneWithMaskedCredentials for ID ${id}:`, error);
            throw error;
        }
    }
}
