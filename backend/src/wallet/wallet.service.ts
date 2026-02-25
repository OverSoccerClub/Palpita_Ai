import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { GatewayFactoryService } from '../gateways/gateway-factory.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';

@Injectable()
export class WalletService {
    constructor(
        private prisma: PrismaService,
        private gatewayFactory: GatewayFactoryService,
    ) { }

    async createDeposit(userId: string, dto: CreateDepositDto) {
        const { amount } = dto;
        console.log(`[Wallet] Starting deposit for user ${userId}, amount ${amount}`);

        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { wallet: true },
            });
            if (!user?.wallet) throw new NotFoundException('Carteira não encontrada');

            // Get active gateway provider from DB
            const { provider, gatewayId } = await this.gatewayFactory.getActiveGateway();
            console.log(`[Wallet] Active gateway: ${gatewayId}`);

            // Create PIX payment at gateway
            let pixResult;
            try {
                pixResult = await provider.createPixPayment(
                    amount,
                    user.email,
                    `Depósito Palpita Aí — ${user.name}`,
                );
                console.log(`[Wallet] PIX generated at gateway: ${pixResult.externalId}`);
            } catch (gwErr: any) {
                console.error(`[Wallet] Gateway error generating PIX:`, gwErr.message || gwErr);
                throw new BadRequestException(`Erro ao gerar Pix no gateway: ${gwErr.message || 'Erro desconhecido'}`);
            }

            // Persist transaction + payment order atomically
            const transaction = await this.prisma.transaction.create({
                data: {
                    walletId: user.wallet.id,
                    type: 'DEPOSIT',
                    status: 'PENDING',
                    amount: amount,
                    description: 'Depósito via Pix',
                    externalId: pixResult.externalId,
                    paymentOrder: {
                        create: {
                            gatewayId,
                            externalId: pixResult.externalId,
                            pixCode: pixResult.pixCode,
                            pixQrBase64: pixResult.pixQrBase64,
                            expiresAt: pixResult.expiresAt,
                        },
                    },
                },
                include: { paymentOrder: true },
            });

            return {
                paymentOrderId: transaction.paymentOrder!.id,
                pixCode: pixResult.pixCode,
                pixQrBase64: pixResult.pixQrBase64,
                expiresAt: pixResult.expiresAt,
            };
        } catch (error: any) {
            console.error(`[Wallet] createDeposit FATAL ERROR:`, error);
            throw error;
        }
    }

    async checkPaymentStatus(paymentOrderId: string, userId: string) {
        const order = await this.prisma.paymentOrder.findUnique({
            where: { id: paymentOrderId },
            include: {
                transaction: { include: { wallet: true } },
                gateway: true,
            },
        });
        if (!order) throw new NotFoundException('Ordem não encontrada');
        if (order.transaction.wallet.userId !== userId) throw new BadRequestException('Acesso negado');

        // Already final — return immediately
        if (['APPROVED', 'CANCELLED', 'EXPIRED'].includes(order.status)) {
            return { status: order.status };
        }

        // Check expiry locally
        if (order.expiresAt && new Date() > order.expiresAt) {
            await this.prisma.paymentOrder.update({
                where: { id: order.id },
                data: { status: 'EXPIRED', checkedAt: new Date() },
            });
            return { status: 'EXPIRED' };
        }

        try {
            // Poll the gateway
            const { provider } = await this.gatewayFactory.getGatewayById(order.gatewayId);
            const gwStatus = await provider.getPaymentStatus(order.externalId);
            console.log(`[Wallet] Polling Order ${paymentOrderId}: GW=${gwStatus}, DB=${order.status}`);

            // If status changed to APPROVED, run atomic update
            if (gwStatus === 'APPROVED' && order.status !== 'APPROVED') {
                await this.prisma.$transaction(async (tx) => {
                    const currentOrder = await tx.paymentOrder.findUnique({
                        where: { id: order.id },
                        include: { transaction: { include: { wallet: true } } }
                    });

                    if (!currentOrder || currentOrder.status === 'APPROVED') return;

                    console.log(`[Wallet] APPROVING order ${order.id}. Amount: ${currentOrder.transaction.amount}`);

                    const wallet = await tx.wallet.update({
                        where: { id: currentOrder.transaction.walletId },
                        data: { balance: { increment: currentOrder.transaction.amount } },
                    });

                    await tx.transaction.update({
                        where: { id: currentOrder.transactionId },
                        data: { status: 'SUCCESS' },
                    });

                    await tx.paymentOrder.update({
                        where: { id: currentOrder.id },
                        data: { status: 'APPROVED', checkedAt: new Date() },
                    });

                    console.log(`[Wallet] New balance for user ${currentOrder.transaction.wallet.userId}: ${wallet.balance}`);
                });
                return { status: 'APPROVED' };
            }

            // Other status updates (CANCELLED, EXPIRED)
            if (gwStatus !== 'PENDING' && order.status === 'PENDING') {
                await this.prisma.$transaction([
                    this.prisma.paymentOrder.update({
                        where: { id: order.id },
                        data: { status: gwStatus, checkedAt: new Date() },
                    }),
                    this.prisma.transaction.update({
                        where: { id: order.transactionId },
                        data: { status: gwStatus === 'CANCELLED' ? 'CANCELLED' : 'FAILED' },
                    }),
                ]);
            }

            return { status: gwStatus };
        } catch (err) {
            console.error('[Wallet] Error checking payment:', err);
            return { status: order.status };
        }
    }

    async handleWebhook(data: any) {
        const paymentId = String(data.data?.id ?? data.id ?? '');
        if (!paymentId) return { ok: true };

        console.log(`[Wallet] Received webhook for payment ${paymentId}`);

        try {
            const order = await this.prisma.paymentOrder.findFirst({
                where: { externalId: paymentId },
                include: {
                    transaction: true,
                    gateway: true,
                },
            });

            if (!order) {
                console.log(`[Wallet] Order not found for externalId ${paymentId}`);
                return { ok: true };
            }

            if (order.status === 'APPROVED') {
                console.log(`[Wallet] Order ${order.id} already approved, skipping.`);
                return { ok: true };
            }

            const { provider } = await this.gatewayFactory.getGatewayById(order.gatewayId);
            const gwStatus = await provider.getPaymentStatus(paymentId);

            if (gwStatus === 'APPROVED') {
                await this.prisma.$transaction(async (tx) => {
                    const currentOrder = await tx.paymentOrder.findUnique({
                        where: { id: order.id },
                        include: { transaction: true }
                    });

                    if (!currentOrder || currentOrder.status === 'APPROVED') return;

                    const amount = parseFloat(currentOrder.transaction.amount.toString());
                    console.log(`[Wallet Webhook] APPROVING ${order.id}. Amount: ${amount}`);

                    const wallet = await tx.wallet.update({
                        where: { id: currentOrder.transaction.walletId },
                        data: { balance: { increment: amount } },
                    });

                    await tx.transaction.update({
                        where: { id: currentOrder.transactionId },
                        data: { status: 'SUCCESS' },
                    });

                    await tx.paymentOrder.update({
                        where: { id: order.id },
                        data: { status: 'APPROVED', checkedAt: new Date() },
                    });

                    console.log(`[Wallet Webhook] Success. New balance: ${wallet.balance}`);
                });
            } else if (gwStatus !== 'PENDING') {
                await this.prisma.$transaction([
                    this.prisma.paymentOrder.update({
                        where: { id: order.id },
                        data: { status: gwStatus, checkedAt: new Date() },
                    }),
                    this.prisma.transaction.update({
                        where: { id: order.transactionId },
                        data: { status: gwStatus === 'CANCELLED' ? 'CANCELLED' : 'FAILED' },
                    }),
                ]);
            }
        } catch (e) {
            console.error('[Wallet] Webhook processing failed:', e);
        }
        return { ok: true };
    }

    async withdraw(userId: string, dto: CreateWithdrawDto) {
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: userId },
                include: { wallet: true },
            });
            if (!user?.wallet) throw new NotFoundException('Carteira não encontrada');
            if (Number(user.wallet.balance) < dto.amount) throw new BadRequestException('Saldo insuficiente');

            const transaction = await tx.transaction.create({
                data: {
                    walletId: user.wallet.id,
                    type: 'WITHDRAW',
                    status: 'PENDING',
                    amount: dto.amount,
                    description: `Saque via Pix — Titular: ${user.name} (CPF: ${user.cpf})`,
                },
            });
            await tx.wallet.update({
                where: { id: user.wallet.id },
                data: { balance: { decrement: dto.amount } },
            });
            return { message: 'Solicitação de saque enviada', transactionId: transaction.id };
        });
    }

    async getWallet(userId: string, page: number = 1, limit: number = 10, type?: string, search?: string) {
        const p = Number(page) || 1;
        const l = Number(limit) || 10;
        const skip = (p - 1) * l;

        const where: any = {
            wallet: { userId }
        };

        if (type) {
            where.type = type;
        }

        if (search) {
            where.id = { contains: search.replace('#TX-', ''), mode: 'insensitive' };
        }

        const [transactions, total, wallet] = await Promise.all([
            this.prisma.transaction.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: l,
            }),
            this.prisma.transaction.count({ where }),
            this.prisma.wallet.findUnique({ where: { userId } })
        ]);

        if (!wallet) throw new NotFoundException('Carteira não encontrada');

        return {
            ...wallet,
            transactions,
            pagination: {
                total,
                page: p,
                limit: l,
                totalPages: Math.ceil(total / l)
            }
        };
    }

    async getDebug(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                wallet: {
                    include: {
                        transactions: {
                            include: { paymentOrder: true },
                            orderBy: { createdAt: 'desc' },
                            take: 10
                        }
                    }
                }
            },
        });
        return user;
    }
}
