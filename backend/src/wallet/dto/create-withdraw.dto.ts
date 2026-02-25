import { IsNumber, IsPositive, Min, IsString, IsNotEmpty } from 'class-validator';

export class CreateWithdrawDto {
    @IsNumber()
    @IsPositive()
    @Min(20) // Minimum withdraw R$ 20,00
    amount: number;

    @IsString()
    @IsNotEmpty()
    pixKey: string;
}
