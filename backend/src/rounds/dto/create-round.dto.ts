import { IsString, IsNotEmpty, IsDateString, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMatchDto {
    @IsString()
    @IsNotEmpty()
    homeTeam: string;

    @IsString()
    @IsOptional()
    homeLogo?: string;

    @IsString()
    @IsNotEmpty()
    awayTeam: string;

    @IsString()
    @IsOptional()
    awayLogo?: string;

    @IsString()
    @IsOptional()
    stadium?: string;

    @IsDateString()
    startTime: string;
}

export class CreateRoundDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsDateString()
    startTime: string;

    @IsDateString()
    endTime: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateMatchDto)
    matches: CreateMatchDto[];
}
