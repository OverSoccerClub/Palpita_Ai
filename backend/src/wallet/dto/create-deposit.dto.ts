import { IsNumber, IsPositive, Min } from 'class-validator';

export class CreateDepositDto {
    @IsNumber()
    @IsPositive()
    @Min(10) // Minimum deposit R$ 10,00
    amount: number;
}
