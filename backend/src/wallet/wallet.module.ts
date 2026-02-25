import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { CommonModule } from '../common/common.module';
import { GatewaysModule } from '../gateways/gateways.module';

@Module({
  imports: [CommonModule, GatewaysModule],
  providers: [WalletService],
  controllers: [WalletController],
})
export class WalletModule { }
