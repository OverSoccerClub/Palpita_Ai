import { Controller, Get, Post, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { RoundsService } from './rounds.service';
import { CreateRoundDto } from './dto/create-round.dto';
import { SetResultDto } from './dto/set-result.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('rounds')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoundsController {
    constructor(private roundsService: RoundsService) { }

    @Get()
    async findAll() {
        return this.roundsService.findAll();
    }

    @Get('active')
    async findActive() {
        return this.roundsService.findActive();
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.roundsService.findById(id);
    }

    @Post()
    @Roles(UserRole.ADMIN)
    async create(@Body() createRoundDto: CreateRoundDto) {
        return this.roundsService.create(createRoundDto);
    }

    @Patch('match/:matchId/result')
    @Roles(UserRole.ADMIN)
    async setResult(
        @Param('matchId') matchId: string,
        @Body() setResultDto: SetResultDto,
    ) {
        return this.roundsService.setMatchResult(matchId, setResultDto);
    }
}
