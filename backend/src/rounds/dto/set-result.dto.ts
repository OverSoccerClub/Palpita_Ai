import { IsEnum, IsNotEmpty } from 'class-validator';
import { Prediction } from '@prisma/client';

export class SetResultDto {
    @IsEnum(Prediction)
    @IsNotEmpty()
    result: Prediction;
}
