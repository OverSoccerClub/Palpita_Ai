import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateRoundDto } from './dto/create-round.dto';
import { SetResultDto } from './dto/set-result.dto';
@Injectable()
export class RoundsService {
    constructor(private prisma: PrismaService) { }

    async create(createRoundDto: CreateRoundDto) {
        const { matches, ...roundData } = createRoundDto;

        return this.prisma.round.create({
            data: {
                ...roundData,
                matches: {
                    create: matches.map((match) => ({
                        ...match,
                        startTime: new Date(match.startTime),
                    })),
                },
                startTime: new Date(roundData.startTime),
                endTime: new Date(roundData.endTime),
            },
            include: {
                matches: true,
            },
        });
    }

    async findAll() {
        return this.prisma.round.findMany({
            include: { _count: { select: { matches: true } } },
            orderBy: { startTime: 'desc' },
        });
    }

    async findActive() {
        return this.prisma.round.findMany({
            where: {
                status: 'OPEN',
                endTime: { gt: new Date() },
            },
            include: {
                matches: true,
            },
            orderBy: { startTime: 'asc' },
        });
    }

    async findById(id: string) {
        const round = await this.prisma.round.findUnique({
            where: { id },
            include: {
                matches: { orderBy: { startTime: 'asc' } },
                _count: { select: { betSlips: true } },
            },
        });

        if (!round) throw new NotFoundException('Concurso não encontrado');
        return round;
    }

    async setMatchResult(matchId: string, setResultDto: SetResultDto) {
        return this.prisma.match.update({
            where: { id: matchId },
            data: { result: setResultDto.result },
        });
    }
}
