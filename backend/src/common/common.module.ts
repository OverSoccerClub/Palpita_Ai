import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { MercadopagoService } from './mercadopago/mercadopago.service';

@Module({
  providers: [PrismaService, MercadopagoService],
  exports: [PrismaService, MercadopagoService],
})
export class CommonModule { }
