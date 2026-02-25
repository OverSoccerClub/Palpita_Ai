import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { PlaceBetDto } from './dto/place-bet.dto';

@Injectable()
export class BetsService {
    constructor(private prisma: PrismaService) { }

    async placeBet(userId: string, placeBetDto: PlaceBetDto) {
        const { roundId, predictions } = placeBetDto;
        const BET_PRICE = 10;

        return this.prisma.$transaction(async (tx) => {
            // 1. Get user and check balance
            const user = await tx.user.findUnique({
                where: { id: userId },
                include: { wallet: true },
            });

            if (!user || !user.wallet) throw new NotFoundException('Usuário ou carteira não encontrado');
            if (Number(user.wallet.balance) < BET_PRICE) {
                throw new BadRequestException('Saldo insuficiente');
            }

            // 2. Get round and check status
            const round = await tx.round.findUnique({
                where: { id: roundId },
                include: { matches: true },
            });

            if (!round) throw new NotFoundException('Concurso não encontrado');
            if (round.status !== 'OPEN') throw new ForbiddenException('Este concurso não está mais aberto para palpites');
            if (new Date() > round.endTime) throw new ForbiddenException('O período de palpites para este concurso encerrou');

            // 3. Validate matches (ensure they belong to the round)
            const roundMatchIds = round.matches.map((m) => m.id);
            const invalidMatches = predictions.filter((p) => !roundMatchIds.includes(p.matchId));
            if (invalidMatches.length > 0) {
                throw new BadRequestException('Alguns jogos selecionados não pertencem a este concurso');
            }

            // 4. Deduct balance and record transaction
            await tx.wallet.update({
                where: { id: user.wallet.id },
                data: { balance: { decrement: BET_PRICE } },
            });

            await tx.transaction.create({
                data: {
                    walletId: user.wallet.id,
                    type: 'BET',
                    status: 'SUCCESS',
                    amount: BET_PRICE,
                    description: `Aposta no concurso: ${round.title}`,
                },
            });

            // 5. Create BetSlip
            return tx.betSlip.create({
                data: {
                    userId,
                    roundId,
                    price: BET_PRICE,
                    matches: {
                        create: predictions.map((p) => ({
                            matchId: p.matchId,
                            prediction: p.prediction,
                        })),
                    },
                },
                include: {
                    matches: true,
                },
            });
        });
    }

    async getHistory(userId: string) {
        return this.prisma.betSlip.findMany({
            where: { userId },
            include: {
                round: true,
                matches: {
                    include: { match: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getById(id: string, userId: string) {
        const bet = await this.prisma.betSlip.findUnique({
            where: { id },
            include: {
                round: true,
                matches: {
                    include: { match: true },
                },
                user: { select: { id: true, name: true } },
            },
        });

        if (!bet) throw new NotFoundException('Palpite não encontrado');
        if (bet.userId !== userId) throw new ForbiddenException('Acesso negado');

        return bet;
    }
}
