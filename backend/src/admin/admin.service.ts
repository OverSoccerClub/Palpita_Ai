import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { GatewayFactoryService } from '../gateways/gateway-factory.service';

@Injectable()
export class AdminService {
    constructor(
        private prisma: PrismaService,
        private gatewayFactory: GatewayFactoryService
    ) { }

    async getStats() {
        const [userCount, betCount, activeRounds, totalVolume] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.betSlip.count(),
            this.prisma.round.count({ where: { status: 'OPEN' } }),
            this.prisma.betSlip.aggregate({ _sum: { price: true } }),
        ]);

        const reserveFund = await this.prisma.reserveFund.findFirst();

        return {
            users: userCount,
            bets: betCount,
            activeRounds,
            totalVolume: totalVolume._sum.price || 0,
            reserveFund: reserveFund?.currentBalance || 0,
        };
    }

    async getUsers(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                skip,
                take: limit,
                include: { wallet: true },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count(),
        ]);

        return {
            data: users.map(u => {
                const { password, ...user } = u;
                return user;
            }),
            total,
            page,
            lastPage: Math.ceil(total / limit),
        };
    }

    async getWithdrawals(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [transactions, total] = await Promise.all([
            this.prisma.transaction.findMany({
                where: { type: 'WITHDRAW' },
                skip,
                take: limit,
                include: { wallet: { include: { user: true } } },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.transaction.count({ where: { type: 'WITHDRAW' } }),
        ]);

        return {
            data: transactions,
            total,
            page,
            lastPage: Math.ceil(total / limit),
        };
    }

    async getTransactions(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [transactions, total] = await Promise.all([
            this.prisma.transaction.findMany({
                skip,
                take: limit,
                include: { wallet: { include: { user: true } } },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.transaction.count(),
        ]);

        return {
            data: transactions,
            total,
            page,
            lastPage: Math.ceil(total / limit),
        };
    }

    async approveWithdrawal(id: string) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id },
            include: { wallet: { include: { user: true } } }
        });

        if (!transaction) throw new BadRequestException('Transação não encontrada');
        if (transaction.status !== 'PENDING') throw new BadRequestException('Apenas transações pendentes podem ser aprovadas');

        let payoutResult: any = null;
        try {
            const { provider: gateway, gatewayId } = await this.gatewayFactory.getActiveGateway();
            const gatewayConfig = await this.prisma.paymentGateway.findUnique({ where: { id: gatewayId } }) as any;

            if (gatewayConfig?.automaticWithdrawal) {
                // Trigger automatic payout
                const cpf = transaction.wallet.user.cpf.replace(/\D/g, '');
                payoutResult = await gateway.createPayout(
                    Number(transaction.amount),
                    cpf,
                    `Saque ID: ${transaction.id}`,
                    transaction.wallet.user.email
                );
            }
        } catch (err: any) {
            console.error('Erro no Payout Automático:', err.message);
            throw new BadRequestException(`Falha no processamento automático do Pix: ${err.message}`);
        }

        return this.prisma.transaction.update({
            where: { id },
            data: {
                status: 'SUCCESS',
                description: transaction.description + (payoutResult ? ` (Pago via API: ${payoutResult.id})` : ' (Confirmado Manualmente)')
            },
        });
    }

    async retryWithdrawalPayout(id: string) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id },
            include: { wallet: { include: { user: true } } }
        });

        if (!transaction) throw new BadRequestException('Transação não encontrada');
        // Allow retry if SUCCESS (manual) or FAILED
        if (transaction.status !== 'SUCCESS' && transaction.status !== 'FAILED') {
            throw new BadRequestException('Apenas saques concluídos manualmente ou falhos podem ser retentados');
        }

        let payoutResult: any = null;
        try {
            const { provider: gateway } = await this.gatewayFactory.getActiveGateway();

            const cpf = transaction.wallet.user.cpf.replace(/\D/g, '');
            payoutResult = await gateway.createPayout(
                Number(transaction.amount),
                cpf,
                `Saque ID: ${transaction.id} (Retry)`,
                transaction.wallet.user.email
            );
        } catch (err: any) {
            console.error('Erro no Retry de Payout Automático:', err.message);
            throw new BadRequestException(`Falha no processamento automático do Pix: ${err.message}`);
        }

        return this.prisma.transaction.update({
            where: { id },
            data: {
                status: 'SUCCESS',
                description: (transaction.description || '').split(' (Pago via API:')[0].split(' (Confirmado Manualmente)')[0] + ` (Pago via API: ${payoutResult.id})`
            },
        });
    }

    async rejectWithdrawal(id: string) {
        return this.prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.findUnique({
                where: { id },
                include: { wallet: true },
            });

            if (!transaction) throw new BadRequestException('Transação não encontrada');
            if (transaction.status !== 'PENDING') throw new BadRequestException('Apenas transações pendentes podem ser rejeitadas');

            // Refund user balance
            await tx.wallet.update({
                where: { id: transaction.walletId },
                data: { balance: { increment: transaction.amount } },
            });

            // Update transaction status
            return tx.transaction.update({
                where: { id },
                data: { status: 'CANCELLED', description: transaction.description + ' (Rejeitado pelo Admin — Estornado)' },
            });
        });
    }
}
