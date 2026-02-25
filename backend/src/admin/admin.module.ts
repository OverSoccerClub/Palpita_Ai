import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { GatewaysModule } from '../gateways/gateways.module';

@Module({
    imports: [CommonModule, GatewaysModule],
    providers: [AdminService],
    controllers: [AdminController]
})
export class AdminModule { }
