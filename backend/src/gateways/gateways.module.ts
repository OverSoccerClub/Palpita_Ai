import { Module } from '@nestjs/common';
import { GatewaysController } from './gateways.controller';
import { GatewaysService } from './gateways.service';
import { GatewayFactoryService } from './gateway-factory.service';
import { CommonModule } from '../common/common.module';

@Module({
    imports: [CommonModule],
    controllers: [GatewaysController],
    providers: [GatewaysService, GatewayFactoryService],
    exports: [GatewaysService, GatewayFactoryService],
})
export class GatewaysModule { }
