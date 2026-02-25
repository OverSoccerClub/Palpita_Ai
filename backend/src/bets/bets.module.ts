import { Module } from '@nestjs/common';
import { BetsService } from './bets.service';
import { BetsController } from './bets.controller';
import { CommonModule } from '../common/common.module';
import { RoundsModule } from '../rounds/rounds.module';

@Module({
  imports: [CommonModule, RoundsModule],
  providers: [BetsService],
  controllers: [BetsController]
})
export class BetsModule { }
