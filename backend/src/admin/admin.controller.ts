import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
    constructor(private adminService: AdminService) { }

    @Get('stats')
    async getStats() {
        return this.adminService.getStats();
    }

    @Get('users')
    async getUsers(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.adminService.getUsers(Number(page) || 1, Number(limit) || 10);
    }

    @Get('transactions')
    async getTransactions(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.adminService.getTransactions(Number(page) || 1, Number(limit) || 20);
    }

    @Get('withdrawals')
    async getWithdrawals(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.adminService.getWithdrawals(Number(page) || 1, Number(limit) || 20);
    }

    @Patch('withdrawals/:id/approve')
    async approveWithdrawal(@Param('id') id: string) {
        return this.adminService.approveWithdrawal(id);
    }

    @Patch('withdrawals/:id/reject')
    async rejectWithdrawal(@Param('id') id: string) {
        return this.adminService.rejectWithdrawal(id);
    }

    @Patch('withdrawals/:id/retry-payout')
    async retryWithdrawalPayout(@Param('id') id: string) {
        return this.adminService.retryWithdrawalPayout(id);
    }
}
