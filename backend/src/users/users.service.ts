import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(registerDto: RegisterDto) {
        const { email, cpf, password, birthDate, ...data } = registerDto;

        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [{ email }, { cpf }],
            },
        });

        if (existingUser) {
            throw new ConflictException('Usuário com este email ou CPF já existe.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        return this.prisma.user.create({
            data: {
                ...data,
                email,
                cpf,
                password: hashedPassword,
                // Convert "YYYY-MM-DD" string to a proper Date object
                birthDate: new Date(`${birthDate}T00:00:00.000Z`),
                wallet: {
                    create: {
                        balance: 0,
                    },
                },
            },
            include: {
                wallet: true,
            },
        });
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
            include: { wallet: true },
        });
    }

    async findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                wallet: { select: { balance: true } },
                _count: { select: { betSlips: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findById(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
            include: { wallet: true },
        });
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        const data = { ...updateUserDto };

        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        return this.prisma.user.update({
            where: { id },
            data,
            include: { wallet: true },
        });
    }
}
