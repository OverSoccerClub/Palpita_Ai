import { Controller, Post, Body, Get, UseGuards, Param, NotFoundException } from '@nestjs/common';
import { BetsService } from './bets.service';
import { RoundsService } from '../rounds/rounds.service';
import { PlaceBetDto } from './dto/place-bet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Prediction } from '@prisma/client';

@Controller('bets')
@UseGuards(JwtAuthGuard)
export class BetsController {
    constructor(
        private betsService: BetsService,
        private roundsService: RoundsService,
    ) { }

    @Post('place')
    async placeBet(
        @GetUser('id') userId: string,
        @Body() placeBetDto: PlaceBetDto,
    ) {
        return this.betsService.placeBet(userId, placeBetDto);
    }

    @Post('random/:roundId')
    async placeRandomBet(
        @GetUser('id') userId: string,
        @Param('roundId') roundId: string,
    ) {
        const round = await this.roundsService.findById(roundId);
        if (!round) throw new NotFoundException('Concurso não encontrado');

        const predictions = round.matches.map((match) => {
            const options: Prediction[] = [Prediction.H, Prediction.D, Prediction.A];
            const randomPrediction = options[Math.floor(Math.random() * options.length)];
            return {
                matchId: match.id,
                prediction: randomPrediction,
            };
        });

        return this.betsService.placeBet(userId, { roundId, predictions });
    }

    @Get('history')
    async getHistory(@GetUser('id') userId: string) {
        return this.betsService.getHistory(userId);
    }

    @Get(':id')
    async getById(
        @Param('id') id: string,
        @GetUser('id') userId: string,
    ) {
        return this.betsService.getById(id, userId);
    }
}
