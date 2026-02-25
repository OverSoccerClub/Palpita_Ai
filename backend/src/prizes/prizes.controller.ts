import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { PrizesService } from './prizes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('prizes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrizesController {
    constructor(private prizesService: PrizesService) { }

    @Post('calculate/:roundId')
    @Roles(UserRole.ADMIN)
    async calculateHits(@Param('roundId') roundId: string) {
        return this.prizesService.calculateRoundHits(roundId);
    }

    @Post('distribute/:roundId')
    @Roles(UserRole.ADMIN)
    async distributePrizes(@Param('roundId') roundId: string) {
        return this.prizesService.distributePrizes(roundId);
    }
}
