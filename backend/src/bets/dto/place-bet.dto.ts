import { IsString, IsNotEmpty, IsArray, ArrayMinSize, ArrayMaxSize, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { Prediction } from '@prisma/client';

export class MatchBetDto {
    @IsString()
    @IsNotEmpty()
    matchId: string;

    @IsEnum(Prediction)
    @IsNotEmpty()
    prediction: Prediction;
}

export class PlaceBetDto {
    @IsString()
    @IsNotEmpty()
    roundId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @ArrayMinSize(14)
    @ArrayMaxSize(14)
    @Type(() => MatchBetDto)
    predictions: MatchBetDto[];
}
