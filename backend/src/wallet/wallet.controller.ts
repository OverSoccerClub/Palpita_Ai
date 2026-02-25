import { Controller, Post, Body, Get, Param, UseGuards, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('wallet')
export class WalletController {
    constructor(private walletService: WalletService) { }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getWallet(
        @GetUser('id') userId: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('type') type?: string,
        @Query('search') search?: string,
    ) {
        return this.walletService.getWallet(userId, page, limit, type, search);
    }

    @UseGuards(JwtAuthGuard)
    @Post('deposit')
    deposit(@GetUser('id') userId: string, @Body() dto: CreateDepositDto) {
        return this.walletService.createDeposit(userId, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('payment-status/:orderId')
    checkStatus(@GetUser('id') userId: string, @Param('orderId') orderId: string) {
        return this.walletService.checkPaymentStatus(orderId, userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('withdraw')
    withdraw(@GetUser('id') userId: string, @Body() dto: CreateWithdrawDto) {
        return this.walletService.withdraw(userId, dto);
    }

    @Post('webhook')
    @HttpCode(HttpStatus.OK)
    handleWebhook(@Body() data: any) {
        return this.walletService.handleWebhook(data);
    }
}
