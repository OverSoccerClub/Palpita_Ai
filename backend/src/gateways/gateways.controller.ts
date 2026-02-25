import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { GatewaysService } from './gateways.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, GatewayProvider } from '@prisma/client';

@Controller('admin/gateways')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class GatewaysController {
    constructor(private gatewaysService: GatewaysService) { }

    @Get()
    findAll() { return this.gatewaysService.findAll(); }

    @Post()
    create(@Body() body: { name: string; provider: GatewayProvider; credentials: Record<string, string>; automaticWithdrawal?: boolean }) {
        return this.gatewaysService.create(body);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: { name?: string; credentials?: Record<string, string>; automaticWithdrawal?: boolean }) {
        return this.gatewaysService.update(id, body);
    }

    @Patch(':id/activate')
    activate(@Param('id') id: string) { return this.gatewaysService.activate(id); }

    @Patch(':id/deactivate')
    deactivate(@Param('id') id: string) { return this.gatewaysService.deactivate(id); }

    @Get(':id/masked')
    getMasked(@Param('id') id: string) { return this.gatewaysService.findOneWithMaskedCredentials(id); }

    @Delete(':id')
    remove(@Param('id') id: string) { return this.gatewaysService.remove(id); }
}
