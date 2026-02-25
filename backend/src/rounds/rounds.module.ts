import { Module } from '@nestjs/common';
import { RoundsService } from './rounds.service';
import { RoundsController } from './rounds.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  providers: [RoundsService],
  controllers: [RoundsController],
  exports: [RoundsService]
})
export class RoundsModule { }
