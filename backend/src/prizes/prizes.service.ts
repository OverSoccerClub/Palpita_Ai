import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class PrizesService {
    constructor(private prisma: PrismaService) { }

    async calculateRoundHits(roundId: string) {
        const round = await this.prisma.round.findUnique({
            where: { id: roundId },
            include: {
                matches: true,
                betSlips: { include: { matches: true } }
            },
        });

        if (!round) throw new NotFoundException('Concurso não encontrado');
        if (round.matches.some(m => !m.result)) {
            throw new BadRequestException('Todos os jogos devem ter resultados antes de processar');
        }

        // Process each bet slip
        const updates = round.betSlips.map(async (slip) => {
            let hits = 0;
            for (const prediction of slip.matches) {
                const match = round.matches.find(m => m.id === prediction.matchId);
                if (match && match.result === prediction.prediction) {
                    hits++;
                    await this.prisma.betSlipMatch.update({
                        where: { id: prediction.id },
                        data: { isCorrect: true },
                    });
                } else {
                    await this.prisma.betSlipMatch.update({
                        where: { id: prediction.id },
                        data: { isCorrect: false },
                    });
                }
            }

            return this.prisma.betSlip.update({
                where: { id: slip.id },
                data: { totalAcertos: hits },
            });
        });

        await Promise.all(updates);

        // Update round status to CLOSED (meaning hits are calculated)
        return this.prisma.round.update({
            where: { id: roundId },
            data: { status: 'CLOSED' },
        });
    }

    async distributePrizes(roundId: string) {
        const round = await this.prisma.round.findUnique({
            where: { id: roundId },
            include: { betSlips: { include: { user: { include: { wallet: true } } } } },
        });

        if (!round) throw new NotFoundException('Concurso não encontrado');
        if (round.status !== 'CLOSED') throw new BadRequestException('O concurso deve estar no status CLOSED (acertos calculados)');

        const totalRevenue = round.betSlips.reduce((acc, slip) => acc + Number(slip.price), 0);
        const prizePool = totalRevenue * 0.70;
        const reserveFundAmount = totalRevenue * 0.025;

        const winners14 = round.betSlips.filter(s => s.totalAcertos === 14);
        const winners13 = round.betSlips.filter(s => s.totalAcertos === 13);
        const winners12 = round.betSlips.filter(s => s.totalAcertos === 12);

        const prize14 = prizePool * 0.70;
        const prize13 = prizePool * 0.15;
        const prize12 = prizePool * 0.15;

        return this.prisma.$transaction(async (tx) => {
            // 1. Update Reserve Fund
            await tx.reserveFund.updateMany({
                data: { currentBalance: { increment: reserveFundAmount } }
            });

            // 2. Distribute Tier 12
            if (winners12.length > 0) {
                const individualPrize = prize12 / winners12.length;
                for (const winner of winners12) {
                    await this.payWinner(tx, winner, individualPrize, round.title, 12);
                }
            }

            // 3. Distribute Tier 13
            if (winners13.length > 0) {
                const individualPrize = prize13 / winners13.length;
                for (const winner of winners13) {
                    await this.payWinner(tx, winner, individualPrize, round.title, 13);
                }
            }

            // 4. Distribute Tier 14 (and handle accumulation)
            if (winners14.length > 0) {
                const individualPrize = prize14 / winners14.length;
                for (const winner of winners14) {
                    await this.payWinner(tx, winner, individualPrize, round.title, 14);
                }
            } else {
                // Accumulate tier 14 for next round
                // This would involve creating/updating the AccumulatedPrize record
            }

            // 5. Finalize Round
            await tx.round.update({
                where: { id: roundId },
                data: { status: 'FINALIZED', poolAmount: prizePool },
            });

            return {
                totalRevenue,
                prizePool,
                winners: {
                    14: winners14.length,
                    13: winners13.length,
                    12: winners12.length
                }
            };
        });
    }

    private async payWinner(tx: any, betSlip: any, amount: number, roundTitle: string, tier: number) {
        if (!betSlip.user.wallet) return;

        // Update BetSlip
        await tx.betSlip.update({
            where: { id: betSlip.id },
            data: { prizeAmount: amount }
        });

        // Update Wallet
        await tx.wallet.update({
            where: { id: betSlip.user.wallet.id },
            data: { balance: { increment: amount } }
        });

        // Create Transaction Record
        await tx.transaction.create({
            data: {
                walletId: betSlip.user.wallet.id,
                type: 'PRIZE',
                status: 'SUCCESS',
                amount: amount,
                description: `Prêmio ${tier} Acertos - Concurso: ${roundTitle}`,
            }
        });
    }
}
