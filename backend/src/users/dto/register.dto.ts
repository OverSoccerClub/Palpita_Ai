import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^\d{11}$/, { message: 'CPF must be 11 digits' })
    cpf: string;

    @IsString()
    @IsNotEmpty()
    birthDate: string; // ISO string

    @IsString()
    phone?: string;
}
