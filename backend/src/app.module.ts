import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { WalletModule } from './wallet/wallet.module';
import { RoundsModule } from './rounds/rounds.module';
import { BetsModule } from './bets/bets.module';
import { PrizesModule } from './prizes/prizes.module';
import { AdminModule } from './admin/admin.module';
import { GatewaysModule } from './gateways/gateways.module';

@Module({
  imports: [CommonModule, UsersModule, AuthModule, WalletModule, RoundsModule, BetsModule, PrizesModule, GatewaysModule, AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
